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

## 3. Custom domain (nexolia.com.ar)

1. Open the **nexolia-web** service → **Networking** tab (same page as Public Networking).
2. Under **Public Networking**, click **+ Custom Domain**.
3. Enter `nexolia.com.ar` (and optionally add `www.nexolia.com.ar` as a second domain).
4. Copy the DNS records Railway shows and add them at your `.com.ar` registrar.

### Registrar (`.com.ar`)

At your domain registrar, create the records **exactly** as Railway displays. Common patterns:

| Type | Name | Value |
|------|------|--------|
| CNAME | `www` | Railway target hostname |
| ALIAS/ANAME or A | `@` | Railway apex target |

> **Note:** As of setup, `https://nexolia.com.ar` returned HTTP 403 — DNS is not yet pointing to Railway.

## 4. SSL

Railway provisions TLS automatically once DNS propagates (usually minutes to a few hours).

## 5. Verification

```bash
curl -I https://nexolia.com.ar/
curl -I https://nexolia.com.ar/privacidad
curl -I https://nexolia.com.ar/privacy
```

Expected: `HTTP/2 200` for all three.

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
