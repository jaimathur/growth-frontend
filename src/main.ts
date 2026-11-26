import './style.css';
import Chart from 'chart.js/auto';
import { api, ApiError, auth } from './api';
import { renderGuide, bindGuide } from './guide';
import type { Category, CashflowPoint, Summary, Transaction, TransactionPage, TxType, User } from './api';

// ---- UI state (all data comes from the API; nothing is seeded or persisted in the browser except the session token)
const PAGE_SIZE = 12;
const today = new Date();
const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
const isoToday = `${ym}-${String(today.getDate()).padStart(2, '0')}`;

type View = 'dashboard' | 'guide';
let view: View = location.hash === '#guide' ? 'guide' : 'dashboard';

let user: User | null = null;
let categories: Category[] = [];
let summary: Summary | null = null;
let cashflow: CashflowPoint[] = [];
let txPage: TransactionPage = { items: [], total: 0, page: 1, page_size: PAGE_SIZE };
let activeFilter: 'All' | TxType = 'All';
let searchText = '';
let page = 1;
let authMode: 'login' | 'register' = 'login';
let chart: Chart | undefined;
let searchTimer: number | undefined;
let editingId: number | null = null;   // null = the modal is adding a new transaction

const app = () => document.querySelector<HTMLDivElement>('#app')!;

function money(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
function messageOf(e: unknown) { return e instanceof ApiError ? e.message : 'Something went wrong. Please try again.'; }
function fail(e: unknown) { if (auth.token) alert(messageOf(e)); }  // 401 already sent us to the login screen
function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join('') || '?';
}
function greeting() {
  const h = today.getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

// ---- data loading
async function loadTransactions() {
  txPage = await api.transactions({
    type: activeFilter === 'All' ? undefined : activeFilter,
    q: searchText.trim() || undefined,
    page, page_size: PAGE_SIZE,
  });
}
async function loadDashboard() {
  [summary, cashflow] = await Promise.all([api.summary(ym), api.cashflow(ym, 6)]);
}
async function loadAll() {
  [categories] = await Promise.all([api.categories(), loadDashboard(), loadTransactions()]);
}
async function reload(fn: () => Promise<unknown>) {
  try { await fn(); render(); } catch (e) { fail(e); }
}

// ---- auth screen
function renderAuth(error = '') {
  const reg = authMode === 'register';
  app().innerHTML = `
  <div class="grid min-h-screen place-items-center px-4">
    <div class="card w-full max-w-sm p-7">
      <div class="mb-6 flex items-center gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-xl text-white">₹</div>
        <div><div class="text-lg font-extrabold tracking-tight">pennywise</div><div class="text-[11px] font-medium text-slate-400">PERSONAL FINANCE</div></div>
      </div>
      <h1 class="text-xl font-extrabold tracking-tight">${reg ? 'Create your account' : 'Welcome back'}</h1>
      <p class="mt-1 mb-5 text-xs text-slate-400">${reg ? 'Start tracking your income and expenses.' : 'Sign in to see your finances.'}</p>
      <form id="authForm" class="space-y-4">
        ${reg ? '<div><label class="mb-1.5 block text-xs font-semibold text-slate-600">Full name</label><input class="field" name="full_name" autocomplete="name" required maxlength="100"></div>' : ''}
        <div><label class="mb-1.5 block text-xs font-semibold text-slate-600">Email</label><input class="field" name="email" type="email" autocomplete="email" required></div>
        <div><label class="mb-1.5 block text-xs font-semibold text-slate-600">Password</label><input class="field" name="password" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" required ${reg ? 'minlength="8"' : ''} maxlength="128">${reg ? '<p class="mt-1 text-[11px] text-slate-400">At least 8 characters.</p>' : ''}</div>
        <div id="authError" class="text-xs font-semibold text-rose-600">${escapeHtml(error)}</div>
        <button class="primary-btn w-full" type="submit">${reg ? 'Create account' : 'Sign in'}</button>
      </form>
      <p class="mt-5 text-center text-xs text-slate-500">${reg ? 'Already have an account?' : 'New here?'}
        <button id="switchAuth" class="font-semibold text-indigo-600">${reg ? 'Sign in' : 'Create an account'}</button></p>
    </div>
  </div>`;
  document.querySelector('#switchAuth')!.addEventListener('click', () => { authMode = reg ? 'login' : 'register'; renderAuth(); });
  document.querySelector<HTMLFormElement>('#authForm')!.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const btn = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
    btn.disabled = true;
    try {
      const email = String(data.get('email')).trim();
      const password = String(data.get('password'));
      user = reg ? await api.register(String(data.get('full_name')).trim(), email, password) : await api.login(email, password);
      await startSession();
    } catch (err) {
      btn.disabled = false;
      renderAuthError(messageOf(err));
    }
  });
}
function renderAuthError(msg: string) {
  const el = document.querySelector('#authError');
  if (el) el.textContent = msg;
}

