# Quickstart (Node.js + NestJS + Prisma + PostgreSQL)

## Prerequisites

- Node.js 18+ and npm/yarn installed
- Docker (for local PostgreSQL)
- Git

## Environment (example .env)

Create `.env` at the project root for backend with variables similar to:

```
DATABASE_URL=postgresql://pguser:pgpass@localhost:5432/adopt_db
JWT_SECRET=change-me
S3_ENDPOINT=... # if using S3-compatible storage
S3_BUCKET=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
```

## Start local PostgreSQL (PowerShell)

```powershell
# Run Postgres in Docker
docker run -e POSTGRES_USER=pguser -e POSTGRES_PASSWORD=pgpass -e POSTGRES_DB=adopt_db -p 5432:5432 -d postgres:15
```

## Backend (start)

```powershell
cd backend
npm install
# run migrations (Prisma example)
npx prisma migrate deploy
npm run dev
```

## Frontend (start)

```powershell
cd frontend
npm install
npm run dev
```

## Notes

- Replace placeholder env values with secure secrets for production.
- For image storage, configure an S3-compatible bucket and CDN; local development can use MinIO or a local emulation.
- For chatbot, configure credentials for the chosen LLM provider.
