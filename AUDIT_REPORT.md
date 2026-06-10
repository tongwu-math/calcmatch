# CalcMatch — Full Audit Report

_Date: 2026-06-09_

Scope: complete audit of DerivaMatch (Basic, Product, Quotient, Chain) and
IntegraMatch (Basic, u-Substitution, Integration by Parts) — backend generators,
Flask API, and frontend game logic/UI.

## Method

- **Math verification:** every (function → derivative/antiderivative) pair was
  reconstructed directly from generator output and checked numerically with
  `sympy`/`mpmath` (LaTeX → expression → compare against numerical
  differentiation at multiple points). Chain factors checked as a product;
  u-sub checked via the substitution identity `f = integrand(u=g)·g'`; IBP
  checked via `(uv)' = uv' + u'v`.
- **Structural tests:** 300–2000 generations per mode/difficulty/family combo —
  board solvability (greedy id-match to empty), empty boards, duplicate texts,
  board sizes.
- **API tests:** valid + malformed query params.
- **Live UI tests:** every mode driven in the browser (selection, matching,
  scoring, win), KaTeX render-error scan, console error scan.

## ✅ What passed (no issues found)

| Area | Result |
|------|--------|
| **Math correctness** | **100% correct** — all Basic (28), Product (22), Quotient (27), Chain (12), Integra Basic (18), u-Sub (12), IBP (10) pairs verified numerically |
| Board solvability | Every board in all modes fully solvable; never empty; no duplicate-derivative-text boards |
| Board sizes | Basic/Product 18, Quotient/easy 16, Integra Basic 20, multi-block 18 — all render fine |
| API validation | Per-game mode whitelist, difficulty + families validated; malformed input → 400 |
| Rendering | 0 KaTeX errors across Basic/Product/Quotient/Chain hard boards |
| Runtime | No console errors/warnings; all 7 modes playable end-to-end |
| Balanced sampling | Basic boards spread across families; `ln(x)` surfaces reliably; polynomials no longer dominate |

## 🐞 Issues found

### B1 — Right-click / re-click "undo" is broken _(Medium)_
**Where:** `frontend/style.css` `.block.is-selected { pointer-events: none; }`
**Problem:** Selecting a block disables all pointer events on it, so neither the
left-click-to-deselect branch (`handleDerivaEasyClick` → `handleRightClick`) nor
the `contextmenu` listener can ever fire. The undo feature is entirely dead; the
only way to clear a partial selection is the **Clear** button. Most painful in
multi-block modes (Chain, u-Sub, IBP) where a single mis-click forces a full Clear.
**Repro:** Select one block, try to click/right-click it again → nothing happens.
**Suggested fix:** Remove `pointer-events: none;` from `.is-selected` (keep
`opacity: 0.7` for feedback). The JS already guards re-entry via the
`activeSelection.length >= 2` and `isProcessing` checks, and the
`if (el.classList.contains('is-selected')) { handleRightClick(el); return; }`
branch then works as intended.

### B2 — Custom family filter silently falls back to the full board _(Medium)_
**Where:** `backend/deriva_generator.py` `_filter_pairs` (subset rule) + the
`if not pool: pool = source` fallback.
**Problem:** Product/Quotient pairs each use ≥2 families, and the filter keeps a
pair only if **all** its families are selected. So narrow custom selections match
nothing and silently fall back to the **entire unfiltered pool**:
`product` with only `inv_trig`/`exp`/`log`, or `quotient` with only
`trig`/`inv_trig`/`exp`/`log`, all return a full 18-block board that ignores the
user's choice.
**Suggested fix (pick one):**
- (a) Don't fall back: return the (possibly empty) filtered pool and have the
  frontend show "No problems match those function types — pick more" instead of a
  blank/misleading board.
- (b) Restrict the family checkboxes shown per mode to those that can produce
  results (e.g. hide `inv_trig` for Product/Quotient).
- (c) Disable **Start with selected types** until the selection is known to yield
  a non-trivial pool (requires a tiny "count" endpoint or client-side table).

### B3 — Chain validator accepts duplicate factors (leniency) _(Low–Medium, pre-existing)_
**Where:** `frontend/game.js` `validateDerivaHard` / `handleDerivaHardClick`.
**Problem:** A match is accepted when the selected blocks merely (1) share the
function's `pair_id` and (2) reach `expected_parts`. It does **not** check that
the selected factors are the pair's actual factor set. When a factor text is
shared across pairs (e.g. `1/x` in several chain pairs), a board can show the
same factor on multiple blocks, and a player can match using a duplicate instead
of the true second factor. Reachable on ~86% of chain boards. It self-resolves
(the real second factor auto-clears, board stays solvable), so it isn't
board-breaking, but it lets players "match" without identifying the real factors.
**Suggested fix:** In `handleDerivaHardClick`, reject a clicked factor whose
`latex` equals an already-selected factor's `latex` (dedupe selected factor texts).
Cheap and kills the exploit without server changes.

### B4 — Narrow custom selections produce 1-pair (instant-win) boards _(Low, UX)_
**Where:** generators + custom families.
**Problem:** e.g. Basic `[log]` → 1 pair / 2 blocks; Product `[trig]` → 1 pair;
several 2-family combos → 2-block boards. The level is won in a single match.
**Suggested fix:** Enforce a minimum pair count (pad from related families or the
next difficulty tier), or surface the same "pick more types" guidance as B2.

### B5 — "Start with selected types" with nothing checked does nothing _(Low, UX)_
**Where:** `frontend/game.js` `startWithCustom` (`if (fams.length === 0) return;`).
**Suggested fix:** Disable the button while no checkbox is selected, or flash a
hint ("Select at least one type").

### B6 — u-Substitution requires a strict, unguided click order _(Low, UX)_
**Where:** `frontend/game.js` `handleIntegraMultiClick` (normal branch).
**Problem:** Blocks must be clicked function → `u = …` → `∫…du`. Out-of-order
clicks are silently ignored (no animation/feedback), which reads as an
unresponsive UI.
**Suggested fix:** Allow any selection order (validate by `pair_id` like IBP
does), or add a subtle hint/shake when a click is rejected.

### B7 — Static assets cached 24h with no versioning _(Low, deploy)_
**Where:** `backend/server.py` `Cache-Control: public, max-age=86400` on `.js`/`.css`.
**Problem:** After a deploy, returning users keep the old `game.js`/`style.css`
for up to a day (this bit during testing — a hard cache-bust was needed to load
new code).
**Suggested fix:** Append a content hash/version query to the `<script>`/`<link>`
URLs (cache-bust on change), or lower `max-age` and rely on `ETag`/revalidation.

### B8 — Matched blocks leave gaps _(Info / by design)_
`.block.matched { visibility: hidden }` preserves grid position (intentional), so
the board grows sparse as pairs clear. Optional polish: remove + reflow, or fade.

### B9 — `arccot` renders upright _(Cosmetic)_
`\text{arccot}(x)` shows as an upright "arccot". If you want the operator style,
use `\operatorname{arccot}` (KaTeX has no built-in `\arccot`).

## Recommended fix order

1. **B1** (one-line CSS) — restores undo across all modes.
2. **B3** (small JS dedupe) — closes the chain leniency.
3. **B2 / B4 / B5** — custom-family UX (decide on the desired semantics first).
4. **B6, B7, B9** — polish / deploy hygiene.

## Notes
- A throwaway `venv/` (with `sympy` for verification) and `.claude/launch.json`
  were added locally to run/test the app. `sympy` is **not** a runtime dependency
  and is intentionally absent from `requirements.txt`.
