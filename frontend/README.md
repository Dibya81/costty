# Folio — Print Cost Estimation + Document Intelligence (frontend only)

A frontend-only build of the three experiences from the brief — a ScrollCraft
landing page, a user application, and an admin dashboard — sharing one design
system. No backend: everything lives in `src/services` + `src/data` behind
async function calls, so a real API can be dropped in later without touching
any page or component.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checks, then production build to dist/
npm run preview   # serve the production build locally
```

Requires Node 18+.

## Routes

| Path | What's there |
|---|---|
| `/` | Landing page (ScrollCraft-driven) |
| `/app/dashboard` | Recent documents, estimates, shares, quick actions |
| `/app/documents` | Upload, search, filter, sort, rename, delete, download, share |
| `/app/intelligence` | Simulated document analysis pipeline |
| `/app/estimator` | Live print-cost calculator + saved history |
| `/app/shared` | Manage share links (create, copy, revoke) |
| `/app/community` | Browse/post document requests, offer files, mark fulfilled |
| `/admin` | Platform overview: revenue, users, documents, estimates, community |

## Architecture

```
src/
├── pages/            route-level screens (app/, admin/, Landing.tsx)
├── components/        ui/ (primitives), app/, admin/, landing/
├── layouts/           AppShell (sidebar), AdminShell (dense top bar)
├── services/          documentService, printService, shareService,
│                      communityService, analyticsService — every export
│                      returns a Promise so swapping in a real API later
│                      is a body-only change, not a call-site change
├── data/              seed/mock data consumed by the services
├── types/             shared TypeScript contracts
├── hooks/             useAsync, useDebouncedValue, useMediaQuery
├── utils/             currency (paise-based math), date, id, cn, fileType
├── styles/            tokens.css (the whole palette/type system), globals.css
└── lib/scrollcraft/   the ScrollCraft engine, copied verbatim (see below)
```

## Design system

One palette and type system shared by all three surfaces:

- **Palette** — warm paper canvas, near-black ink, a single accent: a
  proofing/redline red, the pencil colour of an actual print correction mark.
  Chosen because it's grounded in the print domain rather than a generic
  SaaS default (see `src/styles/tokens.css` for the reasoning and hex values).
- **Type** — Archivo (display), IBM Plex Sans (text), IBM Plex Mono (data,
  labels, the spec-sheet/receipt numbers). Deliberately not Inter.
- **Admin** is visually distinct (dark top bar, denser tables) while reusing
  the same tokens — different purpose, same brand, per the spec.

## The landing page

Built with ScrollCraft's (https://github.com/nateherkai/scroll-craft)
methodology rather than generic scroll animations. `docs/BRIEF.md` has the
full reasoning: which grammar was picked and why, the signature move, and
what "verification" means in an environment with no browser/screenshot tool.
The short version — the engine files under `src/lib/scrollcraft/` are
untouched; every visual decision lives in the page's own markup and CSS
variables, which is how the engine is meant to be used.

## Known limitations (frontend-only, by design)

- All data is in-memory and resets on a full page reload.
- File uploads use the real browser File API for name/size/type, but page
  counts and "analysis" results are simulated (no server-side parsing).
- Admin numbers are a separate, larger mock dataset representing "the whole
  platform," not derived from the single-user seed data used elsewhere.
