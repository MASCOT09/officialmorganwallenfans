# Morgan Wallen Official Fan Community

Production-ready fan community platform built with Next.js 15, custom JWT auth, Supabase/Excel dual backend, Resend email, and web push notifications.

## Theme

Country-inspired dark luxury aesthetic — warm charcoal backgrounds, whiskey amber accents, denim blue and forest green secondary tones. Designed for Morgan Wallen fans, not generic black/gold celebrity styling.

## Quick start (local dev with Excel)

```bash
npm install
cp .env.local.example .env.local
# Edit SESSION_SECRET in .env.local

npm run seed          # Creates data/celebrity-site.xlsx with seed accounts
npm run dev
```

**Seed accounts:**
- Admin: `admin@morganwallen.fan` / `admin123`
- Fan: `fan@example.com` / `fan123`

## Production (Supabase)

1. Create a Supabase project
2. Run migrations in order from `supabase/migrations/` (002 → 006)
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel env
4. Deploy to Vercel

When Supabase env vars are set, the app automatically uses Supabase instead of Excel.

## Email (Resend)

1. Create a [Resend](https://resend.com) account
2. Set `RESEND_API_KEY` and `EMAIL_FROM`
3. For production, verify your domain in Resend
4. `onboarding@resend.dev` only sends to your Resend account email during testing

## Web Push

```bash
npm run generate-vapid
```

Sets VAPID keys in `.env.local`. Add the same keys to Vercel for production.

## Vercel deploy

```bash
vercel
```

Set all env vars from `.env.local.example` in the Vercel dashboard.

## Features

- Public site: hero video with 3D overlay (desktop), signup/login, giveaways, meet & greet, communities, private DMs
- Fan dashboard: membership tiers, messaging, notifications, profile
- Admin panel: CRUD for all content, fan management, messaging with optimistic replies
- Membership: Silver/Gold/Platinum apply/approve flow (no payment on site)
- Email + push notifications for messages, signups, giveaways, events

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run seed` | Seed Excel workbook |
| `npm run generate-vapid` | Generate VAPID keys |

## Architecture

- **Auth:** bcrypt + JWT session cookies (jose), middleware-protected routes
- **Data:** Repository pattern — `src/lib/repository/index.ts` switches Supabase ↔ Excel
- **Email:** Resend with `after()` for non-blocking sends on Vercel
- **Push:** web-push + service worker at `public/sw.js`
