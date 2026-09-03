# Fingerprints

Every site you build with **scrollcraft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| folio | filmic one-shot | fixed minimal top bar with brand + nav + accent CTA | kinetic lines h1 (assembles line by line as scroll enters pin) | 8 acts, ~12vh, six pin + one pan + one flow | magnetic CTA in flow, scroll-trace rail beneath | living print-cost counter reading --sc-p, real math from typed inputs | dark blueprint / warm paper | 4500 |

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- filmic one-shot grammar (grammar: 1 of 8, the only one that satisfies "one continuous journey")
- fixed minimal top-bar nav with brand mark + nav links + accent CTA button (nav: same treatment across all routes via AppShell)
- kinetic lines hero h1 (brand type assembles, ScrollCraft built-in)
- 8 acts at ~12vh total with six pin, one pan, one flow — 6-pin shape is a fingerprint to avoid
- magnetic CTA + scroll-trace rail as close pattern (both Flow acts use this pair)
- living print-cost counter as signature move (bespoke rAF loop reading --sc-p, typed inputs, real math)

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scrollcraft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
