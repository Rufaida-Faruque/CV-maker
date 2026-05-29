# CV Maker

Personal CV editor with Google sign-in. Each user’s CV is stored as `cv-maker.json` in their own Google Drive (via the `drive.file` scope).

## Local development

```bash
npm install
cp .env.example .env
# Add VITE_GOOGLE_CLIENT_ID from Google Cloud Console
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Production — any Google user can log in

**You configure Google Cloud Console, not special code in this repo.**

1. Read **[PRODUCTION.md](./PRODUCTION.md)** (step-by-step).
2. Set `VITE_GOOGLE_CLIENT_ID` on your host (Vercel, Netlify, etc.).
3. OAuth consent screen → **Publish app** (move out of Testing).
4. Add your production HTTPS URL to **Authorized JavaScript origins**.

While the app is in **Testing** mode, only emails listed under **Test users** on the consent screen can sign in.

## Build

```bash
npm run build
npm run preview
```

Output is in `dist/`.

## Stack

- React + TypeScript + Vite
- Google OAuth (`@react-oauth/google`)
- Google Drive API (`drive.file`)
- PDF export (html2canvas + jsPDF)