function resetState() {
  user = null; summary = null; cashflow = []; categories = [];
  txPage = { items: [], total: 0, page: 1, page_size: PAGE_SIZE };
  activeFilter = 'All'; searchText = ''; page = 1; editingId = null;
  chart?.destroy(); chart = undefined;
}
function showLogin(error = '') { resetState(); renderAuth(error); }

async function startSession() {
  app().innerHTML = '<div class="grid min-h-screen place-items-center text-sm text-slate-400">Loading your finances…</div>';
  try { await loadAll(); render(); }
  catch (e) { if (!auth.token) return; showLogin(messageOf(e)); }
}

// ---- shared shell (sidebar) and the "How it was built" page
function sidebarHtml() {
  const on = (v: View) => (view === v ? ' active' : '');
  return `
    <aside class="sidebar fixed inset-y-0 left-0 z-10 w-[245px] border-r border-slate-100 bg-white px-5 py-7">
      <div class="mb-10 flex items-center gap-3 px-2">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-xl text-white">₹</div>
        <div><div class="text-lg font-extrabold tracking-tight">pennywise</div><div class="text-[11px] font-medium text-slate-400">PERSONAL FINANCE</div></div>
      </div>
      <div class="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</div>
      <nav class="space-y-1">
        <a class="sidebar-link${on('dashboard')}" href="#dashboard"><span>▦</span> Dashboard</a>
        <a class="sidebar-link" href="#transactions"><span>⇄</span> Transactions</a>
        <a class="sidebar-link" href="#budgets" id="budgetNav"><span>◷</span> Budgets <span class="ml-auto rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-600">Soon</span></a>
        <a class="sidebar-link" href="#reports" id="reportNav"><span>▤</span> Reports <span class="ml-auto rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-600">Soon</span></a>
        <a class="sidebar-link${on('guide')}" href="#guide"${view === 'guide' ? ' aria-current="page"' : ''}><span>❖</span> How it was built</a>
      </nav>
      <div class="absolute bottom-6 left-5 right-5 rounded-2xl bg-indigo-50 p-4">
        <div class="mb-2 text-lg">💡</div><div class="text-sm font-bold text-slate-800">Small steps add up</div>
        <p class="mt-1 text-xs leading-5 text-slate-500">Track your spending regularly to build better money habits.</p>
      </div>
    </aside>`;
}

function renderGuidePage() {
  if (!user) return;
  app().innerHTML = `
  <div class="min-h-screen">
    ${sidebarHtml()}
    <main class="main-content ml-[245px] px-5 py-7 md:px-9 lg:px-10">
      <header class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Guide</div><h1 class="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">How Pennywise was built</h1><p class="mt-1 text-sm text-slate-500">From a browser-only demo to a full-stack app · Nov 24, 2026</p></div>
        <div class="flex items-center gap-3"><a href="#dashboard" class="ghost-btn min-[901px]:hidden">‹ Dashboard</a><div class="hidden text-right sm:block"><div class="text-sm font-bold text-slate-700">${escapeHtml(user.full_name)}</div><div class="text-xs text-slate-400">${escapeHtml(user.email)}</div></div><div class="grid h-10 w-10 place-items-center rounded-full bg-amber-100 font-bold text-amber-700">${escapeHtml(initials(user.full_name))}</div><button id="logoutBtn" class="ghost-btn">Sign out</button></div>
      </header>
      ${renderGuide()}
      <footer class="py-7 text-center text-[11px] text-slate-400">Pennywise · Your data is private to your account</footer>
    </main>
  </div>`;
  bindEvents();
  bindGuide();
}

function applyRoute() {
  const next: View = location.hash === '#guide' ? 'guide' : 'dashboard';
  if (next === view) return;   // in-page anchors such as #transactions must not re-render
  view = next;
  render();
  if (view === 'guide') window.scrollTo(0, 0);
}

