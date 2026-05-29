# Production deployment — any Google user can sign in

You do **not** change app code to allow all Gmail users. You configure **Google Cloud Console** and deploy with HTTPS.

This app uses scope **`https://www.googleapis.com/auth/drive.file`** (files this app creates only). That is easier than `drive.appdata` and works well for a public CV maker.

---

## Where to configure login (Google Cloud Console)

Open: [https://console.cloud.google.com](https://console.cloud.google.com)

### 1. Create or select a project

Use one project for dev + production (or separate projects if you prefer).

### 2. Enable Google Drive API

**APIs & Services → Library** → search **Google Drive API** → **Enable**.

### 3. OAuth consent screen

**APIs & Services → OAuth consent screen**

| Setting | Value |
|--------|--------|
| User type | **External** (so anyone with a Google account can use it) |
| App name | CV Maker |
| User support email | Your Gmail |
| Developer contact | Your Gmail |
| Application home page | `https://YOUR-PRODUCTION-DOMAIN` |
| Privacy policy | `https://YOUR-PRODUCTION-DOMAIN/privacy.html` |
| Terms of service | `https://YOUR-PRODUCTION-DOMAIN/terms.html` |

**Authorized domains** (Consent screen → App domain):

- `vercel.app` if you use Vercel, **or**
- Your custom domain (e.g. `yourdomain.com`)

**Scopes** — click **Add or remove scopes** and include:

| Scope | Purpose |
|-------|---------|
| `openid` | Sign-in |
| `email` | Account email |
| `profile` | Name / avatar |
| `https://www.googleapis.com/auth/drive.file` | Save `cv-maker.json` in the user’s Drive (only files this app creates) |

Do **not** add `drive.appdata` unless you change the code back to that scope.

### 4. Let any Gmail user sign in (not just test users)

**While developing (Testing mode):**

- Consent screen → **Publishing status: Testing**
- **Test users** → add every Gmail address that should try the app (max 100)
- Only those accounts can sign in

**For production (any Google user):**

1. Deploy the app on **HTTPS** (see below).
2. Complete the consent screen (home page, privacy, terms, scopes).
3. OAuth consent screen → **Publish app** → move to **In production**.
4. If Google asks for **verification** (common for Drive scopes):
   - Click **Prepare for verification** / **Submit for verification**
   - Explain: *“We store each user’s CV as a single JSON file (`cv-maker.json`) in their Google Drive. We only access files created by this app via `drive.file`. We do not read or list the user’s other Drive files.”*
   - Add a short demo video: sign in → edit → Save → sign out → sign in → data loads
   - Approval often takes days to a few weeks; there is **no fee**

After the app is **In production** (and verified if required), **anyone with a Google account** can sign in — you do not add them as test users.

### 5. OAuth client ID (Web)

**APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**

**Authorized JavaScript origins** (add every URL users open):

```
http://localhost:5173
https://YOUR-PRODUCTION-DOMAIN
```

**Authorized redirect URIs** — usually leave empty for this SPA (`@react-oauth/google` uses the implicit/popup flow on the same origin). If Google requires URIs, add:

```
https://YOUR-PRODUCTION-DOMAIN
http://localhost:5173
```

Copy the **Client ID** → you will put it in hosting env vars (not in git).

---

## Deploy the app (example: Vercel)

1. Push this repo to GitHub.
2. [vercel.com](https://vercel.com) → **Add New Project** → import repo.
3. **Environment variables** (Production):

   | Name | Value |
   |------|--------|
   | `VITE_GOOGLE_CLIENT_ID` | `xxxx.apps.googleusercontent.com` |

4. Deploy → note URL, e.g. `https://cv-maker.vercel.app`.
5. Put that exact URL in OAuth **JavaScript origins** and consent screen **home / privacy / terms** links.
6. Redeploy if you change env vars.

### Other hosts

Any static host with HTTPS works (Netlify, Cloudflare Pages, Firebase Hosting, etc.):

```bash
npm install
npm run build
```

Upload the `dist/` folder. Set `VITE_GOOGLE_CLIENT_ID` at **build time** (Vite bakes it into the bundle).

---

## Local development

1. Copy `.env.example` → `.env`
2. Set `VITE_GOOGLE_CLIENT_ID` to the same Web client ID
3. Ensure `http://localhost:5173` is in **Authorized JavaScript origins**
4. While consent screen is in **Testing**, add your Gmail under **Test users**
5. Run:

```bash
npm install
npm run dev
```

---

## Checklist before going live

- [ ] `VITE_GOOGLE_CLIENT_ID` set on hosting (not committed in `.env`)
- [ ] Production HTTPS URL in OAuth JavaScript origins
- [ ] Privacy & terms URLs live (`/privacy.html`, `/terms.html`)
- [ ] OAuth consent screen **In production** (and verification submitted if prompted)
- [ ] Google Drive API enabled
- [ ] Test: sign in with a Gmail **not** on the test-user list (only works after production publish)

---

## Costs

| Item | Typical cost |
|------|----------------|
| Google OAuth | Free |
| Google Drive API | Free within quotas |
| Vercel hobby / Netlify free | Free tier available |
| Google verification | No fee (time only) |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “Access blocked” / app not verified | Still in Testing, or verification not approved — publish app or add user as test user |
| “Access blocked: This app’s request is invalid” | Wrong origin — add exact site URL (no trailing slash) to JavaScript origins |
| Drive 403 after sign-in | Enable Drive API; add `drive.file` scope on consent screen; sign out and sign in again |
| Blank app / Setup required | `VITE_GOOGLE_CLIENT_ID` missing at build time — set env and redeploy |
| Session expired | Sign out and sign in again (token expired) |

---

## Optional: custom domain

1. Add domain in Vercel (or your host).
2. Add `https://www.yourdomain.com` to OAuth **JavaScript origins**.
3. Update consent screen links and authorized domains.
