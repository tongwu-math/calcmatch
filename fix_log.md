# CalcMatch — Fix Log

> Older entries (Fix #1–#5) predate the CalcMatch rename and the DerivaMatch mode
> restructure; they refer to the legacy `easy/normal/hard` DerivaMatch layout, MathJax,
> and code names that no longer exist. Kept for history. Current work is at the top.

---

## 2026-06-10 — Interchangeability fix, deselect restore, pool extension, custom-mode removal

### E. One-to-one / deselect / cache fixes + pool extension
1. **B0 — identical-text blocks not interchangeable (HIGH, regression of the chain-exploit
   fix):** the role-separated `_merge_ids` also ran for Basic/Product/Quotient, so e.g. the
   two identical `cos(x)` blocks (derivative of pair 7 `sin`, function of pair 8 `-sin`) were
   not interchangeable — matching `sin(x)` with the "wrong" copy gave a −5 s penalty on
   correct math (3000/3000 normal Basic boards). Fix: `_merge_ids(blocks, role_separated)`;
   one-to-one builds pass `False` (cross-role merge by text → identical blocks fully
   interchangeable), chain passes `True` (still needed against the chain exploits).
   `updateEquationBar` now derives the function/derivative direction from the actual id
   intersection instead of click order, so the displayed equation is always mathematically
   correct (e.g. click `cos` then `-sin` → "(cos x)′ = −sin x"; click `cos` then `sin` →
   "(sin x)′ = cos x"). Verified: sympy + 0/24 000 unsolvable, 0 ambiguous-id boards; live
   browser test of both directions; cos+cos correctly rejected with penalty.
2. **B1 — deselect restored:** removed `pointer-events: none` from `.is-selected`
   (left-click re-click = primary deselect; right-click also works). Companion guard:
   deselecting the **anchor** (1st-clicked block) clears the whole selection — otherwise
   u-sub's positional role checks would accept a two-u-block "match" that consumes shared
   `u = …` copies and can soft-lock the board (91% of u-sub boards have duplicate u-texts).
   Removed the now-dead inline `el.style.pointerEvents` writes.
3. **P9 — win/time race:** `checkWin` stops the timer immediately so "Time Up!" can't fire
   during the 300 ms result delay.
4. **B4 — cache busting:** `style.css`/`game.js` referenced with `?v=20260610` (bump on
   deploy); HTML responses get `Cache-Control: no-cache`; js/css keep `max-age=86400`.
5. **B5 — static route allow-list:** only `.html .css .js .ico .png .svg` served; 404
   otherwise.
6. **Custom function-type mode removed** (per user): config overlay keeps only the
   Easy/Normal/Hard presets; `startWithCustom`, the checkbox UI, and `families` handling
   removed from the frontend (backend API param kept). Moots todo B2/B3.
7. **Pool extension** (all sympy-verified): Basic +4 (`x^7`, `e^{-x}`, `x^{3/2}`, `5^x`),
   Product +4 (`x³eˣ`, `x·arcsin`, `eˣ·tan`, `cos·arctan`), Quotient +4 (`tan/x`, `x/(x²+1)`,
   `arctan/x`, `ln/sin`), Chain +4 (`ln(sin x)`, `(x²+1)⁵`, `e^{cos x}`, `√(x²+1)`),
   IntegraMatch Basic +3 (`sec·tan → sec`, `1/(2√x) → √x`, `e^{3x} → e^{3x}/3`).

8. **Render free-tier loading speed**: added `GET /healthz` (204, no work) as a target for an
   external keep-alive pinger — set up UptimeRobot/cron-job.org to hit
   `https://<app>.onrender.com/healthz` every 5–10 min so the free instance never spins down
   (the ~30–60 s cold start dwarfs everything else). In-app: `preconnect` to cdn.jsdelivr.net
   and preload of the two always-used KaTeX fonts (Main-Regular, Math-Italic) so math paints
   without a font stall on first load.
9. **Completed equation stays on the bar** (user report): a successful match no longer wipes
   the equation bar after the 350 ms animation — the full equation (e.g. `(e^{2x})′ = 2e^{2x}`,
   `∫f dx → u=g → ∫…du`) stays visible until the next click re-renders the bar. Mismatches,
   deselect-all, Clear, and new game still clear it. All four success paths changed
   (deriva easy/hard, integra easy/multi). Version bumped to `?v=20260610.3`.
10. **IntegraMatch equation-bar formatting** (user report): Basic mode now wraps the pair as
   `∫ f dx = F` (direction resolved from the id match, works in either click order; an
   ambiguous/antiderivative-only first click shows plain until resolved). u-Substitution now
   joins its steps with `→` instead of `=` (`∫f dx → u = g → ∫…du`); Integration by Parts
   keeps `=` / `−`, which are mathematically correct there. Asset version bumped to
   `?v=20260610.2` — **reminder: every `game.js`/`style.css` edit needs a version bump or
   returning clients run the stale cached copy** (this bit during testing).

**Regression sweep (post-fix):** all 7 modes auto-played to "Level Complete!" in the live
browser (scores correct: basic 900, product/quotient 1800, chain 1200, integra 1000/1200/1200);
replay / clear / time-up / level- and game-switch flows verified; 28 valid API combos return
sane boards, malformed input still 400s, `families` API param still works; 0 console errors.

**Files:** `backend/deriva_generator.py`, `backend/integra_generator.py`,
`backend/server.py`, `frontend/game.js`, `frontend/index.html`, `frontend/style.css`.
**Verified:** sympy on all 19 new pairs; 28 000-board solvability sweep (0 failures);
live browser run of every fixed path (deselect, anchor-clear, both cos directions,
cos+cos rejection, chain match, u-sub match, integra easy match, 404/cache headers);
0 console errors.

---

## 2026-06 — Mode restructure, content rebalance, math verification, chain-exploit fix

### A. DerivaMatch mode restructure + difficulty/family config
- Renamed/expanded DerivaMatch levels to **Basic / Product Rule / Quotient Rule / Chain Rule**
  (internal keys `basic` / `product` / `quotient` / `chain`).
- Split the old combined product+quotient mode into two separate modes, each with level
  rules: Product easy = poly×other, normal = {poly,exp,sin,cos}×other, hard = any of
  {poly,exp,trig,inv_trig,log}; Quotient easy = power denominator, normal = {poly,exp,sin,cos}
  denominator, hard = adds {ln,sec,tan}.
- Added a **config step**: difficulty preset (`easy`/`normal`/`hard`, cumulative) OR custom
  function-type checkboxes (`poly,trig,inv_trig,exp,log`). Applies to DerivaMatch
  Basic/Product/Quotient and IntegraMatch Basic.
- Backend: `generate_level(game, mode, difficulty, families)`; `server.py` validates
  `mode` per game, plus `difficulty` and `families`. Frontend: dynamic level buttons from a
  `MODES` table, new config overlay (`startWithPreset` / `startWithCustom`).
**Files:** `backend/deriva_generator.py`, `backend/integra_generator.py`,
`backend/level_generator.py`, `backend/server.py`, `frontend/index.html`,
`frontend/game.js`, `frontend/style.css`.

### B. Basic-pool rebalance
- Added **balanced sampling** (`_sample_balanced`) so polynomials no longer dominate and
  rarer families (e.g. `log`) reliably appear on Normal boards.
- DerivaMatch Basic Hard preset adds `tan, cot, sec, csc`; added `arccos`, `arccot`.
- Removed `log₂` / `log₁₀` per request; `ln(x)` is the sole log entry.

### C. Math verification (sympy)
- Numerically verified **every** DerivaMatch pair (basic, product, quotient, chain factors)
  and IntegraMatch pair (basic d/dx, u-sub substitution identity, by-parts identity).
  All correct. (Verification scripts run ad hoc against a sympy venv; not committed.)

### D. Chain Rule duplicate-factor exploit — FIXED (regression of commit `0d25f3e`)
- **Bug:** in Chain mode a match was accepted on "all selected blocks share the pair id +
  reached 3 parts" without checking the factors were the pair's distinct factors. Shared
  factors (e.g. `1/(2√x)` across pairs 5 & 10) or a cross-referential text (`cos(ln x)`:
  function of pair 4, factor of pair 11) let a player complete a match with the wrong blocks
  — and the `cos(ln x)` case could soft-lock the board by consuming both copies.
  The original guard (`0d25f3e`) was dropped during cleanup commit `4d9c084`.
- **Fix (two parts):**
  1. `_merge_ids` is now **role-separated**: a function block accumulates only
     `function_id`s, a factor block only `factor_id`s — never both. So `cos(ln x)` →
     `[(function, fid=[4]), (derivative, frid=[11])]`; the function copy has no `factor_id`
     and therefore cannot be reused as a factor. This structurally kills the cross-ref exploit.
  2. `handleDerivaHardClick`: role is decided by click order + ids — 1st click must carry a
     `function_id`; 2nd/3rd must carry the function's id in `factor_id` **and not be identical
     to a factor already chosen** (kills the shared-factor dup like two `1/(2√x)`).
- **Verified:** both exploits blocked; self-reference `(e^{sec x})'` and the cross-ref pairs
  still solvable; 0 unsolvable boards / 500 random chain boards; real board clears fully.
**Files:** `backend/deriva_generator.py`, `frontend/game.js`.

---

## Fix #1 — Remove dead `/api/validate_hard_mode` endpoint + add validations
**Date:** 2026-05-06 10:35
**Issue:** todo.md items #1, #2, #5, #28
- `/api/validate_hard_mode` POST endpoint and helpers `latex_to_python()` and `safe_eval()` (~110 lines) were never called by the frontend
- `correct_derivatives` dictionary used stale pair_ids (100–110) that don't match real hard_pairs (1–12)
- `/<path:filename>` static route served any file, including non-web files
- No validation on `?mode=` parameter — unknown modes returned empty boards

**Files modified:** `backend/server.py`
**Changes:**
1. Removed `/api/validate_hard_mode` route handler (lines 28–86)
2. Removed `latex_to_python()` function (lines 89–170)
3. Removed `safe_eval()` function (lines 173–197)
4. Removed `import math` and `import random` (no longer needed)
5. Added `from flask import abort` import
6. Added `ALLOWED_MODES = {"easy", "normal", "hard"}` — mode parameter now validated with 400 error
7. Added `ALLOWED_EXTENSIONS` set and extension check on static file route (404 on unknown extensions)
8. Added `import os` at top (was duplicate inside `__main__`)

**How to revert:** Checkout the previous commit or restore from backup at `/tmp/derivamatch_backup_<timestamp>/backend/server.py`

## Fix #3 — game.js: Rename handleNormalBlockClick, add validation, remove dead code, fix right-click, hide dead blocks, MathJax fallback
**Date:** 2026-05-06 10:35
**Issue:** todo.md items #12, #13, #15, #17, #18, #20, #21, #22
- `handleNormalBlockClick` name misleading (only hard mode) — renamed to `handleHardBlockClick`
- `validateHardMatch()` always succeeded unconditionally — added defensive guard checking all selections share functionId, with -5s penalty on mismatch
- `submitBtn` element declared but never used (always hidden) — removed variable declaration and `clearEquationForce` display reset
- Right-click undo only worked on last-clicked block — now works on any selected block via `findIndex`
- Right-click undo not available in easy/normal — added contextmenu listener for easy/normal blocks
- Blocks with both empty `function_id` and `factor_id` remained visible after match — now marked `matched` (hidden)
- MathJax failure was silent — added `console.warn` fallback when MathJax not loaded

**Files modified:** `frontend/game.js`
**Changes:**
1. `handleNormalBlockClick` → `handleHardBlockClick` (definition + registration)
2. Added mismatch check in `validateHardMatch()` — all blocks must share `functionId`
3. Removed `const submitBtn = document.getElementById('submit');` declaration
4. Restored `const levelLabel` (was accidentally deleted)
5. Removed `submitBtn.style.display = 'none'` from `clearEquationForce`
6. `handleNormalRightClick` now uses `findIndex` → any block removable, not just last
7. Added right-click listener to easy/normal blocks in `renderBlocks`
8. After ID stripping, mark block `matched` if both function_id and factor_id become empty
9. Added `console.warn` when MathJax not available

**How to revert:** Restore `frontend/game.js` from backup

## Fix #4 — index.html: Remove dead HTML elements, add favicon
**Date:** 2026-05-06 10:35
**Issue:** todo.md items #15, #16, #27
- Submit button with `onclick="submitMatch()"` — function doesn't exist, button always hidden
- `#success-modal` modal div — never shown, `closeModal()` doesn't exist
- No favicon — browser console shows 404

**Files modified:** `frontend/index.html`
**Changes:**
1. Removed `<button id="submit" onclick="submitMatch()" style="display:none;">Submit</button>`
2. Removed `<div id="success-modal" class="modal hidden">...</div>` whole block
3. Added `<link rel="icon" href="data:,">` to suppress favicon 404

**How to revert:** Restore `frontend/index.html` from backup

## Fix #5 — style.css: Remove dead modal/submit CSS, remove duplicate rules, add overflow
**Date:** 2026-05-06 10:35
**Issue:** todo.md items #23, #25
- Duplicate `.operator-panel` / `.block-container` rules at bottom (copy-paste artifact outside @media)
- `#submit` hover CSS dead after button removal
- `.modal` / `.modal-content` CSS dead after modal removal
- `.active-equation` had no explicit `overflow-y`

**Files modified:** `frontend/style.css`
**Changes:**
1. Removed `#submit` and `#submit:hover` rules (~10 lines)
2. Removed `.modal` / `.modal-content` rules (~45 lines)
3. Removed duplicate `.operator-panel` / `.block-container` rules at file bottom (~8 lines)
4. Added `overflow-y: visible` to `.active-equation`

**How to revert:** Restore `frontend/style.css` from backup

## Items intentionally NOT fixed (notes / architectural decisions)

| todo.md # | Item | Reason |
|-----------|------|--------|
| #3 | latex_to_python fragile brace matching | Removed with dead endpoint; only needed if endpoint is restored |
| #4 | safe_eval uses eval | Removed with dead endpoint |
| #8 | Factor list order convention | Needs design decision — all pairs currently consistent (inner→outer chain rule) |
| #9 | Text merging: shared factors at different positions | Currently no shared factor appears at different positions; add assertion if future pairs are added |
| #10 | Easy pair 19 too trivial | User explicitly requested x^p from -4 to 4; `x → 1` is a valid power rule example |
| #11 | Normal pairs 8/10 use (x+1) | These were pre-existing before the base-function overhaul; not broken |
| #14 | Hard mode no mismatch feedback | Silent rejection was intentionally chosen during development to avoid disruption |
| #21 | MathJax debounce | Non-trivial; requires batching/requestAnimationFrame; risk of breaking rendering |
| #24 | Height 80px may clip tall fractions | Needs visual testing with worst-case fraction; adjust later if needed |
| #26 | CDN dependency for MathJax | Bundling MathJax locally adds ~2MB; acceptable for web deployment on Render |
| #28 | No input validation — fixed | ✅ Done in Fix #1 |
| #29 | No automated tests | Requires test framework setup; beyond scope of current cleanup |
| #30 | PLAN.md outdated | Documentation task; not a code bug |
| #31 | backup/ directory | Gitignored; local cleanup only |
| #32 | venv/ gitignored | Confirmed correct — already in .gitignore |


