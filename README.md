# TechPot website (techpot.in)

Static site for GitHub Pages: plain HTML, CSS and JavaScript, no build step.

## Pages
- `index.html` Home, `services.html`, `tools.html` (nine calculators), `learn.html`, `videos.html`, `team.html`, `founder.html`, `contact.html`, `privacy.html`, `terms.html`, `disclaimer.html`, `404.html`
- `site-config.js` the one file you edit for WhatsApp, email, YouTube, registrations and the **latest videos list** (all empty by default; empty items stay hidden)
- `assets/` self-hosted fonts and images (logo, favicons, founder portrait, certificate, social preview)
- `CNAME`, `.nojekyll`, `sitemap.xml`, `robots.txt`

## Add a video
Open `site-config.js` and add a line inside `videos: [ ... ]`, for example
`{ title: "Failed transaction: what the rules say", url: "https://www.instagram.com/reel/XXXX/", note: "Banking" },`
It then appears on Home and the Videos page. Optional `thumb: "assets/img/my-reel.jpg"` adds a thumbnail.

## Add a team member
Copy the Pavan block (`<article class="card member">...`) in `team.html`, change the photo, name, role and text, and place it before the "More members soon" card. Add the photo to `assets/img/`.

## Put it on GitHub Pages
1. Create a repository (for example `techpot-site`) and upload everything in this folder, including `CNAME` and `.nojekyll`.
2. **Settings, Pages**: Deploy from a branch, `main`, `/ (root)`, Save.
3. The site works at `https://YOUR-USERNAME.github.io/techpot-site/` (links are relative; only the 404 page needs the custom domain).

## Connect techpot.in
1. **Settings, Pages, Custom domain**: `techpot.in`, Save.
2. At your domain provider add A records for `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153.
3. Add a CNAME for `www` pointing to `YOUR-USERNAME.github.io`.
4. After DNS finishes (up to 24 hours) tick **Enforce HTTPS**. No wildcard DNS records.

## Keep it honest (important)
- The founder certificate is dated 13 Aug 2026. Certificates of practice renew each year: replace `assets/img/certificate.*` and `certificate-sm.*` and update the dates in `founder.html` after each renewal.
- Do not describe TechPot as giving investment advice or selling insurance unless the right SEBI registration or IRDAI licence is held. If one is, add it to `registrations` in `site-config.js`.
- Add the "Chartered Accountants" line only for team members who actually hold that qualification.
- Verify the Telugu tagline wording on the home page with a native speaker.
- When a Reel goes live, add it to the Learn page and link the Instagram post.
- Branding is fixed to the TechPot logo (navy and gold). Logo files are in `assets/img/` (`logo-round.webp`, `logo-512.png`, favicons, `apple-touch-icon.png`). Replace them only if the logo itself changes.
- On phones the site shows a bottom tab bar (Home, Services, Tools, Learn, Founder), like an app.
