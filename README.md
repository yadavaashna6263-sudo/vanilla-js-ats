# Spotlight — Frontend Recruitment Application System (ATS)

A pure vanilla HTML/CSS/JS, multi-page Applicant Tracking System. No frameworks,
no build step, no backend — open `index.html` and it runs.

**Design concept:** every screen is staged like a single spotlight on a dark
set — warm amber light for primary actions and focus states, cool teal for
progress and success. The metaphor follows the candidate from the hero
("step into the spotlight") through to the Application ID reveal on the
success page.

## Running it

No install, no server required:

```
open index.html
```

(Or use any static file server / the VS Code "Live Server" extension —
either works identically since there's nothing to build.)

## User flow

```
index.html  →  jobs.html  →  application-step1.html  →  application-step2.html
            →  application-step3.html  →  account.html  →  review.html  →  success.html
            →  dashboard.html
```

## Folder structure

```
ATS-Recruitment-System/
├── index.html                 Home — hero, animated stats, perks
├── jobs.html                   Job listings — search + filters + salary/tech-stack
├── application-step1.html      Personal Information
├── application-step2.html      Professional Information (links, education, searchable skills)
├── application-step3.html      Experience & Resume (dates, salary, upload, resume score, cover letter)
├── account.html                 Password creation + strength meter
├── review.html                  Candidate card + readiness score + full summary + declaration
├── success.html                  Application ID reveal
├── dashboard.html                 Application status timeline + demo controls
│
├── css/
│   ├── style.css        Design tokens, reset, layout, header/footer, buttons, cards,
│   │                    completion widget, readiness ring, breadcrumb, error summary,
│   │                    skill autocomplete, candidate card, upgraded job cards
│   ├── theme.css         Light-mode override (dark is the default :root theme)
│   ├── forms.css         Inputs, validation states, upload zone, password meter,
│   │                     progress bar, declaration, toasts, resume score
│   ├── dashboard.css       Status timeline + demo-controls panel (dashboard.html only)
│   ├── animations.css    All @keyframes + prefers-reduced-motion handling
│   └── responsive.css    Breakpoints (1024 / 768 / 420px) + mobile nav
│
├── js/
│   ├── storage.js     candidateProfile persistence + status tracking (single source of truth)
│   ├── app.js          Toasts, mobile nav, footer year, stat counters, success reveal
│   ├── theme.js         Dark/light toggle, persisted in localStorage
│   ├── progress.js      Sticky progress bar + step dots + breadcrumb nav
│   ├── completion.js     Profile Completion Score widget (top of every flow page)
│   ├── validation.js    Regex validators + disposable-email check + error summary +
│   │                     Step 1 wiring + Step 2/3 field checks
│   ├── jobs.js           Job data (salary/remote/tech-stack), search, filters, Apply
│   ├── skills.js          Step 2 searchable skill autocomplete (chips, keyboard nav)
│   ├── upload.js          Step 3 resume drag-and-drop, Resume Score, Step 3 gating
│   ├── experience.js      Step 3 date-diff calculator
│   ├── password.js         Account page strength meter + confirm match
│   ├── review.js            Candidate card, readiness score, full summary, submit
│   ├── readiness.js          Candidate Readiness Score (circular ring) — review + dashboard
│   └── dashboard.js           Status timeline render + simulate-status demo controls
│
└── assets/
    ├── images/, icons/, illustrations/   (empty — see note below)
```

## What's new in this pass

- **Application Dashboard** (`dashboard.html`) — a status timeline (Submitted → Under
  Review → Interview Scheduled → Accepted, or a Rejected branch), stored in
  `candidateProfile.meta.status` / `statusHistory`. Since there's no backend to actually
  move a real application forward, the page is upfront about it with a labelled
  **"Demo controls — no backend"** panel that simulates a recruiter advancing or
  rejecting the application.
- **Profile Completion Score** — a live `completedFields / totalFields × 100` bar at
  the top of every step (1–3, Account, Review), recalculating as you type on any page.
- **Candidate Readiness Score** — a weighted, circular-ring score (LinkedIn +10, GitHub
  +10, Portfolio +15, Resume +20, Cover letter +20, 3+ skills +15, Experience +10 = 100),
  shown on Review and the Dashboard.
- **Resume Score (/100)** — a separate, simpler score on Step 3 itself (Skills, Portfolio,
  GitHub, Cover Letter, Experience — 20 points each), so the resume page has its own
  immediate feedback loop distinct from the whole-application Readiness Score.
- **Searchable skill autocomplete** — replaced the static tag grid with a type-to-filter
  input (full keyboard support: arrow keys, Enter, Escape) and removable chips.
- **Richer job cards** — salary range, Remote/Hybrid/On-site badge, and tech-stack chips
  per role.
- **Candidate preview card** on Review — avatar initials, name, applied role, location,
  computed experience, and skill chips, like a recruiter's view of the application.
- **Error summary banner** — "Please fix N errors before continuing," with jump-links to
  each problem field, appearing once the candidate has started interacting with a form
  (accessibility pattern; complements rather than replaces the disabled-Next-button gating).
- **Required-field asterisks** on every mandatory label.
- **Disposable email blocklist** — a plain JS array check (tempmail.com, 10minutemail.com,
  mailinator.com, etc.) rejected at the email field with a specific message.
- **Breadcrumb navigation** — "Personal › Professional › Experience › Account › Review,"
  with completed steps as real links back, the current step bolded, and pending steps
  dimmed — replacing the old plain-text step labels.

Two things already in the first build needed no extra work to satisfy this round's
requests: **duplicate-skill prevention** is structural (skills live in a `Set`, so a
duplicate selection is simply impossible), and **expected-≥-current salary validation**
was already in Step 3.



## Architecture decisions worth knowing

- **Global functions, not ES modules.** Every JS file just declares functions
  on the page's global scope and is loaded with a plain `<script src="...">`
  tag, in a fixed order (`storage.js` → `app.js` → `theme.js` → `progress.js`
  → page-specific files). No `import`/`export`, no bundler.
- **One shared `candidateProfile` object** in `localStorage`, read and written
  exclusively through the functions in `storage.js` (`getProfile`,
  `updateProfile`, `setProfileField`, `saveProfile`). No other file touches
  `localStorage` directly, so the saved shape only has to be understood in
  one place.
- **Self-guarding page scripts.** Every feature file checks for its own
  trigger element first (e.g. `skills.js` bails out if `#skillsBoard` isn't
  on the page) so the same script can safely be left out of — or
  accidentally included on — any page without errors.
- **Opt-in progress bar.** The tracker only renders on pages with a
  `data-progress` attribute on `<body>`. Home and Jobs don't set it, so no
  bar shows there; the five application-flow pages set 20/40/60/80/100.
- **Resume uploads store metadata only** (`{ name, size }`), not the binary —
  `localStorage` isn't built for multi-megabyte payloads. The upload/drag-drop
  UX itself is fully real; only the "saved across a reload" part is a
  metadata-only stand-in.
- **Passwords are never persisted.** `account.html` only writes a boolean
  `passwordCreated` flag to the profile, never the password value.
- **No image assets.** Every icon (theme toggle, hamburger, checkmarks,
  upload cloud, document icon) is hand-written inline SVG, so the project has
  zero external dependencies beyond the three Google Fonts (Fraunces,
  Manrope, JetBrains Mono) loaded in `style.css`. `assets/` is scaffolded per
  the original spec and ready for real images if you add them later.

## Known simplifications (by design, for a frontend-only demo)

- "Edit" buttons on the review page link back to the relevant step, but
  finishing that step continues forward through the wizard rather than
  jumping straight back to Review. Easy to wire up later if you want a true
  "save and return" pattern.
- There's no real authentication — the account step is a UX/validation
  showcase (strength meter, confirm-match), not a real login system.
