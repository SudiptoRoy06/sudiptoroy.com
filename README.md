# Sudipto Roy — portfolio and content studio

This repository separates the React/Vite browser application in `frontend/` from the Express/MongoDB API in `backend/`. Each application has its own dependencies and lockfile.

## Backend architecture

The backend follows a layered structure so HTTP concerns, business logic, and persistence remain independent:

```text
backend/
├── config/       # Environment, paths, and database lifecycle
├── controllers/  # Request validation and HTTP responses
├── middleware/   # Authentication, uploads, and error handling
├── models/       # One Mongoose model per file
├── routes/       # Express endpoint definitions
├── services/     # Authentication, content, profile, and upload logic
├── utils/        # Shared framework-independent helpers
├── app.js        # Express application composition
└── index.js      # Process startup and graceful shutdown
```

Routes should remain thin, controllers should translate HTTP requests into service calls, and services should contain reusable application logic. `db.js` remains a compatibility facade for provisioning scripts and tests.

> **Content review required:** seeded employment, skills, project claims, dates, email, and external URLs are deliberately marked as unverified. Review every field before launch. The included portrait is an accessible placeholder until a real portrait is uploaded.

## Frontend setup

Both applications require Node.js `^20.19.0`, `^22.13.0`, or `>=24`. This repository pins Node.js `22.22.2` in the root `.nvmrc`; use that version for both folders before installing dependencies. With NVM for Windows, run `nvm install 22.22.2` and `nvm use 22.22.2` from PowerShell or Command Prompt, then verify `node --version` reports `v22.22.2`.

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

Vite runs at `http://localhost:5173`. Browser API URLs use `VITE_BACKEND_ORIGIN`, which defaults to `http://localhost:3001` in `.env.example`; the development server also proxies `/api` and `/uploads` to it. Set this variable in the frontend production build environment (for example, `https://sudiptoroy-com.onrender.com`). Never put credentials or other secrets in any `VITE_` variable.

When the frontend and API use different origins, set the backend `FRONTEND_ORIGINS` to the comma-separated public frontend origins. The API uses this allowlist for credentialed CORS requests.

## Backend setup

The backend uses the same Node.js `22.22.2` version pinned for the frontend and stores application data in MongoDB Atlas through Mongoose.

```bash
cd backend
npm ci
cp .env.example .env
npm run dev
```

Express listens at `http://localhost:3001` by default. Run the frontend and backend commands in separate terminals.

### Backend environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | Express port; defaults to `3001`. |
| `MONGODB_URI` | Yes | Atlas connection URI. Keep it server-only and never commit the real value. |
| `MONGODB_DB` | Yes | Database name, such as `portfolio`; use a distinct name per environment. |
| `ADMIN_EMAIL` | For `npm run seed` | Administrator address to create or update. |
| `ADMIN_PASSWORD` | For `npm run seed` | Administrator password of at least 12 characters; only its bcrypt hash is stored. |
| `SESSION_TTL_MINUTES` | No | Session and cookie lifetime; defaults to 60 minutes. |
| `NODE_ENV` | No | Set to `production` to enable secure cookies and compiled-frontend serving. |

## MongoDB Atlas setup and administrator provisioning

1. Create separate Atlas projects or clusters for production, staging, development, and testing. Never run automated tests against the production database.
2. Create a dedicated, least-privilege database user for the application. Grant only the read/write access it needs on the selected portfolio database rather than an Atlas administrator role.
3. In Atlas Network Access, allow only the backend hosts' known IP addresses or private network connectivity. **Do not use `0.0.0.0/0` for unrestricted production access.** A temporary broad rule during local diagnosis should be removed immediately.
4. Copy `backend/.env.example` to the ignored `backend/.env`, replace the safe URI placeholders, and set `MONGODB_DB`. URI-encode special characters in credentials. Do not expose these values through `VITE_` variables, logs, source control, or client responses.
5. Configure Atlas backups and periodically test restoration. Rotate database passwords and deployment secrets on a schedule and immediately after suspected exposure; update the deployment secret store rather than committing credentials.

Mongoose creates the required unique and session-expiration indexes during connection. To provision the first administrator, seed draft content, or rotate that administrator's password, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the local environment, then run:

```bash
cd backend
npm run seed
```

The seed is idempotent: it updates the normalized administrator account and inserts draft portfolio collections only when those collections are empty. It does not overwrite existing portfolio content. Remove the plaintext administrator password from the runtime environment after provisioning. Keep `backend/uploads/` on persistent storage and back it up in coordination with Atlas backups.

Uploaded portraits are stored under `backend/uploads/` and exposed at `/uploads/...`; CV downloads are resolved from the same directory. Portraits accept JPEG, PNG, or WebP, CVs accept PDF, and uploads are capped at 8 MiB.

## Tests, linting, and production

Run checks independently:

```bash
cd frontend
npm test
npm run lint
npm run build
```

```bash
cd backend
MONGODB_TEST_URI='mongodb://127.0.0.1:27017' npm test
```

Backend tests generate a unique database name, clear only that isolated database, and drop it afterward. `MONGODB_TEST_URI` must identify a non-production MongoDB deployment; never provide a production Atlas URI to automated tests.

For a production deployment, build the frontend first and then start the backend from its directory:

```bash
cd frontend
npm ci
npm run build

cd ../backend
npm ci
NODE_ENV=production npm start
```

The frontend build is written to `frontend/dist/`. In production mode, the backend serves that directory and uses its `index.html` as the SPA fallback; it continues to serve API routes under `/api` and runtime assets under `/uploads`. The `frontend/dist/` and `backend/uploads/` locations therefore need to be present together in a single-server deployment. Terminate TLS in front of Express so production cookies are secure.

For separate static hosting, deploy `frontend/dist/`, rewrite browser routes such as `/admin/login` and `/admin/*` to `index.html`, and route `/api/*` and `/uploads/*` to the backend origin.
