# NestJS + Supabase + Prisma starter

Basic Technobot starter with:
- Supabase client
- Prisma with PostgreSQL
- Hexagonal-style user module
- React web app with Supabase Auth
- Simple factory pattern for repository selection
- Dockerized API

## 1. Create the env file

```bash
cp .env.example .env
```

Fill these values from your Supabase project:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`

For the web app:

```bash
cp web/.env.example web/.env
```

Fill:
- `VITE_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## 2. Run locally

```bash
npm install
npm run start:dev
```

In another terminal:

```bash
cd web
npm install
npm run dev
```

## 3. Run with Docker

```bash
docker compose up --build
```

API:
- `GET /health`
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`
- `GET /supabase/health`

## Factory pattern used here

`UserRepositoryFactory` chooses the repository implementation with:
- `USER_REPOSITORY_DRIVER=prisma`
- `USER_REPOSITORY_DRIVER=memory`

That lets you keep the application layer independent from infrastructure.

## Notes about Supabase

Supabase gives you:
- PostgreSQL database
- Auth / storage / edge functions if you need them later

In this starter:
- Prisma talks to the Supabase Postgres database through `DATABASE_URL`
- Prisma migrations use `DIRECT_URL`
- Supabase SDK is available through `SupabaseService`
- The React app uses the Supabase publishable key for login/logout and realtime

## Supabase Auth

Enable Email auth in the Supabase dashboard, then create organizer accounts in
Authentication > Users.

The web app has:
- `GET /` for the API display
- `GET /login` for Supabase email/password login
- Logout on the API display page

## Prisma

Generate the Prisma client after installing dependencies:

```bash
npm run prisma:generate
```

The Prisma schema lives in `src/db/schema.prisma`.

Create and apply a migration locally:

```bash
npm run migration:generate -- --name init
```

Apply existing migrations in production:

```bash
npm run migration:run
```

## Production note

Never expose the Supabase service role key in the frontend.
This project is backend-only, so it is the right place to use it.