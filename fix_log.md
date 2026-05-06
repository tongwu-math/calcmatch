# DerivaMatch — Fix Log

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


