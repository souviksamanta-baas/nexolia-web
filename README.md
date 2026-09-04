# Nexolia Web

Next.js App Router rebuild of the Nexolia website. Hosts both the public marketing site (`nexolia.com.ar`) and the staff portal (`admin.nexolia.com.ar`) from a single deployment via host-based routing in `middleware.ts`.

## Surfaces

| Host / path | Description |
| --- | --- |
| `/` (apex) | Coming soon + CTA to `/comenzar` |
| `/comenzar` | 3-step onboarding wizard → `POST {API}/public/leads` → gracias |
| `/onboarding` | Permanent redirect → `/comenzar` |
| `/privacidad`, `/privacy` | Política de privacidad (es-AR) |
| `/eliminacion-de-cuenta`, `/account-deletion` | Baja de cuenta (Play/App Store) |
| `admin.nexolia.com.ar/login` (or `?admin=1` on localhost) | Staff login (Supabase email/password; Google later) |
| `admin.nexolia.com.ar/dashboard` | KPIs + Grok assistant |
| `.../clientes`, `.../organizaciones`, `.../planes`, `.../roles`, `.../auditoria`, `.../pronto` | Portal pages backed by Nest `/admin/*` |
| `/mockups/*` | Static HTML QA references (served by `app/mockups/[[...slug]]/route.ts`) |

## Development

```bash
cp .env.example .env
# fill in NEXT_PUBLIC_BAAS_API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Site is at http://localhost:3000. Force admin mode locally via `http://localhost:3000/?admin=1` (sets a cookie).

Preview the raw QA mockups without booting Next:

```bash
npm run mockups
# → http://localhost:4400/mockups/
```

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BAAS_API_URL` | Base URL for the Nest API (baas-mvp) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase staff auth |
| `NEXT_PUBLIC_SITE_URL` | e.g. `https://nexolia.com.ar` (used for OG metadata) |
| `NEXT_PUBLIC_ADMIN_URL` | e.g. `https://admin.nexolia.com.ar/login` |

## Deployment (Railway)

`nixpacks.toml` runs `npm ci` + `npm run build`, and `railway.json` starts with `npm run start`. Two Railway services can point to the same repo (one per host) or a single service can serve both hosts — the middleware handles the split.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind v4 (CSS-first) with tokens ported from `mockups/styles.css`
- Supabase (`@supabase/ssr`) for staff auth
- Nest (baas-mvp) for all business logic (`lib/api.ts` client)
- Fonts: Outfit (display) + DM Sans (body)

## Documentation

- [Architecture](docs/architecture.md)
- [Deployment guide](docs/deployment.md)
- [Privacy policy source](docs/privacy-policy.md)
- [Confluence — Nexolia Website](https://souviksamanta.atlassian.net/wiki/x/AQAVAQ)
