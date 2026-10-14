# Misty Fern — Munnar resort website

A responsive, SEO-friendly HTML/CSS/JavaScript website for Misty Fern, a family-friendly resort in Munnar, Kerala. The resort name, destination and listed facilities are confirmed; the exact address, contact details, room features, prices and property photographs still need owner verification. Replace every sample and illustrative image with information approved by the property owner before publishing.

## Pages and files

- `index.html` — home page, sample room cards, location and enquiry calls to action
- `about.html` — property story and nearby attractions
- `rooms.html` — illustrative room categories and explicitly labelled sample rates
- `facilities.html` — confirmed resort facilities and guest amenities
- `gallery.html` — category filters and keyboard-accessible image lightbox
- `contact.html` — validated stay enquiry form and contact/location placeholders
- `emailjs-config.js` — EmailJS service ID, template ID and public key for enquiries
- `404.html` — custom not-found page (`noindex,follow`)
- `styles.css` — shared responsive design, focus states and reduced-motion support
- `images/` — local website photos used by the home, about, contact, facilities and gallery pages
- `config.js` — owner-editable name, contact, location and canonical-domain settings
- `main.js` — shared header/footer, mobile navigation, gallery and form behaviour
- `robots.txt`, `sitemap.xml`, `favicon.svg` — technical SEO and site icon

## Test locally

Run a local static web server from this folder; do not open pages directly as `file://`, because the enquiry form requires an HTTP server.

With Python installed:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000/`. Check every page, mobile navigation, room enquiry links, gallery filters/lightbox (mouse and keyboard), and contact form validation. Configure EmailJS as described below before testing a real enquiry.

## Deploy and receive enquiries

1. Create an EmailJS service and email template in the EmailJS dashboard. In the template, use these form variables: `{{name}}`, `{{email}}`, `{{phone}}`, `{{guests}}`, `{{check_in}}`, `{{check_out}}`, `{{room_type}}` and `{{message}}`.
2. Replace `YOUR_EMAILJS_SERVICE_ID`, `YOUR_EMAILJS_TEMPLATE_ID` and `YOUR_EMAILJS_PUBLIC_KEY` in `emailjs-config.js` with the values from the EmailJS dashboard. The public key is intended for browser use; never put a private key or email account password in this file.
3. Deploy the site over HTTPS, send a test enquiry, and verify it arrives at the configured recipient before promoting the form. Do not show a successful submission unless EmailJS accepts it.
4. The current GitHub Pages sitemap and `canonicalBaseUrl` use `https://nithinvs4554-ai.github.io/munnar-resorts/`. If you switch to a custom domain, update `robots.txt`, `sitemap.xml` and `config.js` to match it.
5. Edit `config.js` with the property owner's approved name, exact Munnar address, phone, WhatsApp number, email and canonical production domain. `location` is prefilled as `Munnar, Kerala, India`. A canonical link and `Hotel` JSON-LD are only added when a real HTTPS domain and complete verified address are configured. Replace sample room categories, prices and policies with confirmed details.
6. Add verified social profiles and exact map embed/directions. Replace sample stock imagery with property-owned or appropriately licensed photographs and write accurate alt text.
7. Validate any generated structured data with Google's Rich Results Test and Schema Markup Validator; remove fields that cannot be substantiated.
8. Verify the production site in Google Search Console, choose the correct domain/property type, and submit `https://YOUR-VERIFIED-DOMAIN/sitemap.xml`. Check ownership using a Search Console verification method. Submission does not guarantee indexing or ranking.

## Pre-launch checklist

- [ ] Confirm the exact street address and resort map pin in Munnar; the configured location currently refers to Munnar generally.
- [ ] Confirm the hosting provider serves `404.html` with an HTTP 404 status.
- [ ] Confirm the GitHub Pages site and its `robots.txt`/`sitemap.xml` URLs are publicly accessible; update all absolute URLs if the public domain changes.
- [ ] Confirm or remove every sample room category, rate and guest capacity.
- [ ] Replace the general Munnar map search with a verified property pin, embed and route.
- [ ] Configure the WhatsApp link using the verified country code and phone number.
- [ ] Replace illustrative stock images with approved property photography; optimize large originals to WebP/AVIF and keep descriptive alt text.
- [ ] Local photos are stored in `images/`; stock images loaded from Unsplash are still remote references.
- [ ] Set per-page canonical and social URLs after the final domain is live on HTTPS.
- [ ] Configure EmailJS IDs, send a test enquiry, and verify delivery to the intended recipient.
- [ ] Test form validation, keyboard-only navigation, gallery filtering/lightbox, small screens and major browsers.
- [ ] Check page titles, descriptions, links, sitemap and robots file on the production domain.
- [ ] Run Lighthouse and validate any finalized structured data before launch.
