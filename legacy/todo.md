# CalcMatch — Issues, Bugs & Concerns

Status of a full audit (2026-06). **All derivative/antiderivative content is numerically
verified correct** (DerivaMatch basic/product/quotient/chain; IntegraMatch basic/u-sub/by-parts).
Board generation is solvable (0 unsolvable / 500 random boards per mode). The items below are
the remaining open issues, ordered roughly by severity.

> **Re-verified 2026-06-10**, then fixed the same day: B0 (new — cross-role identical-text
> blocks), B1 (+ anchor-deselect companion fix), B4, B5, P9; custom function-type mode
> removed (moots B2/B3). Remaining open items are the polish entries below.

---

## Recently fixed (2026-06-10 — see fix_log.md "E.")
- ✅ **B0. Identical-text blocks not interchangeable in one-to-one modes** *(was HIGH)* —
  the role-separated merge (chain-exploit fix) also ran for Basic/Product/Quotient, so the
  two visually identical `cos(x)` blocks (derivative of `sin`, function for `-sin`) were not
  interchangeable: the "wrong" copy gave a −5 s penalty on a mathematically correct match
  (3000/3000 normal Basic boards affected; also `1/x` ↔ `ln(x)`). Fixed:
  `_merge_ids(blocks, role_separated)` — `False` for one-to-one (cross-role merge by text),
  `True` for chain. Equation bar now derives the function/derivative direction from the
  actual id match, not click order. Verified: 0/24 000 boards unsolvable, 0 ambiguous
  identical-text blocks, both `cos(x)` directions match in the browser, cos+cos correctly
  rejected.
- ✅ **B1. Deselect non-functional** — removed `pointer-events: none` from `.is-selected`;
  left-click re-click (primary) and right-click both deselect now. Companion fix: deselecting
  the **anchor** (1st click) clears the entire selection — without this, u-sub's positional
  role checks allowed a two-u-block "match" that consumed shared blocks and could soft-lock
  the board (91% of u-sub boards have duplicate u-texts). Verified in browser for basic,
  chain, and u-sub.
- ✅ **B4. Asset cache** — `?v=20260610` version query on `style.css`/`game.js` (bump on
  deploy), HTML served with `Cache-Control: no-cache`, js/css keep `max-age=86400`.
- ✅ **B5. Static route** — extension allow-list (`.html .css .js .ico .png .svg`), 404
  otherwise. Verified: `/server.py` → 404.
- ✅ **P9 (win/time race)** — timer stops immediately when the last block clears.
- ✅ **Custom function-type mode removed** (user decision, 2026-06-10) — checkboxes /
  "Start with selected types" UI deleted from the config overlay; presets remain. This moots
  the former B2 (silent full-pool fallback), B3 (1-pair boards), and the zero-boxes no-op.
  The backend `families` API param still exists and is validated; re-add UI later if wanted.
  Pools were extended instead: +4 basic, +4 product, +4 quotient, +4 chain, +3 integra-basic
  pairs, all sympy-verified.
- ✅ **Chain Rule duplicate-factor exploit** — role-separated merge + factor dedup. See
  fix_log.md ("D. Chain Rule duplicate-factor exploit"). Was a regression from commit `4d9c084`.

---

## Polish / lower priority

### P1. KaTeX is re-typeset over the whole document on every interaction
`renderMathJax()` calls `renderMathInElement(document.body, …)` after every select / deselect /
match / clear. On an 18-block board this re-scans the entire DOM and can flicker.
**Fix:** scope rendering to the changed elements (the equation bar / a single block).

### P2. KaTeX is a CDN dependency — game is unstyled-math when offline
`index.html` loads KaTeX from jsDelivr; with no network the board shows raw LaTeX.
**Fix:** bundle KaTeX locally, or add a graceful "math failed to render" fallback.

### P3. `arccot` renders upright via `\text{arccot}`
KaTeX has no `\arccot` macro, so `\text{arccot}(x)` is used (upright, not the slanted operator
style of `\arcsin` etc.).
**Fix:** define a macro (`\providecommand{\arccot}{\operatorname{arccot}}`) in the KaTeX config.

### P4. Matched blocks use `visibility: hidden` → grid gaps
Cleared blocks keep their grid cell (intentional, to preserve layout), so the board becomes
sparse with holes as it's solved.
**Fix (optional):** reflow/remove matched blocks, or accept as-is.

### P5. Chain / u-sub / by-parts give no feedback on rejected clicks
Invalid clicks in multi-block modes are silently ignored (no shake/penalty, unlike the −5 s in
one-to-one modes). Players may not understand why a click "did nothing."
**Fix:** brief visual cue on rejected clicks.

### P6. Mode-key inconsistency between games
DerivaMatch uses `basic/product/quotient/chain`; IntegraMatch still uses `easy/normal/hard`.
Works (validated per game) but is inconsistent.
**Fix (optional):** unify naming, or document the split.

### P7. u-Substitution enforces a strict, unguided click order
Blocks must be clicked ∫f dx → `u = …` → `∫…du`; out-of-order clicks are silently ignored
(IBP, by contrast, accepts any order). Combined with P5 this reads as an unresponsive UI.
**Fix:** validate by role-presence per pair (like IBP) instead of click position, or at
minimum add the P5 rejected-click cue. Note: making u-sub order-agnostic also removes the
positional-role assumption exploited in the B1 amendment.

### P8. `fetch` does not check `response.ok`
A 400/500 response is parsed as JSON and only fails later inside `renderBlocks`
(caught by `.catch`, generic "Failed to load level" message). Works, but masks the server's
actual error message.
**Fix:** check `response.ok` first and surface `data.error` when present.

### P10. Dead CSS
`.operator-panel` rules in the `@media` block reference an element that no longer exists.
(The leftover inline `pointerEvents` writes in `game.js` were removed with the B1 fix.)
**Fix:** delete the dead rule.

### P11. `families=","` (only commas) passes validation as "no filter"
`server.py` splits and drops empty entries, leaving an empty list that the generators treat
as no filter. Harmless, but inconsistent with rejecting other malformed input.
**Fix (optional):** return 400 when `families` is present but parses to an empty list.

---

## Scope / process notes (not bugs)

- **N1.** IntegraMatch did **not** receive the difficulty/family rework — only its Basic mode
  has the config step; u-Substitution and Integration by Parts have a single fixed pool each.
  Intentional for now; mirror the DerivaMatch structure later if desired.
- **N2.** No committed automated tests. The math was verified with ad-hoc sympy scripts; a
  committed test suite (block counts, id/role consistency, derivative/antiderivative checks,
  solvability) would prevent regressions like the chain exploit.
- **N3.** `backup/` exists locally (gitignored); `venv/` correctly gitignored.
