# Imfuyo Yam — My Livestock

GPS livestock tracking Progressive Web App for South African farmers to protect their herds from theft.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Prisma** ORM with PostgreSQL
- **NextAuth.js v5** (phone + password authentication)
- **Tailwind CSS** for styling
- **Mapbox GL JS** for interactive maps
- **React Three Fiber** for 3D markers
- **PWA** with offline support

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use Vercel Postgres / Supabase / Neon)
- Mapbox account for map token

### Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd imfuyo-yam
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in the values:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `NEXTAUTH_SECRET` — run `openssl rand -base64 32` to generate
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev
   - `NEXT_PUBLIC_MAPBOX_TOKEN` — from your Mapbox dashboard

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Seed demo data:
   ```bash
   npm run db:seed
   ```

6. Start the dev server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

### Demo Login

- **Phone:** 0821234567
- **Password:** demo123

## Deploy to Vercel

1. Push code to GitHub
2. Connect repo in [Vercel Dashboard](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy — Prisma generates automatically via `postinstall`

## PWA Icons

Replace the placeholder icons in `public/icons/` with your actual app icons:
- `icon-192x192.png` (192x192px)
- `icon-512x512.png` (512x512px)

You can use the `imfuyo-logo.png` in the project root to generate these.

## Project Structure

```
app/
├── (auth)/          — Login & Register pages
├── (app)/           — Protected app pages (Map, Herd, Alerts, Account)
├── api/             — API routes (animals, farms, alerts, auth)
components/
├── map/             — FarmMap, Animal3DMarker
├── ui/              — BottomNav, BottomSheet, AnimalCard, etc.
├── auth/            — AuthForm
lib/                 — Prisma client, auth config, geo utilities
prisma/              — Schema & seed data
```

## License

Private — All rights reserved.
