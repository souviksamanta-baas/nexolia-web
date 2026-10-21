# Sitio comercial — nexolia.com.ar

Static HTML QA mockups for the public marketing site live in [`mockups/sitio/`](../mockups/sitio/). Preview with `npm run mockups` → `/mockups/sitio/inicio.html`.

Live apex routes rewrite to these HTML files via `middleware.ts` (`/` → `inicio.html`, `/copi`, `/suscripciones`, `/contacto`, `/preguntas-frecuentes`). Assets stay under `/mockups/sitio/…`. The commercial `sitio/` tree is always public; other `/mockups/*` remain gated unless `NEXOLIA_ENABLE_MOCKUPS=true`.

## Pages

| Mockup | Role |
| --- | --- |
| `inicio.html` | One-page homepage (Producto = `#producto`) |
| `copi.html` | Copi product page |
| `suscripciones.html` | Plans (Básico / Pro / Enterprise) |
| `contacto.html` | Demo request form (`POST /api/public/leads`) |
| `preguntas-frecuentes.html` | FAQ with tabs + search |

## Navigation

Header: **Producto**, **Copi**, **Suscripciones**, **Contacto**, **Ingresar**, **Comenzar**.

- Producto → `inicio.html#producto`
- Ingresar → `https://web.nexolia.com.ar` (QR pairing). Staff login stays on `admin.nexolia.com.ar`
- Comenzar → existing `/comenzar` flow (`mockups/comenzar/paso-1.html`)

Footer (brand green `#08bd66`):

- Producto: Inicio, Copi, Suscripciones
- Ayuda: Contacto, Preguntas frecuentes, Guía (`/guia`)
- Legal: Política de privacidad (`/privacidad`), Eliminación de cuenta (`/eliminacion-de-cuenta`)

## Brand

| Token | Value |
| --- | --- |
| Font | Inter |
| Navy | `#101935` |
| Primary green | `#08bd66` |
| Brand blue (italic accents) | `#0B4DA2` |
| Logo | `public/nexolia-logo.svg` (wordmark) |

## Suscripciones (catalog)

Source of truth: **Admin → Planes** via `GET /public/plans` (same catalog as Comenzar).

`mockups/sitio/suscripciones.html` loads that endpoint (mockups server proxies `/api/public/plans` → Nest). HTML keeps a fallback catalog if the request fails.

| Plan | Default monthly | Default annual |
| --- | --- | --- |
| Básico | `$65.000` | `$715.000` |
| Pro | `$85.000` | `$935.000` |
| Enterprise | Precio a medida | — |

Annual = 11 months. Trial 15 days. Launch discount 50% off first 6 months. Starter is inactive.

## Admin portal / API

- **No** link from the marketing site into `admin.nexolia.com.ar`.
- Suscripciones reads `GET /public/plans` (same as Comenzar). Price/name/tagline/servicios/copi updates in Admin appear on the page after refresh.
- Contacto posts to same-origin `POST /api/public/leads` with `email`, `orgName`, and `notes` containing `nombre`, optional `mensaje`, and `origen:demo`. No new column, endpoint, or webhook.

## Screenshots (homepage slider)

Phone aspect **390×844** @3x (**1170×2532**) in `mockups/sitio/shots/`:

| File | Source |
| --- | --- |
| `inicio.png`, `copi.png`, `stock.png`, `ventas.png`, `tareas.png` | App Store Connect draft set (`baas-mvp/tmp/asc-screenshots/`) |
| `mensajes.png`, `caja.png` | UI-faithful captures at phone size (replace with live device shots when available) |

## Tracking

- Confluence: [Nexolia Website](https://souviksamanta.atlassian.net/wiki/x/AQAVAQ)
- Jira epic: [KAN-467](https://souviksamanta.atlassian.net/browse/KAN-467)
  - [KAN-468](https://souviksamanta.atlassian.net/browse/KAN-468) HTML mockups
  - [KAN-469](https://souviksamanta.atlassian.net/browse/KAN-469) App screenshots for slider
  - [KAN-470](https://souviksamanta.atlassian.net/browse/KAN-470) Confluence y docs
