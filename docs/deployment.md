# Nexolia Web — Deployment

Deploy the static site to Railway as a **separate service** from the `baas-mvp` API.

## Prerequisites

- Railway account (same project as the BaaS API)
- Domain `nexolia.com.ar` at your registrar
- Git remote for this repository: https://github.com/souviksamanta-baas/nexolia-web

## Railway setup

See [railway-setup.md](./railway-setup.md) for the full walkthrough.

1. In your Railway project, click **New Service** → **GitHub Repo** → select `nexolia-web`.
2. Railway detects `railway.json` and runs `node server.mjs`.
3. Under **Settings → Networking**, generate a Railway domain for smoke testing.
4. Under **Settings → Domains**, add custom domain `nexolia.com.ar` (and optionally `www.nexolia.com.ar`).
5. Copy the DNS records Railway provides into your `.com.ar` registrar.

## DNS (registrar)

Railway will show either:

- **CNAME** for `nexolia.com.ar` or `www`, or
- **A records** for apex domain

Apply exactly what Railway displays after attaching the custom domain.

## Health check

- Path: `/`
- Expected: HTTP 200 with coming soon page

## Meta Developer Console

After HTTPS is live on `nexolia.com.ar`:

| Field | Value |
|-------|-------|
| Privacy Policy URL | `https://nexolia.com.ar/privacidad` |
| App Domains | `nexolia.com.ar` |
| Site URL | `https://nexolia.com.ar` |

The API webhook URL stays on `baas-project-production.up.railway.app` — do not change it.

## Local preview

```bash
cd ~/Projects/nexolia-web
npm run dev
```

Open http://localhost:3000, http://localhost:3000/privacidad, and http://localhost:3000/privacy.

## Verification checklist

- [ ] `https://nexolia.com.ar` shows coming soon page
- [ ] `https://nexolia.com.ar/privacidad` loads without auth
- [ ] `https://nexolia.com.ar/privacy` serves privacy policy
- [ ] Meta Developer Console updated with privacy URL