// ---- main app
function render() {
  if (!user || !summary) return;
  if (view === 'guide') { renderGuidePage(); return; }
  const sum = summary;
  const rows = txPage.items;
  const total = txPage.total;
  const from = total ? (txPage.page - 1) * PAGE_SIZE + 1 : 0;
  const to = (txPage.page - 1) * PAGE_SIZE + rows.length;
  const hasPrev = txPage.page > 1;
  const hasNext = to < total;
  const top = sum.top_expense_category;
  const savingsRate = Math.round(sum.savings_rate);

  app().innerHTML = `
  <div class="min-h-screen">
    ${sidebarHtml()}

    <main class="main-content ml-[245px] px-5 py-7 md:px-9 lg:px-10">
      <header class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Overview</div><h1 class="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">${greeting()}! 👋</h1><p class="mt-1 text-sm text-slate-500">Here’s your financial snapshot for ${today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}.</p></div>
        <div class="flex items-center gap-3"><a href="#guide" class="ghost-btn min-[901px]:hidden">How it was built</a><div class="hidden text-right sm:block"><div class="text-sm font-bold text-slate-700">${escapeHtml(user.full_name)}</div><div class="text-xs text-slate-400">${escapeHtml(user.email)}</div></div><div class="grid h-10 w-10 place-items-center rounded-full bg-amber-100 font-bold text-amber-700">${escapeHtml(initials(user.full_name))}</div><button id="logoutBtn" class="ghost-btn">Sign out</button></div>
      </header>

      <section class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="card p-5"><div class="flex items-center justify-between"><span class="text-xs font-semibold text-slate-500">Total balance</span><div class="stat-icon bg-indigo-50 text-indigo-600">₹</div></div><div class="mt-4 text-2xl font-extrabold tracking-tight">${money(sum.balance)}</div><div class="mt-2 text-xs text-slate-400">Net this month</div></div>
        <div class="card p-5"><div class="flex items-center justify-between"><span class="text-xs font-semibold text-slate-500">Total income</span><div class="stat-icon bg-emerald-50 text-emerald-600">↗</div></div><div class="mt-4 text-2xl font-extrabold tracking-tight">${money(sum.income)}</div><div class="mt-2 text-xs text-slate-400">Money received this month</div></div>
        <div class="card p-5"><div class="flex items-center justify-between"><span class="text-xs font-semibold text-slate-500">Total expenses</span><div class="stat-icon bg-rose-50 text-rose-600">↘</div></div><div class="mt-4 text-2xl font-extrabold tracking-tight">${money(sum.expense)}</div><div class="mt-2 text-xs text-slate-400">Money spent this month</div></div>
        <div class="card p-5"><div class="flex items-center justify-between"><span class="text-xs font-semibold text-slate-500">Savings rate</span><div class="stat-icon bg-amber-50 text-amber-600">◉</div></div><div class="mt-4 text-2xl font-extrabold tracking-tight">${savingsRate}%</div><div class="mt-2 text-xs text-slate-400">Of this month’s income</div></div>
      </section>

      <section class="mb-6 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div class="card p-5 md:p-6"><div class="mb-5 flex items-center justify-between"><div><h2 class="font-bold text-slate-800">Cash flow</h2><p class="mt-1 text-xs text-slate-400">Income vs expenses · last 6 months</p></div><span class="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">INR ₹</span></div><div class="h-[235px]"><canvas id="cashflowChart"></canvas></div></div>
        <div class="card p-5 md:p-6"><div class="mb-5"><h2 class="font-bold text-slate-800">Spending breakdown</h2><p class="mt-1 text-xs text-slate-400">Expenses by category this month</p></div>
          ${top ? `<div class="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3"><div class="grid h-10 w-10 place-items-center rounded-xl bg-white text-lg">${escapeHtml(top.icon)}</div><div class="min-w-0 flex-1"><div class="text-xs text-slate-500">Top spending category</div><div class="font-bold">${escapeHtml(top.name)}</div></div><div class="font-bold">${money(top.total)}</div></div>` : '<p class="py-6 text-center text-sm text-slate-400">No expenses this month yet.</p>'}
          <div class="space-y-4">${sum.expense_by_category.slice(0, 4).map(c => `<div><div class="mb-1.5 flex justify-between text-xs"><span class="font-semibold text-slate-600">${escapeHtml(c.name)}</span><span class="font-semibold text-slate-500">${money(c.total)}</span></div><div class="h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-indigo-500" style="width:${Math.max(3, c.percentage)}%"></div></div></div>`).join('')}</div>
        </div>
      </section>

      <section id="transactions" class="card overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3 p-5 md:px-6"><div><h2 class="font-bold text-slate-800">Recent transactions</h2><p class="mt-1 text-xs text-slate-400">A quick look at your latest activity</p></div><button id="addBtn" class="primary-btn">＋ Add transaction</button></div>
        <div class="flex flex-wrap items-center gap-2 border-y border-slate-100 px-5 py-3 md:px-6">
          <div class="flex gap-1 rounded-lg bg-slate-100 p-1">${['All', 'Income', 'Expense'].map(f => `<button data-filter="${f}" class="rounded-md px-3 py-1.5 text-xs font-semibold ${activeFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}">${f}</button>`).join('')}</div>
          <div class="ml-auto"><input id="searchInput" class="field w-[190px] py-2 text-xs" placeholder="⌕  Search transactions..." value="${escapeHtml(searchText)}" /></div>
        </div>
        <div class="overflow-x-auto"><table class="w-full min-w-[650px] text-left"><thead><tr class="text-[10px] font-bold uppercase tracking-wider text-slate-400"><th class="px-6 py-3">Transaction</th><th class="px-4 py-3">Category</th><th class="px-4 py-3">Date</th><th class="px-4 py-3">Payment</th><th class="px-6 py-3 text-right">Amount</th><th class="px-4 py-3"></th></tr></thead><tbody>
          ${rows.length ? rows.map(rowHtml).join('') : '<tr><td colspan="6" class="px-6 py-12 text-center text-sm text-slate-400">No transactions found.</td></tr>'}
        </tbody></table></div>
        <div class="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-xs text-slate-400"><span>Showing ${from}–${to} of ${total} transactions</span>
          <span class="flex items-center gap-2"><button id="prevPage" class="ghost-btn" ${hasPrev ? '' : 'disabled style="opacity:.4;cursor:default"'}>‹ Prev</button><button id="nextPage" class="ghost-btn" ${hasNext ? '' : 'disabled style="opacity:.4;cursor:default"'}>Next ›</button><span>All amounts in INR</span></span></div>
      </section>
      <footer class="py-7 text-center text-[11px] text-slate-400">Pennywise · Your data is private to your account</footer>
    </main>
  </div>
  <div id="modal" class="fixed inset-0 z-30 hidden items-center justify-center bg-slate-950/40 p-4">
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <div class="mb-5 flex items-center justify-between"><div><h3 id="modalTitle" class="text-lg font-extrabold">Add transaction</h3><p id="modalSub" class="mt-1 text-xs text-slate-400">Record income or an expense</p></div><button id="closeModal" class="text-2xl text-slate-400">×</button></div>
      <form id="transactionForm" class="space-y-4">
        <div><label class="mb-1.5 block text-xs font-semibold text-slate-600">Transaction type</label><div class="grid grid-cols-2 gap-2"><label class="rounded-lg border border-slate-200 p-3 text-center text-sm font-semibold"><input type="radio" name="type" value="Expense" checked class="mr-2 accent-indigo-600">Expense</label><label class="rounded-lg border border-slate-200 p-3 text-center text-sm font-semibold"><input type="radio" name="type" value="Income" class="mr-2 accent-indigo-600">Income</label></div></div>
        <div><label class="mb-1.5 block text-xs font-semibold text-slate-600">Title</label><input class="field" name="title" placeholder="e.g. Grocery shopping" required maxlength="70"></div>
        <div class="grid grid-cols-2 gap-3"><div><label class="mb-1.5 block text-xs font-semibold text-slate-600">Amount (₹)</label><input class="field" name="amount" type="number" min="0.01" max="9999999999.99" step="0.01" placeholder="0.00" required></div><div><label class="mb-1.5 block text-xs font-semibold text-slate-600">Category</label><select class="field" name="category_id">${categoryOptions('Expense')}</select></div></div>
        <div class="grid grid-cols-2 gap-3"><div><label class="mb-1.5 block text-xs font-semibold text-slate-600">Date</label><input class="field" name="date" type="date" value="${isoToday}" required></div><div><label class="mb-1.5 block text-xs font-semibold text-slate-600">Payment method</label><select class="field" name="payment_method"><option>UPI</option><option>Cash</option><option>Card</option><option>Bank transfer</option></select></div></div>
        <div id="formError" class="text-xs font-semibold text-rose-600"></div>
        <div class="flex justify-end gap-2 pt-2"><button type="button" id="cancelModal" class="ghost-btn">Cancel</button><button id="saveBtn" class="primary-btn" type="submit">Save transaction</button></div>
      </form>
    </div>
  </div>`;
  renderChart();
  bindEvents();
}

