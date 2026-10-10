# RAIT CTF — revision 3

Open index.html from this extracted folder. The new styling and sponsor interaction are embedded directly in index.html to avoid loading an older cached CSS/JS file. Keep assets/ alongside it for images and the PDF.

- Download pitch deck is a standalone button above sponsorship tiers. It requires no form.
- Submit validates the form and displays only a thank-you panel. There is no download, mail app, network request or backend dependency on submission.
- This is a presentation-only form: details are not delivered or saved. The thank-you text does not claim delivery.
- Stats use an explicitly opaque background, with no blur or transparent layer.
- Existing mobile, keyboard and footer improvements remain.

Replace the previous deployment files with this folder to see the changes on your live site. No live deployment was performed here.

Verified JavaScript syntax, section placement, identical PDF and absence of network/download behavior from form submission. Browser visual testing was unavailable.
