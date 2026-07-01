# Meta Developer Console Setup

After the site is live at `https://nexolia.com.ar`, configure these fields in [Meta Developer Console](https://developers.facebook.com/):

| Field | Value |
|-------|-------|
| **Privacy Policy URL** | `https://nexolia.com.ar/privacidad` |
| **App Domains** | `nexolia.com.ar` |
| **Website / Site URL** | `https://nexolia.com.ar` |

## Notes

- The privacy policy must be publicly accessible over HTTPS with no login.
- `/privacy` serves the same content as `/privacidad` for convenience.
- WhatsApp webhook URL stays on the API service (`baas-project-production.up.railway.app`) — do not change it.

## Verification

```bash
curl -I https://nexolia.com.ar/privacidad
```

Expected: HTTP 200, `text/html` content type.
