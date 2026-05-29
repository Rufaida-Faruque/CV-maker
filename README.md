# CV Maker

**Live app:** [https://cv-maker-tau-one.vercel.app/](https://cv-maker-tau-one.vercel.app/)

A personal CV builder with Google sign-in. Edit on the left, preview on the right, and save to your own Google Drive. Each account gets a private `cv-maker.json` file (only this app can access it via the `drive.file` scope).

## Features

- Sign in with Google — no separate password
- Multiple CV versions (master + copies) with selective sync from master
- Layouts: Classic, European, Professional sidebar, Creative timeline
- Custom colors and PDF download
- Certificates & attachments (PDF, images) appended to exported PDF
- Auto-save to Google Drive every 3 minutes

## Try it

👉 **[Open CV Maker](https://cv-maker-tau-one.vercel.app/)**

## Local development

```bash
npm install
cp .env.example .env
```

Add your OAuth Web client ID to `.env`:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

While Google OAuth is in **Testing** mode, add your Gmail under **Test users** in [Google Cloud Console](https://console.cloud.google.com/).

## Deploy your own copy

See **[PRODUCTION.md](./PRODUCTION.md)** for:

- Setting `VITE_GOOGLE_CLIENT_ID` on Vercel (or another host)
- OAuth consent screen and **Publish app** so any Google user can sign in
- Authorized JavaScript origins for your domain

## Build

```bash
npm run build
npm run preview
```

Static output is in `dist/`.

## Stack

- React 19 + TypeScript + Vite
- Google OAuth ([`@react-oauth/google`](https://www.npmjs.com/package/@react-oauth/google))
- Google Drive API (`drive.file`)
- PDF export (html2canvas + jsPDF + pdf-lib for attachments)

## License

Private / personal project — adjust as needed for your fork.
