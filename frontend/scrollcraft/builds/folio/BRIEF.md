# Folio — landing page rebuild

## Interview answers (recorded before any planning)

1. **Vibe, three to five words + references:**
   "Bold, kinetic, punchy." Vibe: every motion earns its screen, type hits the
   way a launch trailer does, but the underlying brand stays editorial-paper,
   not maximalist. References implied: Apple/Stripe/Linear product launch
   energy.

2. **Scroll journey, in their words:** "Main storytelling section at the top
   which tells about our site and what it does. Another problem section before
   features. Then features one by one in storytelling mode along with a
   diagram." Sequence: hook → problem → turn → features (one each) → diagram
   → commitment.

3. **Energy curve:** Calm in, sharp in the middle (problem), kinetic through
   features, biggest hit at the counter, resolve at the close. Not loud the
   whole way.

4. **Stage-by-stage feeling + the one peak moment:**
   - Opening: recognition / orientation (type, quiet)
   - Problem: tension (specific, named)
   - Turn: relief / delight (wipe)
   - Features: confidence (each one lands whole)
   - Diagram: clarity (the whole flow, one frame)
   - Counter: awe (the print-cost coming alive, real numbers)
   - Close: resolve (one CTA, one place to go)

5. **Signature move seed (the one thing no site they have seen does):**
   The print-cost counter comes alive mid-scroll: a real calculator
   computing its own total from typed page count, color mode, and copy
   count — the visitor sees ₹amount count up in lockstep with the page
   arriving, and the total they see is the total the app would return.
   Not a stock figure. Not a screenshot. A real surface computing a real
   number, embedded in the scroll, peak act.

6. **How far from premium-minimal:** Stay premium-minimal, just richer.
   Keep Folio's warm paper canvas + red accent. Add density, motion, and
   longer acts, but do not re-skin the brand.

7. **One unbroken world, or distinct scenes:** One continuous journey.

8. **Assets:** None. Code/typography-driven. No stock photos, no generated
   imagery. The build will lean on real text, real math, and motion.

## Grammar

**Filmic one-shot.** One continuous journey, one emotional arc, one
peak. The other seven grammars lose on:
- *Chaptered editorial:* would hard-cut between features and kill the
  story arc the visitor asked for.
- *Live surface:* would require the whole page to *be* a tool, not
  describe one.
- *Continuous world / worldflight:* no real geography to fly through.
- *Typographic poster:* too sparse for a features section with
  explanation.
- *Gallery:* the visitor's question is "should I believe you," not
  "what are the options."
- *Split stage:* Folio has no genuine two-sided argument to balance.
- *Rhythmic cutlist:* cuts the energy budget exactly where the user
  asked for storytelling.

## Signature move

**The living print-cost counter.** A working calculator embedded in the
peak act. Three input fields (page count, copies, color mode). A large
₹amount that counts up to its true total as the act progresses,
computed in real time from the same `calculateEstimate()` function the
real app uses. The numbers are real — there is no fabricated figure.
This is the one moment a visitor describes to a friend, and it is the
honesty rule satisfied: every figure on the page is computed, not
painted.

## Tell-someone sentence

> "It's the site where the print cost counts up as you scroll past it."

## Feeling curve (one line per act)

```
1  Recognition    a slow header settles, type meets paper, the brand is back
2  Tension        a problem is named, plainly, three lines, no marketing
3  Turn           a wipe, the frame becomes Folio's surface, the noise drops
4  Features       five mini-acts, each one a different device, one idea each
5  Diagram        the whole flow, one frame, the visitor sees how it fits
6  Peak           the print-cost counter, real numbers, real motion
7  Commitment     one CTA, one place, the page resolves
```

Total: 7 acts, ~12.5 viewport-heights. Just inside the 8 to 14vh budget.

## Beat → device score (variety required: ≥4 families, no repeats)

| Act | Beat | Device | Why |
|---|---|---|---|
| 1 | Recognition | `pin` + kinetic (lines) | type assembles, sets the brand voice |
| 2 | Problem | `pin` + cue stack | lines cross-fade, the problem names itself |
| 3 | Turn | `reveal` (iris) | a wipe = a change of state, exactly the beat |
| 4a | Files | `flow` + parallax | ordinary section, two layers of motion |
| 4b | Intelligence | `pin` + count | real numbers, real doc analysis |
| 4c | Estimation | `pin` + parallax + drift | the math has its own kind of weight |
| 4d | Sharing | `pan` | sideways travel = a range of permissions |
| 4e | Community | `pin` + kinetic (words) | the story is in the words, not the cards |
| 5 | Diagram | `pin` + bespoke SVG | the flow draws itself, lines connect |
| 6 | **Peak** | `pin` + signature counter | the real calculator, real numbers, longest span |
| 7 | Commitment | `flow` + magnet CTA | the page stops, the CTA pulls |

Device families used: `pin` (×6), `flow` (×2), `reveal` (×1), `pan` (×1),
`kinetic` (×2), `count` (×1), `parallax` (×2), `reveal` (×1),
plus a bespoke SVG signature move. Six families — clears the four-family
floor. Repeats are spaced by other families, never back-to-back. The
single `pan` (Sharing) sits between two `pin` acts, so the variety
contract holds.

## Authored silence

Act 3 (Turn) holds the iris at full opacity for ~0.4vh of its span
before the next act begins. This is the "empty viewport before the
drop" the feel guide calls for. Verification must distinguish
intentional quiet from dead scroll by cue position, not by opacity
alone.

## Fingerprint gate (against the empty registry)

This is the first build. Gate clears vacuously. After shipping, the
row will record: grammar=filmic, nav=fixed minimal, hero=kinetic
header, act-sequence=7 acts 12.5vh, close=magnetic CTA in flow, sig
move=living counter.
