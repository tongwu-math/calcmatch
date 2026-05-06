# DerivaMatch — Issues, Bugs & Concerns

## Backend — server.py

### 1. Dead code: `/api/validate_hard_mode` endpoint
The POST endpoint and its helper functions `latex_to_python()` and `safe_eval()` (~110 lines) are never called by the frontend. Hard mode
validation is entirely client-side via `validateHardMatch()`.
**Fix**: Remove the endpoint and helpers, or restore it for actual server-side validation.

### 2. Stale `correct_derivatives` dictionary
The endpoint uses `correct_derivatives` keyed by pair_ids 100–110, but the real `hard_pairs` use pair_ids 1–12. Completely mismatched.
**Fix**: Remove or regenerate from `hard_pairs` data if the endpoint is kept.

### 3. `latex_to_python()` fragile brace matching
Manual brace matching for `\frac` and `\sqrt` breaks on edge cases (e.g., nested braces inside the same fraction with unbalanced counts).
Implicit multiplication regex misses cases like `sin(x)cos(x)`.
**Fix**: Use a proper recursive descent parser or a regex-based tokenizer with tested edge cases.

### 4. `safe_eval()` uses `eval` (sandboxed)
`__builtins__` is blocked, so it's safe for now. But any future expansion of the locals or string input could open injection.
**Fix**: Consider `ast.literal_eval` or a math expression evaluator library like `numexpr`.

### 5. Static file route exposes all files
`/<path:filename>` serves any file from `frontend/`, including non-web files if they existed there. Currently harmless since only
`.html`/`.css`/`.js` exist, but fragile.
**Fix**: Restrict to known extensions: `if not filename.endswith(('.html', '.css', '.js')): abort(404)`.

---

## Backend — level_generator.py

### 6. Duplicate `from collections import` statements
Both `generate_level()` hard mode and `_build_one_to_one()` import `Counter` and `defaultdict` separately inside the functions.
**Fix**: Import once at the top of the file or at the top of each function (no duplicate in the same function block).

### 7. Hard mode: `expected_parts` hardcoded to `3` for derivative blocks
Line 166: `"expected_parts": 3` instead of reading from `p["expected_parts"]`. If future pairs have different `expected_parts`, this
breaks.
**Fix**: Read `expected_parts` from `p` or from a lookup.

### 8. factors list order has no consistent convention
Some pairs list outer derivative first (pair 1: `cos(cos(x))` before `-sin(x)`), some list inner first. This matters for education but
also affects any future reordering approach.
**Fix**: Decide on a convention (outer → inner or inner → outer) and apply to all pairs.

### 9. Text merging: shared factors at different positions would conflict silently
Currently shared factors all happen to be at index 1. If a future pair adds a shared factor at index 0 in one pair and index 1 in
another, the merge would pick the first occurrence's position without warning.
**Fix**: Add an assertion or warning when the same text appears at different positions.

### 10. Easy mode pair_id 19: `"function": "x", "derivative": "1"`
The derivative of `x` is `1`. Mathematically correct but arguably too trivial — no real derivative knowledge tested.
**Fix**: Consider removing or replacing with `1/x` (already pair 11), or keep as intentional for power-rule completeness.

### 11. Normal mode pairs 8 and 10 use `(x+1)` as denominator
These are the only pairs that don't follow the `{x, x², e^x, ln, sin, cos}` base function set. They look out of place.
**Fix**: Either document why they're exceptions, or replace with base-function-pair quotients.

---

## Frontend — game.js

### 12. `handleNormalBlockClick` name is misleading
This function name suggests it handles "normal" mode, but `renderBlocks` only registers it for `currentMode === 'hard'`.
**Fix**: Rename to `handleHardBlockClick`.

### 13. `validateHardMatch()` always succeeds
No actual validation happens — it's unconditional. If any bug allows an invalid block combination through the pre-selection filters
(`function_id` check, `factor_id` check, duplicate text check), the match would be accepted incorrectly.
**Fix**: Add an assertion or explicit check that all selected blocks share the same `functionId` and cover required slots.

### 14. Hard mode: no mismatch feedback or penalty
Unlike easy/normal (-5s + red shake on wrong 2-block match), hard mode silently ignores invalid clicks. Users may not understand why a
click does nothing.
**Fix**: Show a brief visual indicator or tooltip when a click is rejected, especially for the duplicate-text case.

### 15. `submitBtn` element is never used
Fetched at `document.getElementById('submit')`, but the Submit button is permanently hidden (`style="display:none"`) and the
`submitMatch()` function doesn't exist. Remnant from an older code version.
**Fix**: Remove the button and its references, or reconnect it.

