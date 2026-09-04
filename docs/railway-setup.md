# Railway setup — Nexolia Web

Step-by-step to deploy `nexolia-web` as a **second service** in the existing BaaS Railway project.

## 1. Create the service

1. Open [Railway Dashboard](https://railway.com/dashboard) and log in.
2. Open the **BaaS** project (same project as `baas-project-production`).
3. Click **+ New** → **GitHub Repo**.
4. Select **`souviksamanta-baas/nexolia-web`** (authorize GitHub if prompted).
5. Railway reads [`railway.json`](../../railway.json) and [`nixpacks.toml`](../../nixpacks.toml):
   - **Build:** Nixpacks (Node 22)
   - **Start:** `node server.mjs`
   - **Health check:** `/`

## 2. Verify Railway URL

1. Open the **nexolia-web** service → **Networking** tab.
2. Under **Public Networking**, confirm a `*.up.railway.app` domain exists (or click **Generate Domain** if missing).
3. Open that URL — you should see the Nexolia coming soon page.
4. Test `/privacidad` and `/privacy` on that URL.

### If `/` or `/privacidad` fail

1. Open **Deployments** → latest deploy → **View logs**. Look for `Nexolia Web listening on 0.0.0.0:…`.
2. If the deploy crashed or health checks fail, confirm **Settings → Deploy** uses start command `node server.mjs`.
3. Redeploy after pulling the latest `main` (health check timeout was increased from 100ms to 30s).
4. Common Railway errors:
   - **502 / Application failed to respond** — process not listening on `PORT` or crashed on boot.
   - **404 from Railway edge** — domain exists but no healthy deployment is attached.

## 3. Environment variables

Set these on the **nexolia-web** Railway service (Variables), then redeploy:

| Variable | Value |
|----------|--------|
| `BAAS_API_URL` | `https://baas-project-production.up.railway.app` |
| `NEXT_PUBLIC_BAAS_API_URL` | same as above (admin client) |
| `NEXT_PUBLIC_SITE_URL` | `https://nexolia.com.ar` |
| `NEXT_PUBLIC_ADMIN_URL` | `https://admin.nexolia.com.ar/login` |
| `NEXT_PUBLIC_SUPABASE_URL` | same Supabase project as the app |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |

Also in **Supabase → Authentication → URL configuration → Redirect URLs**, allow:

- `https://admin.nexolia.com.ar/login`
- `https://admin.nexolia.com.ar/reset-password`
- `http://localhost:3000/admin/login`
- `http://localhost:3000/admin/reset-password`

Public `/comenzar` posts to same-origin `/api/public/leads`, which proxies to Nest. Nest must expose `POST /public/leads` and allow CORS for the apex/admin origins if the browser ever calls Nest directly.

On the **API** service, ensure `BAAS_CORS_ALLOWED_ORIGINS` includes:

`https://nexolia.com.ar,https://admin.nexolia.com.ar` (plus local ports as needed).

## 4. Custom domain (nexolia.com.ar + admin)

1. Open the **nexolia-web** service → **Networking** tab (same page as Public Networking).
2. Under **Public Networking**, click **+ Custom Domain**.
3. Enter `nexolia.com.ar` (and optionally `www.nexolia.com.ar`).
4. Also add **`admin.nexolia.com.ar`** on the **same** nexolia-web service (host-based middleware serves the staff portal).
5. Copy the DNS records Railway shows and add them at Cloudflare / your `.com.ar` registrar.

`admin.nexolia.com.ar` must resolve (CNAME/ALIAS to Railway). Without that DNS record the host is `NXDOMAIN` and the admin portal cannot load.

### Registrar (`.com.ar`)

At your domain registrar, create the records **exactly** as Railway displays. Common patterns:

| Type | Name | Value |
|------|------|--------|
| CNAME | `www` | Railway target hostname |
| ALIAS/ANAME or A | `@` | Railway apex target |

> **Note:** As of setup, `https://nexolia.com.ar` returned HTTP 403 — DNS is not yet pointing to Railway.

## 5. SSL

Railway provisions TLS automatically once DNS propagates (usually minutes to a few hours).

## 6. Verification

```bash
curl -I https://nexolia.com.ar/
curl -I https://nexolia.com.ar/comenzar
curl -I https://nexolia.com.ar/privacidad
curl -I https://admin.nexolia.com.ar/login
curl -sS -X POST https://baas-project-production.up.railway.app/public/leads \
  -H 'Content-Type: application/json' -d '{}'
```

Expected: `HTTP/2 200` for site routes; empty lead POST should be **400** (validation), not **404**.

## CLI alternative (local terminal)

If `railway login` works on your machine:

```bash
cd ~/Projects/nexolia-web
railway login
railway link          # select BaaS project, create/link nexolia-web service
railway up
railway domain add nexolia.com.ar
```

## Jira

- [KAN-295](https://souviksamanta.atlassian.net/browse/KAN-295) Railway deployment
- [KAN-296](https://souviksamanta.atlassian.net/browse/KAN-296) Custom domain and DNS
- [KAN-297](https://souviksamanta.atlassian.net/browse/KAN-297) Launch verification
