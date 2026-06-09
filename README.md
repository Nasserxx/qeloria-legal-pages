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

Token exchange (`POST /v2/oauth/token/`) must run on a **backend** with the client secret — never in browser JavaScript.