function categoryOptions(type: TxType) {
  return categories.filter(c => c.type === type).map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}

function rowHtml(t: Transaction) {
  const dateLabel = new Date(t.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  return `<tr class="table-row"><td class="px-6 py-3.5"><div class="flex items-center gap-3"><div class="grid h-9 w-9 place-items-center rounded-xl bg-slate-50">${escapeHtml(t.category.icon)}</div><span class="text-sm font-semibold text-slate-700">${escapeHtml(t.title)}</span></div></td><td class="px-4 py-3.5 text-xs text-slate-500">${escapeHtml(t.category.name)}</td><td class="px-4 py-3.5 text-xs text-slate-500">${dateLabel}</td><td class="px-4 py-3.5 text-xs text-slate-500">${escapeHtml(t.payment_method)}</td><td class="px-6 py-3.5 text-right text-sm font-bold ${t.type === 'Income' ? 'text-emerald-600' : 'text-slate-700'}">${t.type === 'Income' ? '+' : '−'} ${money(t.amount)}</td><td class="whitespace-nowrap px-4 py-3.5 text-right"><button data-edit="${t.id}" title="Edit transaction" aria-label="Edit transaction" class="rounded-lg px-2 py-1 text-slate-300 hover:bg-indigo-50 hover:text-indigo-600">✎</button><button data-delete="${t.id}" title="Delete transaction" aria-label="Delete transaction" class="rounded-lg px-2 py-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500">×</button></td></tr>`;
}

function renderChart() {
  const canvas = document.querySelector<HTMLCanvasElement>('#cashflowChart');
  if (!canvas) return;
  chart?.destroy();
  const labels = cashflow.map(p => {
    const [y, m] = p.month.split('-').map(Number);
    return new Date(y!, m! - 1, 1).toLocaleDateString('en-IN', { month: 'short' });
  });
  chart = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [
      { label: 'Income', data: cashflow.map(p => p.income), backgroundColor: '#7777e8', borderRadius: 5, barPercentage: .62 },
      { label: 'Expenses', data: cashflow.map(p => p.expense), backgroundColor: '#f5a5a5', borderRadius: 5, barPercentage: .62 },
    ] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 7, boxHeight: 7, padding: 18, font: { size: 11 } } }, tooltip: { callbacks: { label: c => `${c.dataset.label}: ${money(Number(c.raw))}` } } }, scales: { x: { grid: { display: false }, ticks: { color: '#9aa3b3', font: { size: 11 } } }, y: { beginAtZero: true, grid: { color: '#f0f2f6' }, border: { display: false }, ticks: { color: '#9aa3b3', font: { size: 10 }, callback: v => Number(v) >= 1000 ? `₹${Number(v) / 1000}k` : `₹${v}` } } } },
  });
}

