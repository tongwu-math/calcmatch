# DerivaMatch - Educational Math Game

## Project Overview
DerivaMatch is a web-based educational math game designed to help users learn and practice calculus derivatives through interactive gameplay. The game features three difficulty modes (Easy, Normal, Hard) with increasing complexity, challenging players to match functions with their derivatives using various gameplay mechanics.

## Architecture
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Python (Flask/FastAPI)
- **Communication**: RESTful API endpoints

## Project Structure
```
DerivaMatch/
├── venv/                      # Python virtual environment
├── backend/                   # Backend logic and server
│   ├── server.py              # Main server file
│   ├── level_generator.py     # Level generation logic
│   └── requirements.txt       # Python dependencies
├── frontend/                  # Frontend WebUI
│   ├── index.html             # Main HTML file
│   ├── style.css              # Stylesheet
│   └── game.js                # Game logic
└── PLAN.md                    # Project plan and checklist
```

## Phase Checklist

### Phase 1: Project Initialization
- [x] Create root directory named DerivaMatch
- [x] Create Python virtual environment (venv)
- [x] Create backend/ and frontend/ subfolders
- [x] Create PLAN.md file

### Phase 2: Backend Setup (Python)
- [x] Activate venv and install dependencies
- [x] Create requirements.txt
- [x] Create server.py with Flask/FastAPI
- [x] Create level_generator.py
- [x] Implement /api/get_level_data endpoint

### Phase 3: Frontend Core (WebUI)
- [x] Create index.html with basic layout
- [x] Create style.css with block styling
- [x] Implement block highlighting for selected items

### Phase 4: Game Mechanics (JavaScript)
- [x] Fetch board data from API and render blocks
- [x] Implement click logic (left/right click)
- [x] Implement Easy Mode validation
- [x] Add success animations and scoring

### Phase 5: Advanced Modes & Evaluation
- [x] Implement Normal Mode chain rule logic
- [x] Create /api/validate_hard_mode endpoint
- [x] Implement numerical evaluation in Python
- [x] Hook up Hard Mode submission in frontend

## Current Status
**Phase 10: Level Restructure & Game Flow Overhaul Completed!**

## Phase 10: Level Restructure & Game Flow Overhaul
- [x] Easy: Basic derivatives, one-to-one matching (unchanged)
- [x] Normal: Product & Quotient rules, one-to-one matching
- [x] Hard: Chain rule with complex inner functions (sin(cos(x)), ln(tan(x)), e^sec(x)...), multi-block factors
- [x] Level selection overlay on game start
- [x] No time bonus for correct matches
- [x] -5 sec penalty for incorrect attempts (easy/normal)
- [x] Pass/fail overlay with Replay and Change Level buttons
- [x] 60 sec time limit for all modes
- [x] Hard mode uses multi-block chain rule mechanics like old normal mode
- [x] UI & Styling Overhaul (CSS) - Dark Mode, subtle shadows, smooth animations
- [x] MathJax Integration (HTML/JS) - LaTeX rendering for math equations
- [x] Selection Logic & Bug Fixes (JavaScript) - Prevent double clicks, side panel exception
- [x] Auto-Resolution and Error Handling (JavaScript) - Remove submit button, auto-evaluate on selection complete
- [x] Backend Board Generation (Python) - 5x6 grid for Easy Mode (15 unique pairs)

## Phase 7: Easy Mode Selection Bug Fix
- [x] Root cause: querySelectorAll by pair_id matched both blocks in a pair, causing instant highlight/disable
- [x] Added unique per-element `data-uid` attribute (incrementing counter) separate from `data-pair-id`
- [x] Easy Mode click handler now uses `event.currentTarget` to target exact clicked DOM element
- [x] Selection stores `{ element, pairId, latex, blockType }` with direct DOM reference
- [x] Match validation compares `pairId` values only — no DOM id lookup
- [x] Success: green flash animation (`match-success` class) + 350ms delay then `element.remove()`
- [x] Mismatch: shake animation (`error` class) + 450ms delay then restore `pointer-events: auto` and clear classes
- [x] Mismatch penalty: -3 seconds deducted
- [x] Guard: ignores clicks when `activeSelection.length >= 2` to prevent spam during animation
- [x] Added `.block.match-success` CSS keyframe animation (scale pop + green glow)

## Phase 8: Normal Mode Overhaul
- [x] Backend: new `normal_pairs` list with 15 chain rule problems, each with `factors` list (multiplicative components of f')
- [x] Backend: generates 25-30 blocks (1 function + N factor blocks per pair, shuffled)
- [x] Frontend: dedicated `handleNormalBlockClick` — first click must be a function, subsequent must be derivatives with matching pairId
- [x] Frontend: invalid clicks silently ignored (no error animation needed, just won't select)
- [x] Frontend: auto-validates when `activeSelection.length === expected_parts`
- [x] Frontend: right-click on last-selected block undoes it (`handleNormalRightClick`)
- [x] Frontend: success → green flash → 350ms → remove all selected elements

## Phase 9: Hard Mode Overhaul
- [x] Backend: generates 5 function blocks from basic derivative pairs + 22 operator/constant blocks
- [x] Backend: operator panel includes numbers, x, x^2, trig functions, ln, e^x, sqrt, operators
- [x] Backend: rewritten `latex_to_python()` with proper \frac{}, \sqrt{}, func^n() handling
- [x] Backend: rewritten `safe_eval()` using sandboxed eval with math function locals
- [x] Backend: numerical evaluation at random x in [1.5, 4.5], tolerance 0.01
- [x] Frontend: player selects function block first, then constructs derivative via operator panel
- [x] Frontend: equation bar shows `(f)' = [constructed expression]` in LaTeX
- [x] Frontend: operator blocks are reusable (no is-selected lock)
- [x] Frontend: submit validates via `/api/validate_hard_mode` endpoint
- [x] Frontend: matched functions hidden with `visibility: hidden` (grid position preserved)
- [x] Operator panel styled with 4-column grid, smaller tiles

**Game Features V2:**
- Dark/sleek light theme with modern design
- Professional LaTeX math rendering via MathJax
- Auto-validation in Easy/Normal modes
- Strict grid layout with 5x6 board for Easy Mode
- No double-clicking, side panel operators reusable
- Error handling with shake animations