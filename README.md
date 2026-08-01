# CalcMatch

A timed calculus matching game. Clear the board by pairing expressions before the clock runs out:

- **DerivaMatch** — match functions with their derivatives (basic, product rule, quotient rule, chain rule).
- **IntegraMatch** — match integrands with their antiderivatives / solution steps (basic, u-substitution, integration by parts).

Blocks are **color-coded by role** (function / derivative / interchangeable, and the middle step in
u-sub & by-parts) to make matching easier, with an on-screen legend.

## Main version — `static/`

The primary, deployed version is a **fully static, client-side app** in [`static/`](static/).
There is **no backend**: levels are generated in the browser, so it loads instantly.

- `static/index.html` — default entry; KaTeX (math rendering) from CDN.
- `static/offline.html` — same game with KaTeX bundled locally; works with no network.

**Run locally** — no build, no server needed:

```bash
open static/index.html        # or: open static/offline.html
```

or serve the folder (`python3 -m http.server 8000` from `static/`, then visit `http://localhost:8000/`).

See [`static/README.md`](static/README.md) for details.

## Deploy (Netlify)

This repo is set up for a git-connected Netlify deploy. The root [`netlify.toml`](netlify.toml)
sets `publish = "static"`, so:

1. In the Netlify dashboard: **Add new site → Import an existing project → GitHub** → pick this repo.
2. Netlify reads `netlify.toml` automatically (publish dir `static`, no build command) → **Deploy**.
3. The site goes live at a `*.netlify.app` URL and auto-deploys on every push to `main`.

Only `static/` is published; `legacy/` is never served.

## Legacy — `legacy/`

The previous **Flask** version (a server that generated levels in Python and was served from
Render) is archived under [`legacy/`](legacy/): `legacy/frontend/`, `legacy/backend/`,
`legacy/requirements.txt`, and the old design docs. It's kept for reference and is not part of
the deployed site. The static version's board generator is a faithful port of the Python
generators in `legacy/backend/` (verified block-for-block).
