## Quick internal guide for AI coding agents

This repository is a small SSR Node.js/Express app (ESM) using Pug templates and PostgreSQL. The goal of this doc is to capture the concrete patterns and developer workflows an AI agent needs to be productive immediately.

- Entry point: `src/server.js` — Express app, Helmet CSP configured, static assets served from `public/`, Pug views in `src/views`.
- Routing pattern: lightweight routers under `src/routes/*.js` that import controller functions from `src/controllers/*` and export an Express Router. Example: `src/routes/index.js` -> `showHome` in `src/controllers/homeController.js`.
- Controllers: prefer small functions that call `query(...)` from `src/config/db.js` and then `res.render()` the appropriate view. Example: `src/controllers/adminController.js` runs `query("SELECT ... FROM admins")` and renders `admins`.
- Database: `src/config/db.js` exports `pool` and `query(text, params)`. Environment variables used: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. `dotenv` is used in `src/config/db.js` and `src/server.js`.
- Auth / Upload / Extras: dependencies include `jsonwebtoken`, `argon2`, `multer`, `nodemailer` — search for usages before adding or changing auth or upload code.

Workflows (reliable, repo-discoverable commands)

- Start production: `npm start` (runs `node src/server.js`).
- Dev: `npm run dev` (nodemon watching `src/`).
- Tests: unit tests with Jest — `npm test`. E2E with Playwright — `npm run e2e`.
- Lint: `npm run lint`.
- Docker: `npm run build:docker` and `docker-compose.yml` exists for local deployment.
- Lighthouse CI: `npm run lhci:collect` then `npm run lhci:assert` (used in CI).

Project conventions and patterns to preserve

- ESM modules only (package.json: `type: "module"`). Use `import`/`export` consistently.
- Controllers are thin and synchronous-looking; async controller functions use `await query(...)` and `try/catch` for DB errors. Follow that pattern; return views with `res.render(viewName, locals)`.
- Routes are tiny files that only map paths to controller functions. Add new routes under `src/routes` and register them in `src/server.js`.
- Use Pug templates in `src/views/` for rendering; views expect simple locals (title, message, arrays). Inspect `src/views/index.pug` and `layout.pug` for common blocks.

Integration and external points to be careful with

- PostgreSQL: `src/config/db.js` creates a connection pool. Always use the exported `query` helper to run SQL. SQL is raw; sanitize inputs and prefer parameterized queries.
- Static assets: `public/` is served from `src/server.js` — uploaded files should be written to a path inside `public/` (check existing upload code if present).
- Environment: `.env` (use `.env.example` if present) — agents should not hardcode secrets and must read from process.env.

Quick examples the agent may use or edit

- Add a route: create `src/routes/foo.js` with `import { handler } from '../controllers/foo.js'` and `router.get('/foo', handler)`; then `app.use('/foo', fooRouter)` in `src/server.js`.
- Database query: `const { rows } = await query('SELECT id, name FROM table WHERE id=$1', [id])` (see `src/controllers/adminController.js`).

Where to look next

- `src/server.js` — server boot, middleware, route registration, view engine.
- `src/config/db.js` — DB connection and exported `query` helper.
- `src/routes/*` and `src/controllers/*` — canonical pattern for request handling.
- `package.json` — npm scripts and important dependencies (`jest`, `playwright`, `nodemon`, `lhci`).

Project plan & epics (summary)

- The repo includes a project plan with epics and user stories at `.continue/rules/PROJECT_PLAN.md` — useful for planning larger changes.
- High-level epics to be aware of:
	- Infrastructure & Configuration: Docker, GitHub Actions, SonarCloud, Lighthouse, Continue.dev integration.
	- Authentication & Security: JWT + refresh tokens, Argon2id password hashing, admin user flows and protected dashboard routes.
	- Content Management: CRUD for dynamic blocks, image/document uploads, drag & drop ordering, sanitization.
	- UI / PWA: SSR public pages with dynamic sections, manifest + service worker for offline/installable behavior.
	- Tests & Quality: Jest unit tests (TDD) and Playwright E2E for critical flows; LHCI used in CI for performance checks.

If anything here looks incomplete or you want examples for a specific task (adding auth, file uploads, or creating tests), tell me which area and I'll expand with concrete edits and small unit tests.
