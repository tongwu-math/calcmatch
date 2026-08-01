# CalcMatch — static build

A fully client-side build of CalcMatch. **No backend, no server, no cold start** —
levels are generated in the browser, so the page loads instantly (the live Flask
version's 30–60 s wait was a Render free-tier cold start, not real work).

Everything here is self-contained; the original Flask version is archived under
`../legacy/` (`../legacy/frontend`, `../legacy/backend`) as the reference source.

## Two entry points (identical game, different math-font source)

| File | KaTeX (math renderer) | Needs network? |
|------|-----------------------|----------------|
| `index.html`   | loaded from the jsDelivr **CDN** | only for the KaTeX CDN on first load |
| `offline.html` | **bundled** locally in `vendor/katex/` | no — works fully offline |

Both share `generator.js`, `game.js`, and `style.css`; they differ only in the
`<head>` KaTeX includes.

## Run locally

Just open a file in a browser — no build step, no server required:

```bash
open index.html      # or: open offline.html
```

Or serve the folder (any static server works):

```bash
python3 -m http.server 8000
```

then visit http://localhost:8000/ (or `/offline.html`).

## Deploy (static hosting)

The site is deployed on **Netlify** via the repo's root `netlify.toml` (`publish = "static"`),
so connecting the repo needs no manual build settings — see the root
[README](../README.md#deploy-netlify). No build command; only this folder is published.

Other static hosts work too (point the publish/output directory at this `static/` folder):
- **Vercel** — Import the repo → **Root Directory** = `static`, Framework Preset **Other**, no
  build command. `vercel.json` sets caching + clean URLs.
- **Cloudflare Pages** — Framework preset **None**, empty build command, **Build output
  directory** `static`.

`index.html` is served at `/`; `offline.html` at `/offline.html` (or `/offline` on Vercel).

## Files

```
index.html      CDN-KaTeX entry (default)
offline.html    bundled-KaTeX entry (offline-capable)
generator.js    client-side level generator — see "Provenance" below
game.js         game logic (copy of ../frontend/game.js; the one backend fetch()
                is replaced by a direct generateLevel() call)
style.css       verbatim copy of ../frontend/style.css
vendor/katex/   KaTeX 0.16.11 (MIT) — css, js, contrib/auto-render, woff2 fonts
vercel.json     Vercel config (Netlify config is the repo-root netlify.toml)
```

## Provenance of `generator.js`

`generator.js` is a faithful JavaScript port of the Python level generators
(`../legacy/backend/level_generator.py`, `deriva_generator.py`, `integra_generator.py`). The
problem/answer LaTeX tables (`CALCMATCH_DATA`) were extracted **verbatim** from the
Python source, and the assembly logic (filtering, sampling, board building, id merging)
mirrors the Python line-for-line. It was verified against the untouched Python backend
across all 7 game modes × difficulty presets: block vocabulary, matching relations, and
board sizes are identical.
