# express-jest-supertest-starter (Teaching Edition)

Minimal API integration testing with Jest + Supertest.
**No Docker. No database. Just Node.js.**

## What is tested

4 integration tests using Supertest against the Express application:

| # | Test | Expected |
|---|------|----------|
| 1 | `GET /` | 200 + JSON array |
| 2 | `POST /create` without a token | 401 Unauthorized |
| 3 | `POST /create` with a valid JWT token | 201 + `{ id, description }` |
| 4 | `POST /create` with a token but missing body | 400 Bad Request |

Tasks are stored **in memory** — no database is required.

## Quick start

```bash
# 1. Install dependencies (run from the server/ directory)
cd server
npm install

# 2. Run the tests
npm test
```

That's it. The `.env` file is already committed with a default `JWT_SECRET`.

## Project structure

```
server/
├── app.js                        # Express app factory (middleware + routing)
├── server.js                     # Entry point — starts the HTTP server
├── helper/
│   └── auth.js                   # JWT authentication middleware
├── repository/
│   └── todoRepository.js         # In-memory task store (getAll / create / reset)
├── routes/
│   └── todoRouter.js             # Route handlers (GET /, POST /create)
├── app.int.test.js               # Integration tests (Jest + Supertest)
├── jest.config.mjs               # Jest configuration
└── package.json
```

## How npm test works

```
"test": "cross-env NODE_OPTIONS=--experimental-vm-modules jest --runInBand"
```

- `NODE_OPTIONS=--experimental-vm-modules` — required for Jest to support ES Modules (`import`/`export`).
- `--runInBand` — runs all test files sequentially in the same process (important for shared in-memory state).
- Jest automatically finds `app.int.test.js` via the `testMatch: ["**/*.test.js"]` pattern.

## Environment variables

Only one variable is needed:

| Variable | Purpose | Default |
|----------|---------|---------|
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens | `change_me` |

The `.env` file in this directory already provides a default value. No configuration is needed to run the tests.
