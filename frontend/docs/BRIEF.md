# BRIEF.md — self-authored

ScrollCraft's normal flow is an interview with a human, then a fingerprint
check against past builds, then a Playwright-driven visual verification pass
using kie.ai for any generated media. None of that ran here: the "human" was
a written product spec handed to Claude in a single message
(`scroll-craft-main.zip` + the platform brief), not a live conversation, and
this environment has no network access to kie.ai and no browser automation.
So the interview is self-authored below, and "verification" at the bottom is
honest about what it could and couldn't check.

## Interview answers (inferred from the brief, not asked)

1. **What is this, one sentence.** A tool that reads a document, tells you
   what it is, and prices printing it — with sharing and a small community
   layer around the edges.
2. **Who lands here.** Someone who already has a print job in mind — a
   student with a stack of notes, someone estimating a report run — not a
   cold visitor being sold a category.
3. **What should they feel by the end.** That the tool actually computes
   things, rather than promising to.
4. **The one thing that must land.** The estimate is real math, not a
   marketing number. 100 pages, 2 copies, B&W, duplex, ₹300 is arithmetic,
   not a made-up "starting at" price.
5. **What's off-limits.** Fake statistics, fake testimonials, stock imagery
   of people at desks — all explicitly banned in the brief, and all things
   the "live surface" grammar bans structurally anyway (see below).
6. **Competitive landscape / tone reference.** None given. Defaulted to
   "the demo is the argument" rather than positioning against print-shop
   SaaS competitors.
7. **Technical ceiling.** No video assets, no image generation available in
   this environment — which made the choice of world (below) as much a
   constraint as a taste decision.
8. **Existing brand.** None. Built from nothing, so the palette and type
   system had to be justified from the product itself, not matched to an
   existing mark.

## Grammar: Live surface

Section 2.3 of `uniqueness.md`. Fits because the honest pitch really is
"watch it compute a number" — Folio's own hero request in the brief is
literally a scroll-driven document that turns into a price, which *is* live
surface's definition, not something bent to fit it.

Consequences taken seriously, not just noted:
- No wordmark-plus-CTA bar. The nav (`AppTabStrip.tsx`) is real links into
  the real `/app/*` routes — clicking "Documents" in the landing nav takes
  you to the actual Documents page. It's navigation, not a preview of one.
- No hero headline in display type. The largest text on the page outside the
  final computed number is a two-line status paragraph; everything else is
  label-scale (`text-xs`/`text-sm`, mono, uppercase) — "surface idiom," per
  the grammar's own phrase.
- No `scrub`, `kinetic`, or `spotlight` devices anywhere in the build.
- The close is a real two-field estimator (`CloseEstimator.tsx`), not a
  magnetic CTA button — the grammar requires the page end on an actual input.
- The honesty rule: `DocumentSurface.tsx` and `ModulePanels.tsx` both import
  and call the *same* `calculateEstimate`, `getSeedDocuments`, etc. that the
  real app pages use. Nothing on the landing page is a picture of an answer;
  it's the answer, computed, on data that's labelled as a sample
  (`sample_report.pdf`, "sample data throughout" in the footer).

## World: Technical drawing

Section 8 of `worlds.md`: monochrome ink line work on a warm paper ground,
patent/assembly-diagram style, orthographic. Picked for two reasons that
happen to line up:

- It's the one world in the file that is *not* photographic by construction,
  which matters because this environment cannot generate or fetch photoreal
  media. Every other world assumes footage or stills; this one assumes lines,
  which is what an SVG `<path>` with `pathLength="1"` and a scroll-driven
  `stroke-dashoffset` already is.
- It's genuinely on-brief: a print-cost tool drawing a *document* as a
  technical illustration, with a dimension-line/callout legend beside it, is
  the product's own domain, not a borrowed aesthetic.

## Signature move: the document that draws itself

`DocumentSurface.tsx`. One `data-sc-act="pin"`, not several animation
systems: the SVG document outline and its text lines draw themselves via
`--sc-p` (published by the engine on the act element — see
`scrollcraft.js`'s own comment above `mount()`), and five `data-sc-cue`
rows — the same device used everywhere else — populate a spec-sheet legend
beside it: file type, metadata, pages, print configuration, then the real
computed total, counted up with `data-sc-count`. This single sequence *is*
the brief's hero narrative, its "signature interaction," and its "visual
peak" — one move doing all three jobs the brief asked for separately, rather
than three separate systems bolted together.

## Palette

`src/styles/tokens.css` has the values; the reasoning: a warm-cream-plus-
terracotta-plus-serif combination and a near-black-plus-neon-accent
combination are both named as recognizable AI-generated tells in this
project's design guidance. This build uses neither. The accent is a
proofing/redline red — the pencil colour used on an actual print correction
mark — chosen because the product is about printing, not because red is a
safe default. It is the *only* accent in the build; status badges (positive/
warning/info) are deliberately desaturated so they read as functional states,
not as competing brand colours.

## Fingerprint gate

The normal gate checks a build against past ScrollCraft builds on the same
machine to catch repeated defaults. There is no persistent record of past
builds available here, so this section can't be run as designed. What can be
said honestly: nothing in this build reaches for the filmic-one-shot default
described in `uniqueness.md` §1 (no full-bleed scrub hero, no pinned
crossfade type act, no spotlight-plus-magnet close) — the live-surface
constraints made those choices unavailable rather than avoided by discipline.

## Verification — what actually happened, and what didn't

This environment has a sandboxed shell with no browser and no screenshot
tool. What was actually run:

- `npx tsc -b` — clean, no errors.
- `npx vite build` — clean production build, route-level code-splitting
  confirmed by chunk output (the ScrollCraft engine and Landing page bundle
  separately from `/app`; recharts bundles only into the `/admin` chunk).
- Static verification of the build output: `dist/index.html`'s script/link
  tags resolve to files that actually exist in `dist/assets`.
- Manual trace of `calculateEstimate` against the brief's own worked example
  (100 pages, 2 copies, B&W, duplex → 200 printed sides, 100 sheets, ₹300),
  by hand, against the source.

What did **not** happen, because the tooling to do it isn't available here:
a real browser render, a screenshot at any viewport, or a scroll-through of
the pinned act to confirm the callouts land where their `data-sc-cue`
windows say they should. The CSS and the engine's own documented mechanics
support the markup as written, but "supported by the mechanics" is not the
same claim as "seen it scroll correctly." If a screenshot tool becomes
available, that pass — especially the mobile viewport, per the brief's
section 15 — is the next thing to run, not an optional extra.
