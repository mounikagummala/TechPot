# TechPot website (techpot.in)

Static site: plain HTML, CSS and JavaScript. No build step. Hosted on Vercel, code kept on GitHub.

## Folder layout (names are case sensitive, keep them lowercase)
```
index.html  services.html  tools.html  learn.html  videos.html  team.html
founder.html  contact.html  privacy.html  terms.html  disclaimer.html  404.html
style.css  site-config.js  vercel.json  sitemap.xml  robots.txt  README.md
js/        main.js  calc.js
assets/    fonts/ (6 .woff2 files)   img/ (logo, favicons, portrait, certificate, og.png)
```

## Deploy on Vercel
1. vercel.com, Add New, Project, import the GitHub repo `TechPot`.
2. Framework Preset: **Other**. Build Command: empty. Output Directory: empty (project root). Deploy.
3. Project, Settings, Domains: add `techpot.in` and `www.techpot.in`. Make `techpot.in` the main one and set `www` to redirect to it.
4. At GoDaddy DNS, use exactly the records Vercel shows for each domain (usually an A record for `@` and a CNAME for `www`). Delete the old GitHub Pages A records (185.199.108.153 to 185.199.111.153) first.
5. Every push to `main` redeploys automatically. Other branches get their own preview link, handy for QA.

## Edit without touching code: `site-config.js`
WhatsApp, email, YouTube, registrations and the latest Instagram Reels (pasted as links, embedded automatically).

## Keep it honest
- Certificate dated 13 Aug 2026. Replace `assets/img/certificate.*` and `certificate-sm.*` and the dates in `founder.html` each year.
- No investment advice or insurance selling claims unless the matching SEBI registration or IRDAI licence is held; list it in `site-config.js`.
- Add the "Chartered Accountants" wording only for team members who hold the qualification.
- Have a lawyer review `privacy.html` and `terms.html`. Update privacy if analytics are added.
- Add a team member by copying the Pavan block in `team.html`.
