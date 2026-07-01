# Meta Developer Console Setup

Configure the Nexolia Meta app after `https://nexolia.com.ar` is live over HTTPS.

## Prerequisites

- Privacy policy reachable: `https://nexolia.com.ar/privacidad` returns HTTP 200
- You are logged into [Meta Developer Console](https://developers.facebook.com/apps/)

## Step-by-step

1. Open your **Nexolia** app in the Developer Console.
2. Go to **App settings → Basic** (left sidebar).
3. Set these fields:

| Field | Value |
|-------|-------|
| **App Domains** | `nexolia.com.ar` |
| **Privacy Policy URL** | `https://nexolia.com.ar/privacidad` |
| **Website / Site URL** | `https://nexolia.com.ar` |

4. Click **Save Changes**.
5. If prompted for **App Review** or **Data Use Checkup**, use the same privacy URL.

## WhatsApp product (unchanged)

Do **not** change the WhatsApp webhook URL — it stays on the BaaS API:

```
https://baas-project-production.up.railway.app/webhooks/whatsapp
```

See [baas-mvp meta-platform-waba-setup](https://github.com/souviksamanta-baas/Baas-Project/blob/main/docs/meta-platform-waba-setup.md) for WABA details.

## Notes

- `/privacy` serves the same content as `/privacidad`.
- Privacy contact on the page: `privacidad@nexolia.com.ar` (placeholder).

## Verification

```bash
curl -I https://nexolia.com.ar/privacidad
```

Expected: `HTTP/2 200`, `content-type: text/html`

## Jira

- [KAN-293](https://souviksamanta.atlassian.net/browse/KAN-293) Meta app URL configuration
