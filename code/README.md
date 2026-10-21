# Globomantics

Next.js (App Router) + TypeScript + Tailwind CSS marketing site backed by MongoDB, with an authenticated admin area for content CRUD.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env and set values:

```bash
cp .env.example .env.local
```

Required variables:

- `MONGODB_URI` — MongoDB connection string
- `AUTH_SECRET` / `NEXTAUTH_SECRET` — session secret
- `NEXTAUTH_URL` — e.g. `http://localhost:3000`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — seeded admin user

3. Start MongoDB on the URI in `.env.local` (example with Docker):

```bash
docker run -d --name globomantics-mongo -p 27017:27017 mongo:7
```

If Docker is unavailable locally, you can use an in-memory MongoDB for development:

```bash
npm run mongo:memory
```

4. Seed content:

```bash
npm run seed
```

5. Run the app:

```bash
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Routes

| Path | Description |
|---|---|
| `/` | Home |
| `/our-story` | Our Story |
| `/robotics` | Robotics |
| `/media` | Media |
| `/admin` | Admin dashboard |
| `/api/*` | REST handlers for CRUD + registrations |

Original static HTML/CSS assets are preserved under `legacy/` for reference.
