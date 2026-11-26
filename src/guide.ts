// "How it was built" page. Static content only: renderGuide() returns an HTML string styled with the
// same Tailwind utilities and component classes (card, ghost-btn, …) as the rest of the app.

import processDiagram1 from './assets/diagrams/process-flow-1.svg';
import processDiagram2 from './assets/diagrams/process-flow-2.svg';
import processDiagram3 from './assets/diagrams/process-flow-3.svg';
import hldDiagram1 from './assets/diagrams/high-level-design-1.svg';
import hldDiagram2 from './assets/diagrams/high-level-design-2.svg';
import hldDiagram3 from './assets/diagrams/high-level-design-3.svg';
import hldDiagram4 from './assets/diagrams/high-level-design-4.svg';
import lldDiagram1 from './assets/diagrams/low-level-design-1.svg';
import lldDiagram2 from './assets/diagrams/low-level-design-2.svg';
import lldDiagram3 from './assets/diagrams/low-level-design-3.svg';
import lldDiagram4 from './assets/diagrams/low-level-design-4.svg';
import lldDiagram5 from './assets/diagrams/low-level-design-5.svg';
import lldDiagram6 from './assets/diagrams/low-level-design-6.svg';
import lldDiagram7 from './assets/diagrams/low-level-design-7.svg';
import lldDiagram8 from './assets/diagrams/low-level-design-8.svg';
import lldDiagram9 from './assets/diagrams/low-level-design-9.svg';
import lldDiagram10 from './assets/diagrams/low-level-design-10.svg';
import lldDiagram11 from './assets/diagrams/low-level-design-11.svg';
import lldDiagram12 from './assets/diagrams/low-level-design-12.svg';

