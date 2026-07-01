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

1. Open the new service → **Settings** → **Networking** → **Generate Domain**.
2. Open the `*.up.railway.app` URL — you should see the Nexolia coming soon page.
3. Test `/privacidad` and `/privacy` on that URL.

## 3. Custom domain (nexolia.com.ar)

1. Service → **Settings** → **Domains** → **Custom Domain**.
2. Add `nexolia.com.ar` (and optionally `www.nexolia.com.ar`).
3. Copy the DNS records Railway shows.

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
