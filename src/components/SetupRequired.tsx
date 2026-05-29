export default function SetupRequired() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Setup required</h1>
        <p>
          Copy <code>.env.example</code> to <code>.env</code> and add your
          Google OAuth client ID. See <code>PRODUCTION.md</code> for allowing
          any Gmail user to sign in after deploy.
        </p>
        <ol className="setup-steps">
          <li>
            Open{" "}
            <a
              href="https://console.cloud.google.com"
              target="_blank"
              rel="noreferrer"
            >
              Google Cloud Console
            </a>{" "}
            → create or select a project
          </li>
          <li>
            Enable <strong>Google Drive API</strong> (APIs &amp; Services →
            Library)
          </li>
          <li>
            OAuth consent screen → External → add scopes (openid, email,
            profile, drive.file) — see PRODUCTION.md
          </li>
          <li>
            Credentials → Create OAuth client ID → <strong>Web application</strong>
          </li>
          <li>
            Authorized JavaScript origins:{" "}
            <code>{window.location.origin}</code>
          </li>
          <li>
            Copy Client ID into <code>VITE_GOOGLE_CLIENT_ID</code> in{" "}
            <code>.env</code>
          </li>
          <li>
            Restart <code>npm run dev</code>
          </li>
        </ol>
      </div>
    </div>
  );
}
