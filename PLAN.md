# CalcMatch — Educational Calculus Matching Game

## Overview
CalcMatch is a web-based calculus practice game. Players clear a board by matching
expressions: functions with their derivatives (**DerivaMatch**) or integrands with their
antiderivatives / solution steps (**IntegraMatch**). Each level is a 60-second timed board.

## Architecture
- **Frontend**: HTML + CSS + vanilla JavaScript, math rendered with **KaTeX** (auto-render).
- **Backend**: Python **Flask** (`flask_compress` for gzip/brotli), stateless level generation.
- **Communication**: single REST endpoint, `GET /api/get_level_data`.

```
calcmatch/
├── backend/
│   ├── server.py             # Flask app + /api/get_level_data + static file serving
│   ├── level_generator.py    # dispatcher → deriva / integra generators
│   ├── deriva_generator.py   # DerivaMatch boards (basic / product / quotient / chain)
│   └── integra_generator.py  # IntegraMatch boards (basic / u-sub / by-parts)
├── frontend/
│   ├── index.html            # overlays (game → level → config) + game board
│   ├── style.css             # dark theme, block grid, overlays
│   └── game.js               # state machine, click handlers, KaTeX rendering
├── requirements.txt
├── PLAN.md / todo.md / fix_log.md
└── venv/  backup/            # gitignored
```

## Games & Modes

### DerivaMatch (`game=deriva`)
| Mode key | Display | Board | Config step |
|----------|---------|-------|-------------|
| `basic`    | Basic            | one-to-one: f ↔ f′ (2 blocks/match) | yes |
| `product`  | Product Rule     | one-to-one: (f·g) ↔ (f·g)′           | yes |
| `quotient` | Quotient Rule    | one-to-one: (f/g) ↔ (f/g)′           | yes |
| `chain`    | Chain Rule       | multi-block: f(g(x)) + 2 factor blocks | no |

### IntegraMatch (`game=integra`)
| Mode key | Display | Board | Config step |
|----------|---------|-------|-------------|
| `easy`   | Basic              | one-to-one: ∫f ↔ F | yes |
| `normal` | u-Substitution     | 3-block: ∫f dx + (u=g) + ∫…du | no |
| `hard`   | Integration by Parts | 3-block: ∫uv′ dx + uv + ∫u′v dx | no |

### Config step (difficulty preset)
For config-enabled modes, after picking a level the player chooses a **difficulty preset** —
`easy` / `normal` / `hard` (cumulative: easy ⊆ normal ⊆ hard); `easy` favors integer
coefficients / fewer fractions, `hard` adds the harder families (e.g. `tan, cot, sec, csc`
in DerivaMatch Basic).

`difficulty` is passed to the API; if omitted the full pool is used. The API also accepts a
`families` filter (`poly,trig,inv_trig,exp,log`), but the custom-type UI was removed
2026-06-10 — presets only for now. DerivaMatch Basic uses **balanced sampling** across
families so no single family (e.g. polynomials) dominates a board, and rarer families like
`log` reliably appear.

## Matching model (`function_id` / `factor_id`)
Every block carries id lists describing the pairs it belongs to and its role:
- **One-to-one modes**: a function block has `function_id=[pair]`; its derivative block has
  `factor_id=[pair]`. A match links a `function_id` to a `factor_id` sharing a pair.
  Merge is **cross-role by text**: every block with text T carries all function_ids *and*
  all factor_ids of T, so identical-looking blocks are fully interchangeable (e.g. either
  `cos(x)` copy matches `sin(x)` *or* `-sin(x)`); two copies of the same text can never
  match each other. The equation bar derives the displayed direction from the matched ids.
- **Chain mode**: 1st click = a block with a `function_id` (the function, sets the pair id);
  2nd/3rd clicks = blocks whose `factor_id` contains that pair id and are **not identical**
  to a factor already chosen. Merge here is **role-separated** (a function block keeps only
  `function_id`s, a factor block only `factor_id`s) so cross-referential texts like
  `cos(ln x)` can't be exploited.
- **Deselect**: re-click (or right-click) a selected block. Deselecting the 1st-clicked
  block clears the whole selection (the later picks' roles depend on it).
- IntegraMatch u-sub uses `preusub_id`/`usub_id`/`postusub_id`; by-parts uses
  `uvp_id`/`uv_id`/`vup_id`.

## API
`GET /api/get_level_data`
- `game` — `deriva` | `integra`
- `mode` — deriva: `basic|product|quotient|chain`; integra: `easy|normal|hard`
- `difficulty` *(optional)* — `easy|normal|hard`
- `families` *(optional)* — comma list of `poly,trig,inv_trig,exp,log`
- Returns `{ "blocks": [...], "operators": [] }`. Invalid params → `400`.

## Scoring & flow
- One-to-one match: +100 (Basic) / +200 (others). Multi-block match: +200.
- Wrong 2-block match (one-to-one): −5 s + shake. Chain/multi: invalid clicks are ignored.
- Clearing every block → "Level Complete"; timer to 0 → "Time Up". 60 s per board.

## Status
All derivative/antiderivative content is numerically verified correct (see fix_log.md).
Known remaining issues are tracked in todo.md.