### 16. `#success-modal` HTML is dead code
Lines 56–62 in `index.html` define a modal for "Match Found!", but no JavaScript references it or calls the imaginary `closeModal()`
function.
**Fix**: Remove the modal HTML and related CSS.

### 17. `clearEquationForce()` resets `submitBtn.style.display` for no reason
The Submit button is always hidden, so resetting its display is dead code.
**Fix**: Remove the `submitBtn.style.display = 'none'` line.

### 18. Right-click undo only undoes the last click
Users cannot undo an earlier selection — only the most recent click can be undone. If a player clicks 3 blocks and wants to undo the
first, they must undo all of them.
**Fix**: Allow right-click on any selected block to remove it, not just the last one.

### 19. After match, remaining blocks may have dead `factor_id` entries
When a pair's ID is stripped from remaining blocks, some may still hold factor_ids pointing to unmatched pairs. At game end, some
derivative blocks may have stale `factor_id` entries (from already-matched pairs) that are harmless but wasteful.
**Fix**: Not urgent — currently harmless, but could be cleaned by a final sweep after all matches.

### 20. After ID stripping, blocks with empty `function_id` AND `factor_id` aren't hidden
If all IDs are stripped from a block (e.g., `cos(ln(x))` was the only block with function_id=[4], then pair 4 is matched and stripped),
the block becomes unmatchable but remains visible and clickable. Clicking it does nothing silently.
**Fix**: Add `block.classList.add('matched')` or hide blocks whose `function_id`+`factor_id` are both empty after stripping.

### 21. MathJax `renderMathJax` called too frequently
Called after every selection, deselection, match, clear, etc. Each call triggers a full `typesetPromise`, which can cause flickering on
18-block boards.
**Fix**: Debounce MathJax rendering or only re-render changed elements.

### 22. MathJax error handling is silent
`.catch(err => console.error(...))` — errors are logged but never surfaced to the user. If MathJax fails to load (network issue), the
game silently shows raw LaTeX.
**Fix**: Add a fallback message or inline LaTeX-to-text converter for when MathJax is unavailable.

---

## Frontend — style.css

### 23. Duplicate CSS rules outside media query
Lines 421–428 at the bottom of `style.css` duplicate the `.operator-panel` and `.block-container` rules from lines 309–321, but are
outside any `@media` block. This is a copy-paste artifact.
**Fix**: Delete the duplicate at lines 421–428.

### 24. Fixed `height: 80px` on `.active-equation` may still clip tall fractions
Expressions like `\frac{\frac{e^x}{x} - e^x \ln(x)}{e^{2x}}` may overflow 80px. The flex `align-items: center` centers content but
doesn't guarantee it fits.
**Fix**: Test with the tallest expected fraction and adjust height if needed, or add `overflow-y: auto`.

### 25. No `overflow` property on `.active-equation`
After removing `overflow: hidden`, the default is `visible`. Combined with a fixed height, content may visually overflow the container
in some browsers.
**Fix**: Add `overflow-y: visible` explicitly to make intent clear.

---

## Frontend — index.html

### 26. CDN dependency for MathJax
`<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js">` requires an internet connection. The game is broken when
offline.
**Fix**: Bundle MathJax locally or add a `<script>` fallback with a local copy.

### 27. No `<link rel="icon">`
Missing favicon causes a 404 error in browser console.
**Fix**: Add a favicon or a blank `<link rel="icon" href="data:,">` to suppress the error.

---

## Cross-cutting

### 28. No input validation on `/api/get_level_data?mode=`
Any string is accepted. Unknown modes return `{"blocks": [], "operators": []}` which renders an empty board or breaks the frontend.
**Fix**: Validate mode against `["easy", "normal", "hard"]` and return a 400 error for unknown values.

### 29. No automated tests
Zero test coverage. All correctness relies on manual testing. Derivative math errors in the pools would go undetected.
**Fix**: Add unit tests for `generate_level()` producing correct block counts and unique-function_id distribution, and derivative math
verification.

### 30. `PLAN.md` is outdated
Still mentions Phase 10 as "Completed" and references old features (Submit button, can_be_function). Doesn't reflect the
`function_id`/`factor_id` system, 18-block layout, or operator panel state.
**Fix**: Update or remove PLAN.md.

### 31. `backup/` directory tracked by `.gitignore` but still exists locally
Three backup subdirectories exist (`ver_easy_normal_done/`, `ver_level_restructure/`, `ver_shared_blocks/`). They're ignored by git but
clutter the local workspace.
**Fix**: Delete or archive offline.

### 32. `venv/` correctly gitignored but present in workspace
Not a bug — the `.gitignore` correctly excludes it. Just confirming it won't be committed.