function esc(value: string) {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
/** Escapes text, then turns `code` and **bold** markers into HTML. */
function inline(text: string) {
  return esc(text)
    .replace(/`([^`]+)`/g, '<code class="ic">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>');
}

const p = (text: string) => `<p class="mb-4 text-sm leading-6 text-slate-600">${inline(text)}</p>`;
const h3 = (text: string) => `<h3 class="mb-3 mt-6 text-sm font-bold text-slate-800">${esc(text)}</h3>`;
const h4 = (text: string) => `<h4 class="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">${esc(text)}</h4>`;
const ul = (items: string[]) =>
  `<ul class="mb-4 space-y-2 text-sm leading-6 text-slate-600">${items.map(i => `<li class="flex gap-2.5"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400"></span><span>${inline(i)}</span></li>`).join('')}</ul>`;
const ol = (items: string[]) =>
  `<ol class="mb-4 space-y-2.5 text-sm leading-6 text-slate-600">${items.map((i, n) => `<li class="flex gap-3"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-600">${n + 1}</span><span>${inline(i)}</span></li>`).join('')}</ol>`;
const code = (text: string, copy = false) =>
  `<div class="relative mb-4">${copy ? '<button class="ghost-btn absolute right-2 top-2 bg-white px-2.5 py-1 text-[11px]" data-copy>Copy</button>' : ''}<pre class="overflow-x-auto rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs leading-5 text-slate-700"><code>${esc(text.trim())}</code></pre></div>`;
const table = (head: string[], rows: string[][]) =>
  `<div class="mb-5 overflow-x-auto rounded-xl border border-slate-100"><table class="w-full min-w-[560px] text-left text-xs"><thead class="bg-slate-50"><tr class="text-[10px] font-bold uppercase tracking-wider text-slate-400">${head.map(h => `<th class="px-4 py-3">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr class="table-row align-top">${r.map((c, i) => `<td class="px-4 py-3 leading-5 ${i === 0 ? 'font-semibold text-slate-700' : 'text-slate-500'}">${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const callout = (text: string) =>
  `<div class="mb-4 rounded-2xl bg-indigo-50 p-4 text-sm leading-6 text-slate-600">${inline(text)}</div>`;

function section(id: string, title: string, body: string) {
  return `<section id="guide-${id}" class="card mb-6 scroll-mt-6 p-5 md:p-7"><h2 class="mb-4 text-lg font-extrabold tracking-tight text-slate-900">${esc(title)}</h2>${body}</section>`;
}

// ---- diagrams (HTML, so they follow the theme and wrap on small screens)
function box(title: string, sub: string, tone: 'indigo' | 'slate' | 'emerald' = 'slate') {
  const tones = { indigo: 'bg-indigo-50 text-indigo-700', slate: 'bg-slate-50 text-slate-700', emerald: 'bg-emerald-50 text-emerald-700' };
  return `<div class="flex-1 rounded-xl ${tones[tone]} p-3.5 text-center"><div class="text-xs font-bold">${esc(title)}</div><div class="mt-1 text-[11px] leading-4 opacity-75">${esc(sub)}</div></div>`;
}
const arrow = '<div class="grid place-items-center text-slate-300 lg:px-0.5"><span class="rotate-90 lg:rotate-0">→</span></div>';

function architectureDiagram() {
  return `<figure class="mb-5 rounded-2xl border border-slate-100 p-4">
    <div class="flex flex-col gap-1 lg:flex-row">
      ${box('Browser', 'main.ts UI · api.ts client', 'indigo')}${arrow}
      ${box('Auth dependency', 'verify JWT · reload user')}${arrow}
      ${box('Route handler', 'Pydantic validation · commit()')}${arrow}
      ${box('Repository', 'parameterized SQL · user_id filter')}${arrow}
      ${box('MySQL 8', 'constraints · migrations', 'emerald')}
    </div>
    <div class="mt-3 flex flex-col gap-1 lg:flex-row lg:justify-end">
      <div class="lg:w-[calc(40%-1rem)]">${box('CLI', 'migrate · seed_demo — bypass the API')}</div>${arrow}<div class="lg:w-[18%]">${box('MySQL 8', 'same database', 'emerald')}</div>
    </div>
    <figcaption class="mt-3 text-center text-[11px] text-slate-400">Four backend layers. Only repositories write SQL, and every query is filtered by the logged-in user.</figcaption>
  </figure>`;
}

function flowCard(title: string, steps: string[]) {
  return `<div class="rounded-2xl border border-slate-100 p-4"><div class="mb-3 text-sm font-bold text-slate-800">${esc(title)}</div>${ol(steps).replace('mb-4', 'mb-0 text-xs')}</div>`;
}
function flowDiagram() {
  return `<div class="mb-5 grid gap-4 lg:grid-cols-3">
    ${flowCard('Sign in', [
      '`POST /auth/login` (or `/auth/register`).',
      'Look up the user by email and verify the Argon2id hash (a dummy hash for unknown emails).',
      'Issue a JWT with `sub`, `role`, `iat`, `exp`, `jti`.',
      'The UI stores the token.',
      'Load categories, summary, cash flow and transactions in parallel, then render.',
    ])}
    ${flowCard('Write (add, edit, delete)', [
      'The UI sends the request with the Bearer token.',
      'The auth dependency verifies the token and reloads the user (401 if invalid or deactivated).',
      'Pydantic validates the body (422 on failure).',
      'The repository checks the category and runs the SQL, always with `user_id`.',
      'The route calls `commit()`.',
      'The UI reloads the list and dashboard.',
    ])}
    ${flowCard('Refresh the screen', [
      'The UI requests summary, cash flow and the transaction page.',
      'SQL `SUM` and `GROUP BY` run, filtered by user and date range.',
      'The server fills months with no data with zeros.',
      'The UI re-renders and redraws the Chart.js chart.',
    ])}
  </div>`;
}

/** A pre-rendered Mermaid diagram (source: docs/*.md). Click it to open it full size. */
const diagram = (src: string, alt: string) =>
  `<figure class="mb-5 rounded-2xl border border-slate-100 bg-white p-4"><a href="${src}" target="_blank" rel="noopener" title="Open full size"><img src="${src}" alt="${esc(alt)}" loading="lazy" class="mx-auto h-auto max-w-full"></a></figure>`;

// ---- content
const SECTIONS: { id: string; title: string; body: () => string }[] = [
  {
    id: 'context', title: 'Context and goal', body: () =>
      p('Pennywise began as a browser-only demo and became a full-stack app: a FastAPI REST API, a MySQL 8 database, JWT login, and the original UI rewired to use them. This page explains how it was built so you can repeat the approach on another app.') +
      p('The brief was to analyse the demo in detail, then create a database and backend for it, within a fixed stack:') +
      ul([
        'Backend: Python + FastAPI',
        'Database: MySQL 8, accessed with PyMySQL and direct parameterized SQL (no SQLAlchemy ORM or Core)',
        'Validation: Pydantic',
        'Authentication: JWT + Argon2 password hashing',
        'API: REST under `/api/v1`',
        'Database setup: SQL migration scripts',
        'Features: a user role, transaction CRUD, categories, dashboard summaries, user-level data isolation',
        'Move the dummy data out of the frontend and into the database',
      ]) +
      p('The work happened in four requests: (1) build the backend, database and wiring; (2) review the app for missing requirements and assumptions; (3) add an edit-transaction feature; (4) write the original build document. The result is 37 passing integration tests against a real MySQL 8 server and a browser-verified flow of login, add, edit, delete, search and dashboard.'),
  },
  {
    id: 'demo', title: 'Starting point: the demo', body: () =>
      p('The demo was 214 lines: one `main.ts` (184 lines) that rendered the whole UI as template strings, plus `style.css`, built with Vite, TypeScript, Tailwind and Chart.js. Before designing anything, every behaviour in it was read and turned into a backend requirement.') +
      table(['Found in the demo', 'Backend requirement it created'], [
        ['`Transaction` = id, title, category, date, amount, type (Income/Expense), payment', '`transactions` table; amount as `DECIMAL(12,2)`; type and payment method as ENUMs'],
        ['10 hard-coded category names, with emoji icons chosen in `iconFor()`', '`categories` table with an `icon` column, seeded by a migration'],
        ['Salary and Freelance are income, the rest are expenses, but one dropdown lists them all', 'Categories get a type; a transaction’s type must match its category’s type'],
        ['`seed` array of 9 transactions using `daysAgo(n)`', '`seeds/demo_data.sql` with dates relative to today, loaded for a demo user'],
        ['`localStorage` persistence', 'Replaced by the API; only the login token stays in the browser'],
        ['Dashboard maths in the browser: monthly income, expense, net, savings rate, top category, top 4 category bars', '`GET /dashboard/summary` computed with SQL aggregates'],
        ['6-month income/expense chart with zero months included', '`GET /dashboard/cashflow`, zero-filled on the server'],
        ['Search over title + category, All/Income/Expense filter, first 12 rows only', '`GET /transactions` with `q`, `type`, paging'],
        ['Add and delete only; hard-coded “Demo User”', 'Edit endpoints, registration/login, per-user data'],
        ['Budgets and Reports marked “Soon”', 'Left as placeholders (out of scope)'],
      ]) +
      p('The README’s own suggested next step was the plan: replace the `localStorage` calls with FastAPI endpoints, then add authentication and MySQL.'),
  },
  {
    id: 'decisions', title: 'Stack and key decisions', body: () =>
      p('The stack was fixed by the brief, so the real decisions were what to do inside it. Each choice below traded something off.') +
      table(['Decision', 'Choice', 'Why', 'Cost'], [
        ['Data access', 'PyMySQL, raw SQL, one repository module per table', 'Required by the brief; SQL stays visible and reviewable', 'No automatic mapping; a typo in SQL fails at run time, so tests matter'],
        ['Connections', 'Small hand-written pool; commit explicitly in each write route', 'PyMySQL has no pool; explicit commits avoid depending on when FastAPI runs dependency cleanup', 'Every write route must remember `commit()` (unfinished work is rolled back on release)'],
        ['Category type', '`type` column on categories plus a composite foreign key `(category_id, type)`', 'The database itself rejects an Income in an Expense category', 'Slightly more complex schema'],
        ['System vs custom categories', '`user_id IS NULL` means system, shared and read-only', 'One list for everyone, users can still add their own', 'Uniqueness of system rows is managed by migrations, not by a constraint'],
        ['IDs', '`BIGINT` auto-increment', 'Simple, small indexes', 'Guessable, so isolation must not rely on secrecy (it returns 404 for other users’ rows)'],
        ['Money', '`DECIMAL(12,2)` in the database; JSON number in the API', 'No floating-point drift in storage and sums', 'Float in JSON is fine at 2 decimals but not for large-scale maths'],
        ['JWT', 'HS256, 60-minute access token, no refresh token', 'Simple and stateless', 'No revocation before expiry'],
        ['Passwords', 'Argon2id via `argon2-cffi`, re-hash on login if parameters change', 'Memory-hard and the current recommendation', 'Slow by design, so login needs rate limiting'],
        ['Role model', '`role` ENUM(user, admin) in the schema and JWT; role re-read from the database on every request', 'Role changes apply immediately; admin routes can be added later with `require_role`', 'No admin endpoints yet'],
        ['Frontend', 'Keep the vanilla TypeScript structure; add `api.ts`', 'Smallest change that satisfies the brief', 'Whole-page re-render on state change, as in the demo'],
      ]),
  },
  {
    id: 'architecture', title: 'Architecture', body: () =>
      p('The backend has four layers and one firm rule: only repositories write SQL, and every query they run is filtered by the logged-in user.') +
      architectureDiagram() +
      p('A request enters through the auth dependency, which verifies the token and reloads the user. The route handler validates the body with a Pydantic schema, calls a repository, and commits. Migrations and the seed script reach MySQL through their own command-line entry points, not through the API.') +
      h3('Project layout') +
      code(`
expense-tracker/
  frontend/            src/main.ts (UI), src/api.ts (API client), src/guide.ts (this page)
  backend/
    app/
      main.py          app factory, CORS, /health
      config.py        settings from the environment (.env)
      db.py            PyMySQL connection pool
      security.py      Argon2 hashing, JWT create and decode
      deps.py          get_current_user, require_role
      api/v1/          auth, categories, transactions, dashboard routes
      schemas/         Pydantic request and response models
      repositories/    all SQL, one module per area
      cli/             migrate, seed_demo
    migrations/        V001 to V004 SQL files
    seeds/             demo_data.sql
    tests/             37 integration tests
    db/                create_database.sql`),
  },
  {
    id: 'database', title: 'Database design', body: () =>
      p('Three tables hold the data, and MySQL enforces the rules that must never break, so a bug in the API cannot corrupt it. The schema is created only by SQL migration scripts in `backend/migrations`.') +
      table(['Table', 'Key columns', 'Notes'], [
        ['`users`', '`email` (unique), `full_name`, `password_hash`, `role` ENUM(user, admin), `is_active`, `last_login_at`', 'Email stored lower-case; timestamps in UTC'],
        ['`categories`', '`user_id` (NULL = system), `name`, `type` ENUM(Income, Expense), `icon`, `sort_order`', 'Unique per `(user_id, type, name)`; cascade-deleted with the user'],
        ['`transactions`', '`user_id`, `category_id`, `title` (70), `amount` DECIMAL(12,2), `type`, `payment_method` ENUM(UPI, Cash, Card, Bank transfer), `txn_date`', 'Indexed on `(user_id, txn_date, id)` and `(user_id, type, txn_date)`'],
        ['`schema_migrations`', '`version`, `name`, `checksum`, `applied_at`', 'Written by the migration runner'],
      ]) +
      h3('Rules enforced by the database') +
      ul([
        '`CHECK (amount > 0)`.',
        'Composite foreign key `(category_id, type)` references `categories(id, type)`, so a transaction’s type always equals its category’s type.',
        '`ON DELETE CASCADE` from users to their categories and transactions; `RESTRICT` on a category that transactions still use.',
        'Unique email.',
      ]) +
      h3('Migrations') +
      ol([
        '`V001__create_users.sql`',
        '`V002__create_categories.sql`',
        '`V003__create_transactions.sql`',
        '`V004__seed_system_categories.sql` (the category list that used to be hard-coded in the frontend)',
      ]) +
      p('The runner (`python -m app.cli.migrate`) applies pending files in version order, records a SHA-256 checksum for each, refuses to continue if an applied file was edited, and holds a MySQL advisory lock so two runners cannot race. MySQL commits DDL automatically, so a failed migration cannot be rolled back: keep each file small and add a new version to fix a mistake.') +
      p('The former frontend dummy data lives in `seeds/demo_data.sql`. `python -m app.cli.seed_demo` creates `demo@pennywise.app` and inserts the nine sample transactions with dates relative to today, matching the demo’s `daysAgo(n)`. It is for development only.'),
  },
  {
    id: 'api', title: 'API design', body: () =>
      p('The API is REST and JSON under `/api/v1`, with interactive documentation at `/docs`. Every route except register, login and health requires a Bearer token.') +
      table(['Method and path', 'Purpose'], [
        ['`POST /auth/register`, `POST /auth/login`', 'Return `{access_token, expires_in, user}`; registration always creates role `user`'],
        ['`GET /auth/me`', 'The current user'],
        ['`GET /categories`, `POST /categories`', 'System plus own categories; create a custom one'],
        ['`PATCH /categories/{id}`, `DELETE /categories/{id}`', 'Own categories only; deleting one in use returns 409'],
        ['`GET /transactions`', 'Filters `type`, `category_id`, `q`, `date_from`, `date_to`; paging `page`, `page_size` (max 100)'],
        ['`POST /transactions`', 'Create'],
        ['`GET`, `PUT`, `PATCH`, `DELETE /transactions/{id}`', 'Read, full replace, partial update, delete'],
        ['`GET /dashboard/summary?month=YYYY-MM`', 'Income, expense, balance, savings rate, all-time balance, top category, breakdown'],
        ['`GET /dashboard/cashflow?months=6&end_month=YYYY-MM`', 'Zero-filled monthly series for the chart'],
        ['`GET /health`', 'Database connectivity check'],
      ]) +
      h3('Conventions') +
      ul([
        'Code is layered: route (HTTP) calls repository (SQL); Pydantic schemas validate input and shape output.',
        'Errors are `{"detail": ...}`. Validation failures are 422 with a list of `{loc, msg}`; 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict.',
        'Amounts must be greater than 0 with at most 2 decimals and 10 integer digits; titles are trimmed and 1 to 70 characters.',
        'A transaction’s category must be visible to the user and match its type, otherwise 422.',
        'Search escapes `%` and `_` so they are matched literally.',
        'The client sends the month it means (`month`, `end_month`), so “this month” follows the user’s browser date.',
      ]),
  },
  {
    id: 'auth', title: 'Authentication, authorization and isolation', body: () =>
      p('Every request is tied to one user, and every query that touches personal data is filtered by that user’s id.') +
      ul([
        '**Passwords:** hashed with Argon2id. If the hashing parameters change later, the hash is upgraded at the next successful login.',
        '**Login errors:** the same message for a wrong password and an unknown email, and a dummy hash is verified for unknown emails so response time does not reveal which emails exist.',
        '**Tokens:** HS256 JWT with `sub`, `role`, `iat`, `exp` and `jti`. The algorithm is pinned on decode, so a token cannot choose its own (`alg: none` is rejected), and `exp`, `iat` and `sub` are required. The signing secret must be at least 32 characters or the app will not start.',
        '**Per-request check:** after the token verifies, the user row is read from the database. A deactivated user is rejected immediately and a role change takes effect at once.',
        '**Roles:** public registration cannot set a role, even if the request includes one. `require_role("admin")` is a ready dependency for admin routes.',
        '**Isolation:** every transaction and dashboard query starts with `user_id = <token user>`. Another user’s transaction id returns 404, the same as an id that does not exist, so nothing leaks about what exists. A user cannot file a transaction under another user’s custom category.',
        '**SQL safety:** all values are bound parameters. The few dynamic SQL fragments are constants or whitelisted column names.',
      ]) +
      p('Tests cover each of these behaviours, including forged, expired and unsigned tokens and cross-user reads, edits and deletes.'),
  },
  {
    id: 'flows', title: 'Process flows', body: () =>
      p('The three flows below cover everything the app does: sign in, change a transaction, and redraw the screen. Every authenticated request starts the same way, with the user checked in the database.') +
      flowDiagram() +
      p('Details the picture leaves out:') +
      ul([
        '**Sign in or register:** both return the same payload, a token and the user. The UI stores the token and loads categories, the dashboard and the first page of transactions in parallel.',
        '**Add:** the new transaction is saved, then the UI resets filters and search so the row appears at the top of the list.',
        '**Edit:** the modal is filled from the row already on screen, `PUT /transactions/{id}` replaces the record, and the current filter, search and page are kept.',
        '**Delete:** a confirmation, then `DELETE`; the list and dashboard reload. If the row was the only one on a later page, the UI steps back one page first.',
        '**Dashboard:** the summary (month totals, savings rate, category breakdown) and the six-month series are computed by SQL `SUM` and `GROUP BY` queries filtered by user and date range; the server fills months with no data with zeros.',
        '**Failure paths:** a validation error returns 422 and the form shows the message; a missing or expired token returns 401 and the UI goes back to the sign-in screen; another user’s record returns 404.',
      ]),
  },
  {
    id: 'strategy', title: 'Build strategy', body: () =>
      p('The build went bottom-up, and each layer was proven on a real database before the next one was added. The order mattered more than any single technique.') +
      ol([
        '**Read before designing.** The whole demo was read and every behaviour listed as a requirement. No code was written yet.',
        '**Check the environment.** Python 3.13, Node 22 and the needed packages were confirmed. No Docker daemon was available, so MySQL 8.0 was installed with `apt` and started by hand, giving a real server to test against.',
        '**Schema first.** Migrations and the seed file were written before any Python, because the data model decides the API.',
        '**Plumbing.** Settings, connection pool, password hashing and tokens, and the “current user” dependency.',
        '**Schemas, then repositories, then routes.** Pydantic models define the contract, repositories hold all SQL, and routes only connect the two.',
        '**Run it for real.** Migrations and the seed ran against MySQL and the nine seeded rows were compared with the demo’s array (same titles, amounts, categories, relative dates).',
        '**Tests.** An integration suite was written and run. Constraints were also attacked directly with raw SQL (a mismatched type, a negative amount) to prove the database rejects them.',
        '**Frontend rewiring.** `api.ts`, a login and register screen, then `main.ts` switched from local data to API calls; the seed array and `localStorage` store were deleted.',
        '**End-to-end check in a browser.** A scripted Chromium session logged in, added, searched and deleted, and the dashboard totals were compared with the demo’s expected numbers (₹85,000 income, ₹7,649 expenses).',
        '**Package and clean.** README written, caches and `node_modules` removed, project zipped.',
      ]) +
      p('Two follow-up iterations reused the same loop. The gap review read the finished code and listed assumptions and missing features. The edit feature needed only a frontend change because `PUT` and `PATCH` already existed; it was verified in the browser, including that filters survive an edit.') +
      h3('Working habits that kept the build on track') +
      ul([
        'Gather everything first, then build, then verify; verification was never left to the end.',
        'Test against the real database, not mocks, so SQL mistakes and constraint behaviour show up.',
        'Keep a task list (schema, backend, frontend, verification) so progress is visible.',
        'Prefer the smallest change on the existing frontend, so the demo’s look and behaviour stay recognisable.',
      ]),
  },
  {
    id: 'frontend', title: 'Frontend changes', body: () =>
      p('The visual design was kept exactly; what changed is where data comes from. Dummy data and browser persistence are gone, and only the login token is stored in `localStorage`.') +
      ul([
        '**`src/api.ts` (new):** a typed client for every endpoint. It adds the Bearer token, turns FastAPI error bodies into readable messages, and on a 401 for an existing session clears the token and returns to the login screen.',
        '**Auth screens (new):** one form that switches between sign in and create account, with inline error text.',
        '**State:** the user, categories, summary, cash-flow series and the current page of transactions are held in memory and loaded from the API on start and after every change.',
        '**Dashboard:** the browser no longer computes totals; it renders `/dashboard/summary` and `/dashboard/cashflow`.',
        '**Search:** debounced by 250 ms so typing does not send a request per key; focus and cursor position are restored after the page re-renders.',
        '**Filters and paging:** All/Income/Expense go to the server; prev/next buttons replace the demo’s silent 12-row cap. Deleting the last row of a later page steps back one page.',
        '**Categories:** options come from the API, show the database icon, and follow the chosen type (Income or Expense).',
        '**Edit transaction (added later):** each row has a ✎ button that opens the same modal, pre-filled and titled “Edit transaction”. Saving sends `PUT` and keeps the current filter, search and page. Adding still resets filters so the new row is visible at the top.',
        '**Dev setup:** the Vite dev server proxies `/api` to `localhost:8000`, so the browser sees one origin and CORS is not needed in development.',
        '**Kept from the demo:** HTML escaping of every user-supplied string, INR formatting, Chart.js chart, Tailwind styles.',
      ]),
  },
  {
    id: 'testing', title: 'Testing and verification', body: () =>
      p('There are 37 integration tests, and they run against a real MySQL 8 database, not a mock. The test fixture drops and rebuilds the schema through the real migrations, and it refuses to run unless the database name contains “test”, so it can never wipe a development database.') +
      table(['Test file', 'What it proves'], [
        ['`test_auth.py`', 'Register and login; Argon2id storage; duplicate email 409; uniform login errors; every protected route returns 401 without a token; expired, wrong-key, unsigned and missing-`exp` tokens rejected; deactivated user loses access; role cannot be self-assigned; role changes apply immediately'],
        ['`test_categories.py`', 'System categories seeded in the demo’s order with icons; custom category lifecycle; privacy between users; system categories immutable; a category in use cannot be deleted'],
        ['`test_transactions.py`', 'CRUD round trip; 11 invalid inputs rejected; exact decimals; type must match category; another user’s category refused; cross-user read, update, patch and delete all return 404; filters, search, sorting, paging, literal `%` and `_`, SQL-injection text treated as plain text'],
        ['`test_dashboard.py`', 'Summary figures, top category and percentages; empty month; month validation; zero-filled cash-flow including a year boundary'],
      ]) +
      h3('Beyond the suite') +
      ul([
        'Raw SQL against MySQL confirmed that the composite foreign key and the `amount > 0` check reject bad rows.',
        'A scripted browser run checked login failure, the nine seeded rows, dashboard totals, add, edit, search, delete, persistence after reload, sign-out, and a new user starting with an empty account.',
        'The frontend is type-checked and built with `tsc` and Vite.',
      ]) +
      callout('**Not covered:** frontend unit tests, mobile layouts, concurrency and pool exhaustion, and large data volumes.'),
  },
  {
    id: 'prompts', title: 'Prompts', body: () =>
      p('Four prompts produced the whole app. The first carried most of the weight: it attached the demo, named every technology, listed the features, and stated what not to use.') +
      h3('Prompt 1: build the backend (with the demo zip attached)') +
      code(`
This is a frontend-only demo of expense tracker app. Analyse this in detail and create database and backend for it.
The planned implementation will use the selected stack:
- Backend: Python + FastAPI
- Database: MySQL 8
- Database access: PyMySQL with direct parameterized SQL
- Validation: Pydantic
- Authentication: JWT + Argon2 password hashing
- API: REST with /api/v1
- Database setup: SQL migration scripts
It will include User role, transaction CRUD, categories, dashboard summaries, and user-level data isolation. No SQLAlchemy ORM or Core. Move the dummy data from frontend to database and remove it from frontend.`, true) +
      h3('Prompt 2: review') +
      code('Identify missing requirements and assumptions in the app and give suggestions to improve the app.', true) +
      h3('Prompt 3: add a feature') +
      code('add the edit transaction feature in the app', true) +
      h3('Prompt 4: document the build') +
      code('create a document clearly defining the architecture, process flow, build strategies, context, prompts etc for expense tracker app to learn how this app developed.', true) +
      h3('Why prompt 1 worked') +
      ul([
        'It pinned the stack, so no time went on technology choices.',
        'It named the features as a checklist, which became the acceptance list.',
        'It included a negative constraint (no SQLAlchemy ORM or Core), which prevents a common default.',
        'It stated a data-migration requirement (dummy data out of the frontend), which would otherwise be forgotten.',
        'It left design details open, so the demo’s actual behaviour drove the schema and API.',
      ]) +
      p('What prompt 1 left open, and the app paid for later: how users sign up and sign out, session length, deployment target, security hardening (rate limiting, password reset), and whether the monthly “Total balance” should be a real balance. Naming these up front would have saved the review iteration.') +
      h3('Reusable templates (replace the brackets)') +
      code('Build from a demo: This is a [frontend-only / prototype] app [attached]. Analyse it in detail, then build [backend / database / feature]. Stack: [list, one line each]. Must include: [feature list]. Must not use: [exclusions]. Move [sample data] into [the database] and remove it from [the frontend]. Non-functional needs: [auth, sessions, deployment target, limits].', true) +
      code('Review: Identify missing requirements and assumptions in [the app]. Group them by [security, product, quality] and rank by what to fix before [launch]. Mark anything you did not test.', true) +
      code('Add a feature: Add [feature] to [the app]. Keep [existing behaviour, filters, styling] unchanged. Verify it end to end and tell me what you did not verify.', true) +
      code('Document: Create a document for [audience] covering context, architecture, data model, process flows, build strategy, testing, the prompts used, and pitfalls, so they can learn how [the app] was built.', true),
  },
  {
    id: 'pitfalls', title: 'Pitfalls and lessons', body: () =>
      p('Most problems were prevented by knowing a library or database rule before writing the code; a few were caught by running it. The table says which.') +
      table(['Issue', 'How it was found', 'Resolution'], [
        ['MySQL forbids `ON DELETE CASCADE` on a column that feeds a stored generated column, which a “unique per owner, with NULL meaning system” design would need', 'Known rule, recognised while designing the categories table', 'Use plain `UNIQUE (user_id, type, name)`; system rows are controlled by migrations'],
        ['Pydantic serialises `Decimal` as a JSON string, but the frontend expects numbers', 'Known behaviour, handled up front', 'A `MoneyOut` type that serialises as a float; a test asserts the value is a number'],
        ['FastAPI runs dependency clean-up (where an automatic commit would sit) at different moments across versions', 'Known, avoided by design', 'Routes call `commit()` explicitly; uncommitted work is rolled back when the connection returns to the pool'],
        ['A model field named `date` shadows the `date` type inside the class', 'Anticipated', 'Import `datetime as dt` in the schema module'],
        ['PyMySQL treats `%` as a placeholder when arguments are passed', 'Anticipated', '`DATE_FORMAT(..., \'%%Y-%%m\')` in that query; migrations run without arguments so they are unaffected'],
        ['A multi-statement migration hides an error in a later statement', 'Anticipated', 'Enable multi-statements and drain results with `nextset()` so errors surface'],
        ['`HTTP_422_UNPROCESSABLE_ENTITY` produced deprecation warnings', 'Test output', 'Use the literal `422`'],
        ['A redundant index on `transactions.category_id` next to the foreign key’s own index', 'Reading `SHOW CREATE TABLE`', 'Removed from `V003` before release'],
        ['A seed command with a 1-character `JWT_SECRET` failed to start', 'A mistake while running the seed', 'Working as designed: the app refuses a weak signing secret in every entry point'],
        ['The demo re-rendered the whole page on each keystroke, which would now fire a request per key', 'Reading the demo', '250 ms debounce, with focus and cursor restored'],
        ['Deleting the last row on page 2 would show an empty page', 'Reasoned while wiring paging', 'Step back one page before reloading'],
        ['Reusing one modal for add and edit could show stale values', 'Reasoned while adding edit', 'The form is reset and refilled every time it opens'],
      ]) +
      h3('Lessons that carry over to other projects') +
      ul([
        'Put integrity rules in the database (foreign keys, checks, uniqueness); the API’s checks are a friendlier second layer.',
        'Make “another user’s data” look the same as “no data” (404, not 403).',
        'Test with the same database engine you will deploy on, because constraint and SQL-dialect behaviour is exactly what mocks hide.',
        'Say what was not verified; here that includes mobile layouts, concurrency and the new frontend code beyond a browser run.',
      ]),
  },
  {
    id: 'gaps', title: 'Known gaps, roadmap and how to run it', body: () =>
      p('The app is a working base, not a production service. The most important gaps, found in the review, are below; the roadmap orders the work.') +
      h3('Known gaps') +
      ul([
        '**Security:** no login rate limiting, password reset or change, email verification, token revocation or refresh tokens; the token is in `localStorage`; no security headers.',
        '**Product:** Budgets and Reports are placeholders; no category management screen, month picker, CSV import or export, recurring transactions or account deletion.',
        '**Meaning:** “Total balance” is this month’s net, not a true balance; there is one currency and no accounts.',
        '**Operations:** no Dockerfile, CI, structured logging, backups or migration rollback; `seed_demo` has no production guard.',
        '**Quality:** accessibility of the modal, mobile navigation, frontend tests and concurrency tests.',
      ]) +
      h3('Suggested roadmap') +
      ol([
        '**Hardening:** rate limiting, password change and reset, refresh tokens with revocation (the `jti` claim is already issued), security headers, Dockerfile and compose file, structured logging.',
        '**Honest numbers:** rename or replace “Total balance”, add a month picker, store a user timezone.',
        '**Finish the demo’s promises:** category management, budgets, reports.',
        '**Data portability:** CSV import and export, soft delete with undo, account deletion.',
        '**Later:** recurring transactions, multi-currency, accounts and transfers, receipt uploads.',
      ]) +
      h3('To run it (Python 3.11+, Node 18+, MySQL 8)') +
      code(`
# 1. database, as a MySQL admin (edit the password first)
mysql -u root -p < backend/db/create_database.sql

# 2. backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env        # set DB_PASSWORD and JWT_SECRET (>= 32 chars)
python -m app.cli.migrate    # schema + system categories
python -m app.cli.seed_demo  # optional: demo@pennywise.app / Demo@12345
uvicorn app.main:app --reload   # http://localhost:8000/docs

# 3. frontend
cd ../frontend && npm install && npm run dev   # http://localhost:5173

# tests (throw-away database whose name contains "test")
cd ../backend && pytest`, true),
  },
  {
    id: 'doc-process', title: 'Process flow diagrams', body: () =>
      p('These diagrams show what the code does today. Setup commands (migrations and demo data) aren\'t part of the runtime flow, so they\'re left out.') +
      h3('1. User process flow') +
      diagram(processDiagram1, '1. User process flow diagram') +
      ul(['**Session expiry:** if any API call returns 401 while the browser holds a token, `api.ts` clears the token and returns to the login screen. This applies from any step, so the diagram doesn\'t draw an arrow from each one. If the call is the startup `GET /auth/me`, you just see the login screen.', '**Sign out** happens only in the browser. There is no logout API, so the token itself stays valid until it expires.', '**Categories:** the UI only lists them. Create, update and delete exist in the API but have no screen.', '**Errors:** if reloading the list after a filter or page change fails, the app shows an alert.']) +
      h3('2. Authenticated request flow') +
      diagram(processDiagram2, '2. Authenticated request flow diagram') +
      ul(['**Order:** the diagram doesn\'t define which error wins when a request has both invalid input and a bad token.', '**Data isolation:** queries for transactions and dashboard data are limited to the signed-in user\'s ID. Category queries return system categories plus the user\'s own. Another user\'s transaction or category returns 404 when requested by ID. If its category ID is used in a transaction, the API returns 422 "Unknown category_id".', '**Rollback:** a connection is rolled back when it returns to the pool, which discards anything not committed.', '**Public routes:** register, login and health skip the token checks.']) +
      h3('3. Transaction save flow') +
      diagram(processDiagram3, '3. Transaction save flow diagram') +
      ul(['This assumes the request is already authenticated (see flow 2).', 'The database also enforces the category and type match, and requires amounts above zero.', 'The API also supports `PATCH`, which merges the changed fields into the existing row and then runs the same category checks. The UI doesn\'t use it.']),
  },
  {
    id: 'doc-hld', title: 'High-level design', body: () =>
      p('This describes the app **as built**. See Differences from the target design for what isn\'t built or was built differently.') +
      h3('1. System context') +
      diagram(hldDiagram1, '1. System context diagram') +
      p('The application code calls no external services. The database has an `admin` role, but there are no admin screens or routes.') +
      h3('2. Components') +
      diagram(hldDiagram2, '2. Components diagram') +
      table(['Component', 'Responsibility'], [
        ['UI', 'Renders screens, holds UI state and handles user actions'],
        ['API client', 'Makes `fetch` calls, stores the token, turns API errors into messages and handles expired sessions'],
        ['Routers', 'Define endpoints and contain the business rules and dashboard calculations'],
        ['Auth dependency and security', 'Verifies the JWT, re-reads the user, and handles Argon2 password hashing'],
        ['Schemas', 'Validate requests and shape responses'],
        ['Repositories', 'Hold the SQL used by the routes and the auth dependency'],
        ['Connection pool', 'Reuses MySQL connections and rolls back uncommitted work on release'],
        ['Command-line tools', 'Apply SQL migrations and load demo data, each over its own direct connection'],
      ]) +
      p('The health route and the command-line tools run SQL directly, without a repository.') +
      h3('3. Local development setup') +
      diagram(hldDiagram3, '3. Local development setup diagram') +
      ul(['With the proxy, the browser sees a single origin. If `VITE_API_BASE_URL` points straight at the API, the origin must be listed in `CORS_ORIGINS`.', 'Backend settings come from environment variables or `backend/.env`.', 'The repository doesn\'t define a production deployment, so none is shown.']) +
      h3('4. Security and data boundaries') +
      diagram(hldDiagram4, '4. Security and data boundaries diagram') +
      ul(['**Passwords:** hashed with Argon2.', '**Sessions:** an HMAC-signed JWT (HS256 by default) that lasts 60 minutes by default. There are no refresh tokens or server-side logout.', '**Token storage:** `localStorage`, so a cross-site scripting (XSS) flaw could read the token. The UI escapes user text before rendering it.', '**Ownership:** transaction and dashboard queries use the signed-in user\'s ID. Category reads include system categories plus the user\'s own.', '**Public routes:** register, login and health don\'t need a token.', '**Not built:** rate limiting. HTTPS isn\'t configured in the repository.']) +
      h3('5. Differences from the target design') +
      p('The target is the parent `CLAUDE.md`.') +
      table(['Area', 'Target', 'As built'], [
        ['Database access', 'SQLAlchemy Core with `text()`', 'PyMySQL with a hand-written pool'],
        ['Migrations', 'Alembic', 'Forward-only SQL files and a custom runner'],
        ['Backend layers', 'Routes, services, repositories', 'No services layer'],
        ['Sessions', 'Short-lived access tokens plus refresh and revocation; HttpOnly cookies preferred', 'Access token only, in `localStorage`; sign out happens in the browser'],
        ['Registration', 'Disabled; admins create users', 'Public endpoint, enabled by default (`ALLOW_REGISTRATION`)'],
        ['Roles', '`roles` tables, or `users.role_id`', '`users.role` ENUM'],
        ['Features', 'Admin APIs, budgets, reports, CSV export, audit logs, password reset', 'Not built; Budgets and Reports are UI placeholders'],
        ['Dashboard API', 'Summary, monthly trend, category breakdown, recent transactions', '`summary` and `cashflow`; recent items come from `/transactions`'],
        ['Frontend structure', 'Pages, components, services and a router in separate modules', 'Mainly `main.ts`, `api.ts` and `guide.ts`; hash-based view switch'],
        ['Testing', 'Pytest, Vitest and Playwright', 'The repository has backend Pytest tests only'],
      ]),
  },
  {
    id: 'doc-lld', title: 'Low-level design', body: () =>
      p('This describes the code **as built**.') +
      h3('1. Backend module dependencies') +
      p('Arrows mean "imports". Third-party libraries are left out.') +
      h4('1.1 Application core and routes') +
      diagram(lldDiagram1, '1.1 Application core and routes diagram') +
      h4('1.2 Routes to repositories and schemas') +
      diagram(lldDiagram2, '1.2 Routes to repositories and schemas diagram') +
      p('Repositories don\'t import `db`. The caller passes them a connection.') +
      h4('1.3 Command-line tools') +
      diagram(lldDiagram3, '1.3 Command-line tools diagram') +
      h3('2. Frontend modules') +
      diagram(lldDiagram4, '2. Frontend modules diagram') +
      p('The boxes inside `main.ts` group related functions and state. They aren\'t separate files or classes.') +
      h3('3. Classes') +
      p('`?` marks a value that can be null.') +
      h4('3.1 Auth and category schemas') +
      diagram(lldDiagram5, '3.1 Auth and category schemas diagram') +
      p('Emails are lower-cased. Passwords can be up to 128 characters, with a minimum of 8 to register and 1 to log in.') +
      h4('3.2 Transaction schemas') +
      diagram(lldDiagram6, '3.2 Transaction schemas diagram') +
      p('`TransactionPatch` fields may be omitted, but the route rejects an explicit null with 422. `MoneyOut` is a `Decimal` that\'s sent as a JSON number.') +
      h4('3.3 Dashboard schemas') +
      diagram(lldDiagram7, '3.3 Dashboard schemas diagram') +
      h4('3.4 Settings and connection pool') +
      diagram(lldDiagram8, '3.4 Settings and connection pool diagram') +
      p('`db.py` also has these module functions: `connect`, `get_pool`, `close_pool`, `get_db` and `db_connection`.') +
      h3('4. Database') +
      diagram(lldDiagram9, '4. Database diagram') +
      p('A category has zero or one owner: system categories have none. `schema_migrations` has no relationships; the migration runner creates it.') +
      table(['Rule', 'Definition'], [
        ['Category and type match', 'FK `transactions(category_id, type)` → `categories(id, type)`; deleting a referenced category is restricted'],
        ['Positive amount', '`CHECK (amount > 0)`'],
        ['Deleting a user', 'Cascades to their categories and transactions through the `user_id` foreign keys'],
        ['Unique keys', '`users(email)`, `categories(id, type)`, `categories(user_id, type, name)`'],
        ['Indexes', '`categories(user_id)`, `transactions(user_id, txn_date, id)`, `transactions(user_id, type, txn_date)`'],
      ]) +
      p('MySQL allows repeated `NULL` values in a unique key, so the name key doesn\'t stop duplicate system categories. Those are managed by migrations.') +
      p('The database doesn\'t enforce that a transaction\'s category belongs to the same user. The transaction routes check it with `_check_category`.') +
      h3('5. Sequences') +
      h4('5.1 Login') +
      diagram(lldDiagram10, '5.1 Login diagram') +
      p('Request validation happens before the route body runs. Invalid input returns 422.') +
      h4('5.2 Create a transaction') +
      diagram(lldDiagram11, '5.2 Create a transaction diagram') +
      p('This assumes the request body passes validation. The connection goes back to the pool through `get_db`, which rolls back anything uncommitted.') +
      h4('5.3 Dashboard load') +
      p('This shows the successful path. Each request is authenticated as in 5.2.') +
      diagram(lldDiagram12, '5.3 Dashboard load diagram') +
      h3('6. API map') +
      p('Paths start with `/api/v1`. "Auth" means the route requires a signed-in user, which also calls `users.get_by_id`.') +
      table(['Endpoint', 'Auth', 'Route function', 'Request → response', 'Repository calls in the route'], [
        ['`POST /auth/register`', 'No', '`register`', '`RegisterIn` → `TokenOut`', '`users.create`, `users.get_by_id`'],
        ['`POST /auth/login`', 'No', '`login`', '`LoginIn` → `TokenOut`', '`users.get_by_email`, `users.record_login`'],
        ['`GET /auth/me`', 'Yes', '`me`', 'none → `UserOut`', 'none'],
        ['`GET /categories`', 'Yes', '`list_categories`', 'query `type` → list of `CategoryOut`', '`categories.list_visible`'],
        ['`POST /categories`', 'Yes', '`create_category`', '`CategoryIn` → `CategoryOut`', '`categories.create`, `get_owned`'],
        ['`PATCH /categories/{id}`', 'Yes', '`update_category`', '`CategoryUpdate` → `CategoryOut`', '`categories.get_visible`, `update`, `get_owned`'],
        ['`DELETE /categories/{id}`', 'Yes', '`delete_category`', 'none → 204', '`categories.get_visible`, `delete`'],
        ['`GET /transactions`', 'Yes', '`list_transactions`', 'filters and paging → `TransactionPage`', '`transactions.search`'],
        ['`POST /transactions`', 'Yes', '`create_transaction`', '`TransactionIn` → `TransactionOut`', '`categories.get_visible`, `transactions.create`, `get`'],
        ['`GET /transactions/{id}`', 'Yes', '`get_transaction`', 'none → `TransactionOut`', '`transactions.get`'],
        ['`PUT /transactions/{id}`', 'Yes', '`replace_transaction`', '`TransactionIn` → `TransactionOut`', '`transactions.get`, `categories.get_visible`, `transactions.update`, `get`'],
        ['`PATCH /transactions/{id}`', 'Yes', '`patch_transaction`', '`TransactionPatch` → `TransactionOut`', 'Same as `PUT`'],
        ['`DELETE /transactions/{id}`', 'Yes', '`delete_transaction`', 'none → 204', '`transactions.delete`'],
        ['`GET /dashboard/summary`', 'Yes', '`summary`', 'query `month` → `DashboardSummary`', '`month_totals`, `expense_by_category`, `all_time_balance`'],
        ['`GET /dashboard/cashflow`', 'Yes', '`cashflow`', 'query `months`, `end_month` → `Cashflow`', '`monthly_cashflow`'],
        ['`GET /health`', 'No', '`health` in `main.py`', 'none → status, or 503', 'none; runs `SELECT 1` directly'],
      ]),
  },
];

export function renderGuide() {
  const toc = SECTIONS.map(s => `<button data-scroll="guide-${s.id}" class="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-100 hover:text-indigo-600">${esc(s.title.split(',')[0]!)}</button>`).join('');
  return `
    <div class="mb-6 flex flex-wrap gap-2" aria-label="Sections">${toc}</div>
    ${SECTIONS.map(s => section(s.id, s.title, s.body())).join('')}`;
}

/** Wires up the in-page section buttons and the copy buttons. Call after the HTML is in the DOM. */
export function bindGuide() {
  document.querySelectorAll<HTMLButtonElement>('[data-scroll]').forEach(b => b.addEventListener('click', () => {
    document.getElementById(b.dataset.scroll!)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const text = b.parentElement?.querySelector('code')?.textContent ?? '';
    try { await navigator.clipboard.writeText(text); b.textContent = 'Copied'; }
    catch { b.textContent = 'Press Ctrl+C'; }
    window.setTimeout(() => { b.textContent = 'Copy'; }, 1500);
  }));
}
