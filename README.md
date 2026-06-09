# qeloria-legal-pages

Privacy Policy, Terms of Service, and landing page for **Qeloria Content Publisher** — deployed to GitHub Pages and optionally at [qeloria.com](https://qeloria.com/).

## Live URLs

| Page | GitHub Pages | Custom domain |
|------|--------------|---------------|
| Home | https://nasserxx.github.io/qeloria-legal-pages/ | https://qeloria.com/ |
| TikTok callback | https://nasserxx.github.io/qeloria-legal-pages/tiktok-callback.html | https://qeloria.com/tiktok-callback.html |
| Privacy Policy | https://nasserxx.github.io/qeloria-legal-pages/privacy-policy.html | https://qeloria.com/privacy-policy.html |
| Terms of Service | https://nasserxx.github.io/qeloria-legal-pages/terms-of-service.html | https://qeloria.com/terms-of-service.html |
| Business Information | https://nasserxx.github.io/qeloria-legal-pages/business-info.html | https://qeloria.com/business-info.html |

## TikTok Login Kit setup (fix `client_key` / `redirect_uri` errors)

The **Connect with TikTok** button uses [Login Kit for Web](https://developers.tiktok.com/doc/login-kit-web). If TikTok shows *"We couldn't log in with TikTok"* and mentions `client_key` or `redirect_uri`, the code is usually correct but the **Developer Portal app settings** are not.

### 1. Add Login Kit to your app

1. Go to [developers.tiktok.com](https://developers.tiktok.com/) → **Manage apps** → your app.
2. Under **Products**, add **Login Kit** if it is not already added.
3. Open **Login Kit** → **Web** configuration.

### 2. Register every redirect URI you use

The `redirect_uri` sent in the OAuth request must match a registered URI **exactly** (https, full path, no query strings).

Register **both** of these under Login Kit → **Redirect URI**:

```
https://qeloria.com/tiktok-callback.html
https://nasserxx.github.io/qeloria-legal-pages/tiktok-callback.html
```

The site picks the correct URI automatically based on which domain you are visiting. If you add another domain later, register its `tiktok-callback.html` URL here and add it to `registeredRedirectUris` in `tiktok-oauth.js`.

### 3. Staging vs production / sandbox

| App status | What to do |
|------------|------------|
| **Staging** (not live) | Use **Sandbox** credentials (`client_key` starts with sandbox key in portal). Add your TikTok account as a **target user**. Test from **https://qeloria.com/** only if that is the sandbox redirect URI. |
| **Live in production** | Switch `clientKey` in `tiktok-oauth.js` to the production key (`aweov6tyahsy44f9`). |

A `client_key` error while the app is in Staging usually means: wrong sandbox/production key, not a target user, or testing from a domain whose redirect URI is not registered in the sandbox. See [Add a Sandbox](https://developers.tiktok.com/doc/add-a-sandbox).

**Never put `client_secret` in HTML or JavaScript.** It belongs only on a backend server for `POST /v2/oauth/token/`.

### 4. Scopes

The demo requests: `user.info.basic`, `video.upload`, `video.publish`, `video.list`. Enable the same scopes on your app (Content Posting API + Login Kit). Unapproved scopes can block authorization.

### 5. Authorization URL

Use the v2 endpoint (already configured in `tiktok-oauth.js`):

```
https://www.tiktok.com/v2/auth/authorize/
```

Do **not** use the legacy `https://www.tiktok.com/auth/authorize/` URL.

### 6. Debug checklist

Open the browser console on the home page, click **Connect with TikTok**, and verify:

- `redirect_uri` in the TikTok URL matches one of the registered URIs above.
- `client_key` matches the key shown in **Manage apps** for this app.
- You are signed into TikTok as a sandbox target user (if the app is not live).

OAuth flow: `index.html` → TikTok authorize → `tiktok-callback.html` → back to `index.html` with connection status.

Token exchange (`POST /v2/oauth/token/`) runs on a **separate Vercel API** in `/api/tiktok/` — never put `client_secret` in browser JavaScript.

## Architecture: GitHub Pages + Vercel API

GitHub Pages serves **static files only** — it cannot run `/api/tiktok/*` or store `client_secret`. Keep your site on GitHub Pages; deploy **only the API** to Vercel.

| Layer | Host | What runs there |
|-------|------|-----------------|
| Static site | GitHub Pages (`*.github.io` and/or `qeloria.com`) | HTML, `tiktok-oauth.js`, `tiktok-api.js` |
| TikTok API proxy | Vercel (`*.vercel.app`) | `api/tiktok/*` serverless functions |

The browser on GitHub Pages calls your Vercel URL for token exchange, profile, videos, and publish.

### 1. Deploy the API to Vercel (one-time, ~5 min)

**Quick start:** [Import this repo on Vercel](https://vercel.com/new/clone?repository-url=https://github.com/Nasserxx/qeloria-legal-pages)

1. Deploy the project. **Do not** point `qeloria.com` at Vercel — GitHub Pages keeps serving the site.
2. Vercel → **Settings → Environment Variables** (Production):
   - `TIKTOK_CLIENT_KEY` = `sbawoppy1qxvt41y0g`
   - `TIKTOK_CLIENT_SECRET` = sandbox secret from TikTok Developer Portal
3. **Redeploy** after adding env vars.
4. Copy the deployment URL (e.g. `https://qeloria-legal-pages-xxxxx.vercel.app`).
5. Set `apiProxyUrl` in `tiktok-oauth.js` to that URL (no trailing slash).
6. Push to `main` — GitHub Actions updates GitHub Pages only.

Full demo recording steps: **[DEMO.md](DEMO.md)**

**Optional:** `api.qeloria.com` CNAME → Vercel, while `qeloria.com` stays on GitHub Pages.

### 2. Verify the API

```bash
curl https://YOUR-PROJECT.vercel.app/api/health
```

Expected: `{"ok":true,"ready":true}`. If `ready` is false, add `TIKTOK_CLIENT_SECRET` and redeploy.

On the live site, a green banner means the proxy is reachable from GitHub Pages.

### 3. Local development

```bash
npx vercel dev
```

Create `.env.local` with `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET`. On `localhost`, the frontend uses same-origin `/api` (no `apiProxyUrl`).

### After connecting TikTok

Open browser **DevTools → Console**. You will see:

```
[TikTok OAuth] Tokens
  access_token: …
  refresh_token: …
  open_id: …
```

Copy these for external tools. Tokens are also in `sessionStorage` under `tiktok_session`.

### Publish flow

1. Connect → tokens exchanged via `/api/tiktok/token`
2. Profile + video list via `/api/tiktok/profile` and `/api/tiktok/videos`
3. Publish → `/api/tiktok/publish-init` → PUT upload to TikTok → poll `/api/tiktok/publish-status`
4. Video grid refreshes with real account data
