# TikTok demo checklist (GitHub Pages + Vercel API)

Your **website stays on GitHub Pages**. TikTok requires a tiny **Vercel API** for token exchange (`client_secret` cannot live in static HTML). One-time setup (~5 minutes), then record the demo.

## Before you record

### A. TikTok Developer Portal

1. [developers.tiktok.com](https://developers.tiktok.com/) → your app → **Login Kit** added.
2. **Redirect URIs** (both registered):
   - `https://nasserxx.github.io/qeloria-legal-pages/tiktok-callback.html`
   - `https://qeloria.com/tiktok-callback.html` (if you use custom domain)
3. **Sandbox**: your TikTok account added as a **target user**.
4. Scopes enabled: `user.info.basic`, `video.upload`, `video.publish`, `video.list`.

### B. Deploy API to Vercel (one-time)

1. Open: [Import project on Vercel](https://vercel.com/new/clone?repository-url=https://github.com/Nasserxx/qeloria-legal-pages)
2. Deploy (no need to change build settings).
3. **Settings → Environment Variables** → add for **Production**:
   | Name | Value |
   |------|--------|
   | `TIKTOK_CLIENT_KEY` | `sbawoppy1qxvt41y0g` |
   | `TIKTOK_CLIENT_SECRET` | your sandbox secret from TikTok portal |
4. **Deployments → Redeploy** (so env vars apply).
5. Copy your project URL, e.g. `https://qeloria-legal-pages-xxxxx.vercel.app`.
6. In `tiktok-oauth.js`, set:
   ```javascript
   apiProxyUrl: 'https://YOUR-PROJECT.vercel.app'
   ```
7. Push to `main` → GitHub Actions updates GitHub Pages.

**Verify API:**

```bash
curl https://YOUR-PROJECT.vercel.app/api/health
```

Expected: `{"ok":true,"ready":true,...}`

### C. Open the demo site

Use GitHub Pages (not Vercel):

**https://nasserxx.github.io/qeloria-legal-pages/**

Green banner = API ready. Red banner = fix Vercel deploy or `apiProxyUrl`.

## Demo script (for TikTok App Review video)

1. Open the site on GitHub Pages.
2. Show green **API proxy ready** banner.
3. Click **Connect with TikTok** → authorize as sandbox target user.
4. Open **DevTools → Console** → show `[TikTok OAuth] Tokens` (`access_token`, `refresh_token`, `open_id`).
5. Show **real account name**, avatar, and **video grid** from TikTok API.
6. Select a short MP4 → add caption → choose privacy **Only me** → **Publish**.
7. Show success message with **real @username**.
8. Show video list refresh.

## Optional: custom API subdomain

Keep `qeloria.com` on GitHub Pages; point only the API to Vercel:

| DNS record | Value |
|------------|--------|
| `api.qeloria.com` CNAME | `cname.vercel-dns.com` |

Add `api.qeloria.com` in Vercel → Project → Domains. Then set `apiProxyUrl: 'https://api.qeloria.com'`.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Red API banner / 404 on `/api/health` | Deploy repo to Vercel; set `apiProxyUrl` |
| `server_config` / secret missing | Add `TIKTOK_CLIENT_SECRET` in Vercel, redeploy |
| `client_key` on TikTok login | Sandbox target user + correct `client_key` in portal |
| `redirect_uri` error | Register exact callback URL for the domain you use |
| Token exchange fails after login | `redirect_uri` in token request must match the one used in authorize step |

## Auto-deploy API (optional)

Add GitHub repo secrets for [deploy-api.yml](.github/workflows/deploy-api.yml):

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Get IDs from Vercel → Project → Settings → General. Then every push to `api/` redeploys the proxy automatically.