function bindEvents() {
  document.querySelector('#addBtn')?.addEventListener('click', () => openModal());
  document.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(b => b.addEventListener('click', () => {
    const t = txPage.items.find(x => x.id === Number(b.dataset.edit));
    if (t) openModal(t);
  }));
  document.querySelector('#closeModal')?.addEventListener('click', closeModal);
  document.querySelector('#cancelModal')?.addEventListener('click', closeModal);
  document.querySelector('#modal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  document.querySelector('#logoutBtn')?.addEventListener('click', () => { api.logout(); showLogin(); });

  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(b => b.addEventListener('click', () => {
    activeFilter = (b.dataset.filter || 'All') as typeof activeFilter; page = 1;
    reload(loadTransactions);
  }));
  document.querySelector('#prevPage')?.addEventListener('click', () => { page = Math.max(1, page - 1); reload(loadTransactions); });
  document.querySelector('#nextPage')?.addEventListener('click', () => { page += 1; reload(loadTransactions); });

  document.querySelector<HTMLInputElement>('#searchInput')?.addEventListener('input', e => {
    searchText = (e.target as HTMLInputElement).value; page = 1;
    window.clearTimeout(searchTimer);   // debounce: one request after the user pauses typing
    searchTimer = window.setTimeout(async () => {
      try { await loadTransactions(); } catch (err) { fail(err); return; }
      const pos = document.querySelector<HTMLInputElement>('#searchInput')?.selectionStart ?? searchText.length;
      render();
      const input = document.querySelector<HTMLInputElement>('#searchInput');
      input?.focus(); input?.setSelectionRange(pos, pos);
    }, 250);
  });

  document.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await api.deleteTransaction(Number(b.dataset.delete));
      // deleting the last row of a page: step back so we don't land on an empty page
      if (txPage.items.length === 1 && page > 1) page -= 1;
      await Promise.all([loadTransactions(), loadDashboard()]);
      render();
    } catch (e) { fail(e); }
  }));

  // category list follows the selected type (Income and Expense have different categories)
  document.querySelectorAll<HTMLInputElement>('#transactionForm input[name=type]').forEach(r => r.addEventListener('change', () => {
    document.querySelector<HTMLSelectElement>('#transactionForm select[name=category_id]')!.innerHTML = categoryOptions(r.value as TxType);
  }));

  document.querySelector<HTMLFormElement>('#transactionForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const errEl = document.querySelector('#formError')!;
    const amount = Number(data.get('amount'));
    if (!Number.isFinite(amount) || amount <= 0) { errEl.textContent = 'Enter a valid amount.'; return; }
    const btn = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
    btn.disabled = true;
    try {
      const payload = {
        title: String(data.get('title')).trim(), amount,
        type: String(data.get('type')) as TxType, category_id: Number(data.get('category_id')),
        payment_method: String(data.get('payment_method')) as 'UPI', date: String(data.get('date')),
      };
      if (editingId !== null) {
        await api.updateTransaction(editingId, payload);   // keep the current filter/search/page
      } else {
        await api.createTransaction(payload);
        activeFilter = 'All'; searchText = ''; page = 1;   // show the new row at the top
      }
      editingId = null;
      await Promise.all([loadTransactions(), loadDashboard()]);
      render();
    } catch (err) { btn.disabled = false; errEl.textContent = messageOf(err); }
  });

  document.querySelector('#budgetNav')?.addEventListener('click', e => { e.preventDefault(); alert('Budgets are planned for the next version of this demo.'); });
  document.querySelector('#reportNav')?.addEventListener('click', e => { e.preventDefault(); alert('Detailed reports are planned for the next version of this demo.'); });
}
function openModal(t?: Transaction) {
  editingId = t?.id ?? null;
  const form = document.querySelector<HTMLFormElement>('#transactionForm')!;
  form.reset();
  document.querySelector('#formError')!.textContent = '';
  document.querySelector('#modalTitle')!.textContent = t ? 'Edit transaction' : 'Add transaction';
  document.querySelector('#modalSub')!.textContent = t ? 'Update the details below' : 'Record income or an expense';
  document.querySelector('#saveBtn')!.textContent = t ? 'Save changes' : 'Save transaction';
  const type: TxType = t?.type ?? 'Expense';
  form.querySelector<HTMLInputElement>(`input[name=type][value=${type}]`)!.checked = true;
  const select = form.querySelector<HTMLSelectElement>('select[name=category_id]')!;
  select.innerHTML = categoryOptions(type);
  if (t) {
    (form.elements.namedItem('title') as HTMLInputElement).value = t.title;
    (form.elements.namedItem('amount') as HTMLInputElement).value = String(t.amount);
    (form.elements.namedItem('date') as HTMLInputElement).value = t.date;
    (form.elements.namedItem('payment_method') as HTMLSelectElement).value = t.payment_method;
    select.value = String(t.category.id);
  } else {
    (form.elements.namedItem('date') as HTMLInputElement).value = isoToday;
  }
  const m = document.querySelector('#modal'); m?.classList.remove('hidden'); m?.classList.add('flex');
  form.querySelector<HTMLInputElement>('input[name=title]')!.focus();
}
function closeModal() { editingId = null; const m = document.querySelector('#modal'); m?.classList.add('hidden'); m?.classList.remove('flex'); }

// ---- boot
auth.onUnauthorized = () => showLogin('Your session has expired. Please sign in again.');
window.addEventListener('hashchange', applyRoute);
(async function boot() {
  if (!auth.token) return renderAuth();
  try { user = await api.me(); } catch { auth.token = null; return renderAuth(); }
  await startSession();
})();
