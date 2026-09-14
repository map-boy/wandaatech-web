# VAF UBWENGE TECH — setup and operations

Two things live in this document: how to switch the site on, and what Google
AdSense expects before it will approve the account.

---

## 1. Environment variables

Set these in Vercel (Project → Settings → Environment Variables), or in
`.env.local` for local development.

| Variable | Required | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public read key. Read-only in practice — RLS grants it `SELECT` on published content and nothing else. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-only. Every admin write and image upload uses it. **Never** prefix it with `NEXT_PUBLIC_`. |
| `ADMIN_PASSWORD` | yes | The password for `/admin`. |
| `ADMIN_SESSION_SECRET` | recommended | Signs the admin session cookie. Falls back to `ADMIN_PASSWORD`, which means changing the password logs everyone out. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | no | e.g. `ca-pub-6727162627172885`. Defaults to the account this site was verified with. |
| `NEXT_PUBLIC_ADS_DISABLED` | no | Set to `true` to suppress all ads in a production deployment (useful for a staging URL). |
| `NEXT_PUBLIC_GA_ID` | no | Google Analytics 4 measurement ID. |

Ads never render outside `NODE_ENV=production`, so localhost never generates ad
requests. That matters: traffic from a developer machine counts as invalid and
is the fastest way to get an AdSense account limited.

---

## 2. Database

Run `supabase/migrations/0001_cms_and_monetization.sql` once in the Supabase SQL
editor. It is safe to re-run. It creates the content tables, the articles and ad
slot tables, the contact inbox, the row-level security policies, and the public
`site-media` storage bucket that image uploads go into.

Then open `/admin` → **Site Content** → **Sync fields**. That inserts every
editable string on the site with its current text. Nothing you have already
edited is overwritten, so press it again after any deploy that adds new fields.

---

## 3. How editing works

`/admin` is reachable by clicking the footer wordmark twenty times, or by going
to `/admin` directly. There is no link to it anywhere on the public site.

| Tab | What it controls |
| --- | --- |
| Site Content | Every heading, paragraph, button label, image and link on the public pages. |
| Sections & Tabs | Show, hide and reorder whole sections of the home page. |
| Image Media | A library of uploaded images you can reuse anywhere. |
| Team Roster | Members, photos, bios, skills, social links and each person's project portfolio. |
| Project Blocks | The company portfolio. A project can be attributed to a team member, which also lists it on their profile. |
| Gallery Layers | Photos, captions and filter categories. |
| Articles | The `/insights` feed. |
| Monetization | AdSense readiness checklist and the slot ID for each ad placement. |
| Inbox | Messages from the contact form. |
| Competitions / Registrations / Leaderboard / Submissions | The existing ML competition system. |

Every field has a built-in default in `lib/site-defaults.ts`. If the database is
empty, unreachable, or a key is missing, the site renders the default rather
than a blank space — so it is never possible to break the public site by
clearing a field.

Saving purges the page cache, so edits appear on the next page load.

### Adding a new editable field

1. Add an entry to `SITE_CONTENT_DEFAULTS` in `lib/site-defaults.ts`.
2. Read it in a server component with `const c = await getContent()` then
   `c.t('your.key')`. Lists use `c.list(...)`; `A | B` lines use `c.pairs(...)`.
3. Deploy, then press **Sync fields** in the panel.

---

## 4. Google AdSense

### What is already in place

- **Policy pages**: `/privacy` (with the third-party vendor and Google ad cookie
  disclosures AdSense requires), `/cookie-policy`, `/terms`, `/disclaimer`.
- **Contact and about**: `/contact` with a working form, `/company` explaining
  who publishes the site. Reviewers look for both.
- **Consent Mode v2**: everything starts denied in the document head before any
  Google tag loads. The banner offers "Reject all" as a first-class button; if
  ads are declined they still serve, but non-personalised. Visitors can change
  their mind from the footer at any time.
- **`ads.txt`** at the domain root.
- **`robots.txt`** explicitly allows `Mediapartners-Google` and `AdsBot-Google`,
  and disallows `/admin` and `/api/`.
- **Ad units** carry a visible "Advertisement" label, reserve space to avoid
  layout shift, collapse when unfilled, and never render on policy or admin
  pages.

### What you still have to do

1. **Write content.** This is the one thing that cannot be automated and the
   most common reason for rejection. AdSense wants substantial, original
   material. Aim for at least ten real articles in the Articles tab before
   applying — write-ups of what you built, what broke, and what you learned.
   The Monetization tab tracks this count.
2. **Create ad units** in AdSense (Ads → By ad unit). Copy each slot ID.
3. **Paste the slot IDs** into `/admin` → Monetization and enable the
   placements you want. A placement with no slot ID renders nothing, so the
   site stays clean while the application is pending.
4. **Submit for review** once the checklist in the Monetization tab is green.

### Placements available

`home-top`, `home-mid`, `article-top`, `article-inline`, `article-bottom`,
`list-grid`, `sidebar`. Use `fluid` format for the in-article and in-feed ones.

To add an ad somewhere new, drop `<AdSlot placement="home-mid" />` into a server
component. It renders nothing until that placement has a slot ID.

---

## 5. Security notes

- The admin password is exchanged for a signed, httpOnly, SameSite=strict
  cookie. The panel's `authed` flag is only a UI hint — every write is
  authorised server-side.
- The browser never holds a key that can write. All writes go through
  `/api/admin/*` and run with the service role, against an allowlist of tables.
- Admin-authored text is rendered as text, never as HTML, so panel content
  cannot inject script into the public site.
- Uploads are checked server-side for type (images only) and size (8 MB).
