# HMR Luxury Cleaning LLC — website

Open `index.html` to preview. Upload the whole folder to any host (Netlify, Vercel, GoDaddy, cPanel). Booking emails need the site on a real domain, not a local file.

## 1. Make booking emails work (invoice to client + request to HMR)

A static site cannot send email by itself, so this uses EmailJS (free tier, no server).

1. Create an account at https://www.emailjs.com
2. **Email Services → Add New Service** (Gmail works). Copy the **Service ID**.
3. **Email Templates → Create New Template**, twice (one "Client invoice", one "Cleaning request"). In BOTH:
   - To Email: `{{to_email}}`
   - Subject: `{{subject}}`
   - From Name: `{{from_name}}`
   - Reply To: `{{reply_to}}`
   - Content (use the code / HTML editor): `{{{html}}}`   ← three braces, so the invoice is not escaped
   Copy each **Template ID**.
4. **Account → General**: copy your **Public Key**.
5. In `js/script.js`, fill the `CONFIG.emailjs` block:
   `emailjs:{serviceId:'service_xxx',publicKey:'xxxx',clientTemplateId:'template_aaa',businessTemplateId:'template_bbb'}`
6. In EmailJS **Security**, restrict the key to your domain. Test one booking with your own email.

Until this is filled in, booking still works: the invoice shows on screen (print or save as PDF) and a button opens an email to HMR.
Remodeling / construction cleanups show "To be quoted" on the invoice, because they are priced after a walk-through.

## 2. Prices — IMPORTANT
Every number in `PRICE` (top of `js/script.js`) is a placeholder: base prices, per-bedroom/bathroom extras, size multipliers, add-ons and maintenance discounts. The add-on list on `pricing.html` is also placeholder text. Replace them with HMR's real pricing before launch.

## 3. Images
- Logo files extracted from the banner: `images/logo-gold.png` (full) and `images/crest-gold.png` (crest only). Both are gold on transparent so they work on light and dark backgrounds.
- CEO photos: `ceo-portrait.jpg`, `ceo-wide.jpg`, `ceo-selfie.jpg`, plus the collage split into `ceo-kneel`, `ceo-dust`, `ceo-island`, `ceo-crouch`, `ceo-stand`, `ceo-clip` and `room-island`.
- Flyer: `images/flier.jpg`. Banner: `images/banner.jpg`.
- Before/after: `images/gallery/pair1-*` (door and trim) and `pair2-*` (hearth and playroom). Add more as `pair3-before.jpg` / `pair3-after.jpg`, then add `ba(3,"Caption","detail")` to the gallery list in `build.py` and run `python3 build.py`.

## 4. Confirm with the owner
- Her name and story (marked with an EDIT comment in `about.html`). HMR may stand for her name, so ask how she wants it presented.
- The Facebook link is a search link; replace it with her real page URL.
- Cities listed (Austin, Pflugerville, Round Rock, Georgetown, Del Valle) come from her posts; edit `CITIES` in `build.py`.
- Services wording, checklist lines, payment methods, cancellation policy and insurance wording (Terms is a template).
- The "Giving back through The Clean Cause Foundation" line on the About page comes from her public posts. Remove it if she prefers.
