# Household Services Platform

Monorepo containing:

- `backend`: Node.js + Express + PostgreSQL API
- `frontend/household`: React + Vite single page app

## Prerequisites

- Node.js (LTS) and npm
- PostgreSQL database

## Backend Setup (`backend`)

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example` in the repo root:

```bash
cp ../.env.example ../.env
```

Then edit `.env` with your real values:

- `DATABASE_NAME`
- `DATABASE_PASS`
- `JWT_SECRET`

Run database migrations using the SQL in `backend/schema.sql` against your Postgres database.

Start the backend:

```bash
cd backend
node index.js
```

By default it listens on `http://localhost:5000`.

## Frontend Setup (`frontend/household`)

```bash
cd frontend/household
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` and `/uploads` to the backend.

For a production build:

```bash
npm run build
npm run preview
```

## Git Notes

- `node_modules`, build artifacts, `.env`, and `uploads` are ignored by `.gitignore`.
- Do **not** commit real secrets; update `.env.example` instead when you add new configuration keys.

