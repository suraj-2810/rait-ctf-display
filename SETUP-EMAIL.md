# Enable sponsor emails on Vercel

The sponsor form emails only ctf@rait.ac.in. The recipient is fixed on the server and cannot be changed through form fields. The formatted email contains contact name, company, email, phone, tier, message, consent, UTC timestamp and a reference. Reply goes to the sponsor. The separate pitch-deck download remains unchanged. Successful submission displays only Thank you.

## 1. Email sender

Create a Resend account, verify a domain you control, and create a sending API key. Choose a sender address on that verified domain. The sender does NOT have to be ctf@rait.ac.in; that is the recipient. Do not use the resend.dev test sender for arbitrary recipients. Never commit the API key or paste it into index.html.

## 2. Bot protection

Create a Cloudflare Turnstile widget for your exact production website hostname. Choose Managed mode. Keep its site key and secret key. The site key is public; the secret key belongs only in Vercel. Server-side verification is mandatory in this implementation and checks hostname and the sponsor action. Without configuration the form refuses to claim submission.

## 3. Vercel environment variables

In the existing project's Settings → Environment Variables, add these for Production:

| Name | Value |
| --- | --- |
| RESEND_API_KEY | Your Resend sending key |
| SPONSOR_FROM_EMAIL | RAIT CTF <sponsors@YOUR-VERIFIED-DOMAIN> |
| TURNSTILE_SITE_KEY | Your widget's public site key |
| TURNSTILE_SECRET_KEY | Your widget's secret key |
| SITE_URL | Exact canonical production origin, e.g. https://YOUR-SITE.vercel.app (no path) |

No recipient variable is needed: ctf@rait.ac.in is fixed in api/sponsor.js. Use one canonical origin; if using a custom domain, redirect alternate domains to it. Preview deployments will reject form requests unless separately configured with their own allowed origin and Turnstile hostname.

Use the project folder containing index.html, api/ and vercel.json as the Vercel root. For this plain HTML site, select Framework Preset Other; no build command is required and the output directory must be the project root, not an old dist folder. Redeploy after setting variables.

Configure a hosting firewall rate-limit rule for POST /api/sponsor appropriate to your event traffic. Turnstile limits automated abuse but cannot guarantee no human spam or volumetric traffic.

## 4. Replace the files in GitHub

Copy the new folder contents into the existing repository root, beside index.html. Remove the old admin.html, components/ and tracked .vercel/ contents if still present. Copy .gitignore and .vercelignore too; extracting on top of old files does not delete them.

From the repository root in PowerShell:

```powershell
git rm --ignore-unmatch admin.html
git rm -r --cached --ignore-unmatch .vercel components
git add .
git diff --cached --stat
git commit -m "Secure sponsor email delivery and harden site"
git push
```

The existing GitHub-to-Vercel integration should deploy that commit. Confirm the newest deployment is Production. Do not commit .env files. If any actual credentials were previously committed, revoke/rotate them; deleting a file does not erase Git history. No matching credential patterns were found in the source files reviewed here, but remote history was not available.

## 5. Verify after deploying

Download the deck without entering details. Open Become a Sponsor, complete the bot check and send one real test enquiry. Confirm that the formatted email arrives at ctf@rait.ac.in and Reply targets the entered email. Confirm Thank you appears and no PDF download occurs. Provider acceptance is not proof of inbox delivery; check spam/provider logs if necessary.

## Changes and scope

- Fixed terminal DOM injection: terminal output now uses textContent; inherited object properties cannot be called as commands.
- Removed unused browser-local asset admin and demo password input. The old admin was a local file editor, not a server-authenticated admin portal.
- Added hash-based script CSP, disabled inline event-handler execution, clickjacking protection, MIME sniffing prevention, referrer and permissions policies.
- Added same-origin enforcement, input/body limits, mandatory bot verification, escaped email content, fixed recipient, timeout/error handling and duplicate-click prevention.
- Removed .vercel linkage metadata and unused components from the package; added deployment/git exclusions. These project IDs were not API credentials.
- Sponsor information is not logged by the handler or saved in browser storage. Email and bot providers process submitted data as needed.
- Existing desktop challenge flags are public demo data. This frontend is not an authenticated CTF scoring platform; never place real competition flags, credentials or private scoring logic in it.

CSP hashes match the shipped inline scripts. If editing inline JavaScript later, regenerate the hashes in vercel.json or those scripts will be blocked. Do not solve that by enabling unsafe-inline for scripts.

Automated checks cover script syntax, CSP hashes, recipient enforcement, HTML escaping, validation and failure cases with mocked providers. No real email was sent; credentials, live headers, browser rendering, GitHub history and production deployment remain unverified. This is a targeted source review, not a guarantee against every vulnerability.

References:
- https://resend.com/docs/api-reference/emails/send-email
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://vercel.com/docs/project-configuration/vercel-json
