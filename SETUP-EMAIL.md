# RAIT CTF contact and sponsorship forms (Web3Forms)

The static website sends contact and sponsorship enquiries to Web3Forms. The existing retro-style modal and form styling are retained. No Resend API key, verified sender domain, Cloudflare Turnstile widget, Vercel environment variables, or custom backend is required for this integration.

## Setup

1. Create or sign in to your account at https://web3forms.com/.
2. Create an access key after verifying the inbox that should receive enquiries. The current site includes the access key in `index.html`; Web3Forms access keys are intended to be public on client-side forms.
3. Confirm the access key is associated with `ctf@rait.ac.in`. If it is associated with another inbox, create a key for the correct recipient and replace `WEB3FORMS_ACCESS_KEY` in the embedded sponsor script in `index.html` (and keep `assets/sponsor.js` in sync).
4. Deploy the project to Vercel with the project root containing `index.html`, `assets/`, and `vercel.json`. No build command is needed for this plain HTML website.
5. After deploying, test both a sponsorship enquiry and the Contact link, then confirm receipt at `ctf@rait.ac.in` and check that replying targets the submitter's email.

## What's connected

- Sponsor package buttons, the Become a Sponsor button, and the footer SPONSOR US button open the sponsorship enquiry form.
- The footer Contact link and email icon open a general contact form.
- Both flows submit via `POST https://api.web3forms.com/submit`.
- The website uses Web3Forms' response to show a success screen only after the service confirms success, and displays an error when submission fails.
- A hidden honeypot is included as a lightweight anti-spam measure. This is not a substitute for stronger CAPTCHA protection if spam becomes a problem.
- The pitch-deck download remains a separate direct download and does not ask visitors to fill out a form.

## Notes

There was no newsletter/Subscribe form in this project, so this update does not create a mailing list or imply that someone has been subscribed. Web3Forms forwards form enquiries; it is not by itself a newsletter subscription-management service.

If you are replacing files inside an existing GitHub repository rather than deploying the ZIP as a clean project, delete the old `api/form-config.js` and `api/sponsor.js` files from the repository because they belong to the previous Resend + Turnstile implementation. Also remove the old `RESEND_API_KEY`, `SPONSOR_FROM_EMAIL`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, and `SITE_URL` variables from Vercel after the new version is deployed.

A source-code update cannot verify live delivery by itself. Do one real test submission after deployment and check the Web3Forms response and recipient inbox.
