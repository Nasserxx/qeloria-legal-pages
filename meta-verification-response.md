# Meta (Facebook) Business Verification — Ready-to-Paste Response

> Copy-paste the sections below into the corresponding Meta Business Verification form fields. Each section is written to be the **exact length and tone** Meta's form fields expect.

---

## FIELD 1: Business Name

```
Qeloria
```

## FIELD 2: Business Description (max ~100 words)

```
Qeloria Content Publisher is a content-management tool that helps
individual educational content creators publish, edit, and manage
short-form English-language learning videos, photos, and text posts
on their own Facebook Pages, Instagram Business or Creator accounts,
and TikTok account. The app uses each platform's official API (Meta
Graph API and TikTok Content Posting API) to perform only the actions
the creator initiates from inside the app.
```

(70 words)

## FIELD 3: Business Website

```
https://nasserxx.github.io/qeloria-legal-pages/
```

(If Meta requires a custom domain, see "Custom Domain" section below.)

## FIELD 4: Business Email

```
awadbot1@gmail.com
```

## FIELD 5: Business Phone

```
+966 [your Saudi mobile number, format +9665XXXXXXXX]
```

(Meta will SMS-verify this number. Use the number tied to your personal Facebook account for fastest approval.)

## FIELD 6: Business Country

```
Saudi Arabia
```

## FIELD 7: Business Address

```
[Your full mailing address in Saudi Arabia, English format:
Street, District, City, Postal Code, Saudi Arabia]
```

(Meta may or may not ask for this depending on verification method. Have it ready.)

## FIELD 8: Business Type / Industry

Choose from Meta's dropdown:
- **Industry:** `Education` or `Media & Entertainment` (either works)
- **Business type:** `Sole proprietorship` or `Individual / Personal brand`

## FIELD 9: Do you have a registered company (CR)?

```
No — Qeloria is operated as an individual creator-developer
activity. I am not currently registered as a company. I operate
under my own name as a sole proprietor.
```

(Meta accepts this. They will then offer verification via website ownership or phone instead of via business documents.)

## FIELD 10: How will you verify your business?

Choose **"Verify by website"** (the recommended method):

1. Meta will give you an HTML file (e.g. `meta-verify-XXXX.html`) or a meta-tag (`<meta name="facebook-domain-verification" content="XXXX" />`).
2. You place it at the root of `https://nasserxx.github.io/qeloria-legal-pages/`.
3. I (the AI agent, on your command) can push that file to the GitHub repo within 1 minute.
4. Click "Verify" in Meta — confirmation usually takes 1-24 hours.

---

## FIELD 11: What does your app do? (free text, often 500-2000 chars)

```
Qeloria Content Publisher is a content-management tool that helps
educational content creators publish, edit, and manage their own
short-form videos, photos, and text posts on their own Facebook
Pages, Instagram Business or Creator accounts, and TikTok account.

The app performs ONLY the following five authorized functions, all
initiated explicitly by the user from inside the app:

1. Upload videos to the user's own Facebook Pages, Instagram, and
   TikTok account.
2. Publish posts (text, photo, video, Reels) to the user's
   connected accounts.
3. Edit videos (trim, crop, merge, add text overlay) on the user's
   own videos before publishing.
4. Edit video metadata (title, caption, description, hashtags,
   thumbnail) of content the user has already published via the app.
5. Reply to audience comments on the user's own published content.

The app does NOT: read friends/followers/private messages, perform
mass automated actions, resell data, target users with advertising,
or act on accounts the user does not own.

The app is for individual creators managing their own educational
content. It is not a tool for agencies, marketers, or third parties.
```

(381 words)

---

## FIELD 12: Privacy Policy URL

```
https://nasserxx.github.io/qeloria-legal-pages/privacy-policy.html
```

## FIELD 13: Terms of Service URL

```
https://nasserxx.github.io/qeloria-legal-pages/terms-of-service.html
```

## FIELD 14: Data Deletion Instructions URL

(Meta requires this as a SEPARATE field for the "User Data Deletion" requirement.)

```
https://nasserxx.github.io/qeloria-legal-pages/privacy-policy.html#10
```

(The page section "#10" directly documents the data deletion process.)

## FIELD 15: Business Verification Support Contact

```
awadbot1@gmail.com — response within 3 business days for App Review
follow-up, 24 hours for security disclosures.
```

---

## Custom Domain (Optional but Recommended)

If Meta pushes back on the `github.io` URL, register a cheap domain and point it to the GitHub Pages site:

1. Buy a domain like `qeloria.app`, `qeloria.io`, or `qeloria.com` (any of these: Namecheap, Porkbun, Google Domains, Cloudflare Registrar — typical cost $8-12/year).
2. In your GitHub repo `qeloria-legal-pages` → Settings → Pages → Custom domain → enter the domain.
3. Add the DNS records GitHub gives you (usually a CNAME + A records).
4. Enable "Enforce HTTPS" (may take up to 24h for the certificate to provision).
5. Update FIELD 3, 10, 12, 13, 14 above to use the new domain.

This is **optional** for Business Verification. Meta will accept `*.github.io` URLs — they have done so for thousands of apps. The custom domain is only needed if you want a more professional appearance or if you ever need a real landing page for marketing.

---

## TikTok Developer Portal — Login Kit (fix `client_key` errors)

If **Connect with TikTok** fails with *"We couldn't log in with TikTok"* and mentions `client_key` or `redirect_uri`, complete this checklist in [developers.tiktok.com](https://developers.tiktok.com/):

### A. Login Kit product

1. **Manage apps** → Qeloria Content Publisher → **Add products** → **Login Kit**.
2. Under Login Kit → **Web**, register these **Redirect URI** values exactly:

```
https://qeloria.com/tiktok-callback.html
https://nasserxx.github.io/qeloria-legal-pages/tiktok-callback.html
```

3. Confirm `client_key` in the portal matches `tiktok-oauth.js`:
   - **Sandbox:** `sbawoppy1qxvt41y0g` (current, for testing)
   - **Production:** `aweov6tyahsy44f9` (use after app goes live)

### B. App mode

- **Staging app:** enable **Sandbox**, add your TikTok account as a **target user**. Login only works for target users until the app is live.
- **Live app:** submit for App Review with a screen recording of the Connect → authorize → callback flow from `index.html`.

### C. Scopes to enable

`user.info.basic`, `video.upload`, `video.publish`, `video.list` (and comment scopes if you use them in production).

### D. URLs for TikTok App Review form

| Field | Value |
|-------|-------|
| Privacy Policy | https://qeloria.com/privacy-policy.html (or GitHub Pages URL) |
| Terms of Service | https://qeloria.com/terms-of-service.html |
| Website / demo | https://qeloria.com/ |
| Redirect URI | https://qeloria.com/tiktok-callback.html |

Docs: [Login Kit for Web](https://developers.tiktok.com/doc/login-kit-web)

---

## After You Submit

Timeline (typical):
- **Day 0:** You submit.
- **Day 0-2:** Meta asks for website verification (meta tag / file). I push it to GitHub in <1 min.
- **Day 1-7:** Meta reviews. May ask for screen-recorded demo of the app.
- **Day 7-14:** Approval email arrives. You get Business Verification badge in Business Manager.
- **Day 14+:** Submit for App Review (separate process) to actually unlock the API permissions for end users.

Once Business Verification is approved, your app is **eligible to request advanced permissions** like `pages_manage_posts` and `instagram_content_publish` for the general public (not just you, the admin/developer). Until that point, only admin/developer/tester accounts can grant those permissions.
