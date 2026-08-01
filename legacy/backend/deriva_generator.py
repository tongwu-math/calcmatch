import random
from collections import Counter, defaultdict

_LEVEL_ORDER = {"easy": 1, "normal": 2, "hard": 3}


def generate_level(mode, difficulty=None, families=None):
    """Generate level data for a DerivaMatch mode.

    mode       -- 'basic', 'product', 'quotient', or 'chain'
    difficulty -- optional 'easy'/'normal'/'hard' preset (cumulative:
                  easy ⊆ normal ⊆ hard)
    families   -- optional list of function families to include
                  ('poly', 'trig', 'inv_trig', 'exp', 'log'); overrides difficulty
    """

    # --------------------------------------------------------------
    # BASIC: single-function derivatives, one-to-one matching.
    # Each pair tagged with a `family` and a `level`:
    #   easy   -> integer coefficients, no fractions
    #   normal -> fractions / logs / negative & fractional powers / a^x / inverse trig
    #   hard   -> the reciprocal/quotient trig functions (tan, cot, sec, csc)
    # --------------------------------------------------------------
    basic_pairs = [
        # poly (easy)
        {"pair_id": 1, "function": "x", "derivative": "1", "family": "poly", "level": "easy"},
        {"pair_id": 2, "function": "x^2", "derivative": "2x", "family": "poly", "level": "easy"},
        {"pair_id": 3, "function": "x^3", "derivative": "3x^2", "family": "poly", "level": "easy"},
        {"pair_id": 4, "function": "x^4", "derivative": "4x^3", "family": "poly", "level": "easy"},
        {"pair_id": 5, "function": "x^5", "derivative": "5x^4", "family": "poly", "level": "easy"},
        {"pair_id": 6, "function": "x^6", "derivative": "6x^5", "family": "poly", "level": "easy"},
        # trig (easy)
        {"pair_id": 7, "function": "\\sin(x)", "derivative": "\\cos(x)", "family": "trig", "level": "easy"},
        {"pair_id": 8, "function": "\\cos(x)", "derivative": "-\\sin(x)", "family": "trig", "level": "easy"},
        # exp (easy)
        {"pair_id": 9, "function": "e^x", "derivative": "e^x", "family": "exp", "level": "easy"},
        {"pair_id": 10, "function": "e^{2x}", "derivative": "2e^{2x}", "family": "exp", "level": "easy"},
        {"pair_id": 11, "function": "e^{3x}", "derivative": "3e^{3x}", "family": "exp", "level": "easy"},
        # poly (normal)
        {"pair_id": 12, "function": "\\sqrt{x}", "derivative": "\\frac{1}{2\\sqrt{x}}", "family": "poly", "level": "normal"},
        {"pair_id": 13, "function": "\\frac{1}{x}", "derivative": "-\\frac{1}{x^2}", "family": "poly", "level": "normal"},
        {"pair_id": 14, "function": "x^{-2}", "derivative": "-2x^{-3}", "family": "poly", "level": "normal"},
        {"pair_id": 15, "function": "x^{-3}", "derivative": "-3x^{-4}", "family": "poly", "level": "normal"},
        {"pair_id": 16, "function": "x^{\\frac{1}{3}}", "derivative": "\\frac{1}{3}x^{-\\frac{2}{3}}", "family": "poly", "level": "normal"},
        {"pair_id": 17, "function": "x^{-\\frac{1}{2}}", "derivative": "-\\frac{1}{2}x^{-\\frac{3}{2}}", "family": "poly", "level": "normal"},
        # exp (normal)
        {"pair_id": 18, "function": "2^x", "derivative": "2^x \\ln 2", "family": "exp", "level": "normal"},
        {"pair_id": 19, "function": "3^x", "derivative": "3^x \\ln 3", "family": "exp", "level": "normal"},
        # log (normal)
        {"pair_id": 20, "function": "\\ln(x)", "derivative": "\\frac{1}{x}", "family": "log", "level": "normal"},
        # inverse trig (normal)
        {"pair_id": 23, "function": "\\arcsin(x)", "derivative": "\\frac{1}{\\sqrt{1 - x^2}}", "family": "inv_trig", "level": "normal"},
        {"pair_id": 24, "function": "\\arccos(x)", "derivative": "-\\frac{1}{\\sqrt{1 - x^2}}", "family": "inv_trig", "level": "normal"},
        {"pair_id": 25, "function": "\\arctan(x)", "derivative": "\\frac{1}{1 + x^2}", "family": "inv_trig", "level": "normal"},
        {"pair_id": 26, "function": "\\text{arccot}(x)", "derivative": "-\\frac{1}{1 + x^2}", "family": "inv_trig", "level": "normal"},
        # trig (hard: reciprocal / quotient trig)
        {"pair_id": 27, "function": "\\tan(x)", "derivative": "\\sec^2(x)", "family": "trig", "level": "hard"},
        {"pair_id": 28, "function": "\\cot(x)", "derivative": "-\\csc^2(x)", "family": "trig", "level": "hard"},
        {"pair_id": 29, "function": "\\sec(x)", "derivative": "\\sec(x)\\tan(x)", "family": "trig", "level": "hard"},
        {"pair_id": 30, "function": "\\csc(x)", "derivative": "-\\csc(x)\\cot(x)", "family": "trig", "level": "hard"},
        # pool extension (2026-06)
        {"pair_id": 31, "function": "x^7", "derivative": "7x^6", "family": "poly", "level": "easy"},
        {"pair_id": 32, "function": "e^{-x}", "derivative": "-e^{-x}", "family": "exp", "level": "normal"},
        {"pair_id": 33, "function": "x^{\\frac{3}{2}}", "derivative": "\\frac{3}{2}x^{\\frac{1}{2}}", "family": "poly", "level": "normal"},
        {"pair_id": 34, "function": "5^x", "derivative": "5^x \\ln 5", "family": "exp", "level": "normal"},
    ]

    # --------------------------------------------------------------
    # PRODUCT RULE: (f g)' = f'g + fg', one-to-one matching.
    # Level by the families of the two factors:
    #   easy   -> one factor is polynomial
    #   normal -> one factor in {poly, exp, sin, cos}
    #   hard   -> any pairing within {poly, exp, trig, inv_trig, log}
    # --------------------------------------------------------------
    product_pairs = [
        # easy: poly x other
        {"pair_id": 1, "function": "x \\sin(x)", "derivative": "\\sin(x) + x \\cos(x)", "families": ["poly", "trig"], "level": "easy"},
        {"pair_id": 2, "function": "x \\cos(x)", "derivative": "\\cos(x) - x \\sin(x)", "families": ["poly", "trig"], "level": "easy"},
        {"pair_id": 3, "function": "x e^x", "derivative": "e^x + x e^x", "families": ["poly", "exp"], "level": "easy"},
        {"pair_id": 4, "function": "x \\ln(x)", "derivative": "\\ln(x) + 1", "families": ["poly", "log"], "level": "easy"},
        {"pair_id": 5, "function": "x^2 \\sin(x)", "derivative": "2x \\sin(x) + x^2 \\cos(x)", "families": ["poly", "trig"], "level": "easy"},
        {"pair_id": 6, "function": "x^2 \\cos(x)", "derivative": "2x \\cos(x) - x^2 \\sin(x)", "families": ["poly", "trig"], "level": "easy"},
        {"pair_id": 7, "function": "x^2 e^x", "derivative": "2x e^x + x^2 e^x", "families": ["poly", "exp"], "level": "easy"},
        {"pair_id": 8, "function": "x^2 \\ln(x)", "derivative": "2x \\ln(x) + x", "families": ["poly", "log"], "level": "easy"},
        {"pair_id": 9, "function": "x \\tan(x)", "derivative": "\\tan(x) + x \\sec^2(x)", "families": ["poly", "trig"], "level": "easy"},
        {"pair_id": 10, "function": "x \\arctan(x)", "derivative": "\\arctan(x) + \\frac{x}{1 + x^2}", "families": ["poly", "inv_trig"], "level": "easy"},
        # normal: {exp, sin, cos} x other
        {"pair_id": 11, "function": "e^x \\sin(x)", "derivative": "e^x \\sin(x) + e^x \\cos(x)", "families": ["exp", "trig"], "level": "normal"},
        {"pair_id": 12, "function": "e^x \\cos(x)", "derivative": "e^x \\cos(x) - e^x \\sin(x)", "families": ["exp", "trig"], "level": "normal"},
        {"pair_id": 13, "function": "e^x \\ln(x)", "derivative": "e^x \\ln(x) + \\frac{e^x}{x}", "families": ["exp", "log"], "level": "normal"},
        {"pair_id": 14, "function": "\\sin(x) \\cos(x)", "derivative": "\\cos^2(x) - \\sin^2(x)", "families": ["trig"], "level": "normal"},
        {"pair_id": 15, "function": "\\sin(x) \\ln(x)", "derivative": "\\frac{\\sin(x)}{x} + \\ln(x) \\cos(x)", "families": ["trig", "log"], "level": "normal"},
        {"pair_id": 16, "function": "\\cos(x) \\ln(x)", "derivative": "\\frac{\\cos(x)}{x} - \\ln(x) \\sin(x)", "families": ["trig", "log"], "level": "normal"},
        {"pair_id": 17, "function": "e^x \\arctan(x)", "derivative": "e^x \\arctan(x) + \\frac{e^x}{1 + x^2}", "families": ["exp", "inv_trig"], "level": "normal"},
        {"pair_id": 18, "function": "\\sin(x) \\arctan(x)", "derivative": "\\cos(x) \\arctan(x) + \\frac{\\sin(x)}{1 + x^2}", "families": ["trig", "inv_trig"], "level": "normal"},
        # hard: pairings among {trig, inv_trig, log}
        {"pair_id": 19, "function": "\\tan(x) \\ln(x)", "derivative": "\\sec^2(x) \\ln(x) + \\frac{\\tan(x)}{x}", "families": ["trig", "log"], "level": "hard"},
        {"pair_id": 20, "function": "\\ln(x) \\arctan(x)", "derivative": "\\frac{\\arctan(x)}{x} + \\frac{\\ln(x)}{1 + x^2}", "families": ["log", "inv_trig"], "level": "hard"},
        {"pair_id": 21, "function": "\\ln(x) \\arcsin(x)", "derivative": "\\frac{\\arcsin(x)}{x} + \\frac{\\ln(x)}{\\sqrt{1 - x^2}}", "families": ["log", "inv_trig"], "level": "hard"},
        {"pair_id": 22, "function": "\\tan(x) \\arctan(x)", "derivative": "\\sec^2(x) \\arctan(x) + \\frac{\\tan(x)}{1 + x^2}", "families": ["trig", "inv_trig"], "level": "hard"},
        # pool extension (2026-06)
        {"pair_id": 23, "function": "x^3 e^x", "derivative": "3x^2 e^x + x^3 e^x", "families": ["poly", "exp"], "level": "easy"},
        {"pair_id": 24, "function": "x \\arcsin(x)", "derivative": "\\arcsin(x) + \\frac{x}{\\sqrt{1 - x^2}}", "families": ["poly", "inv_trig"], "level": "easy"},
        {"pair_id": 25, "function": "e^x \\tan(x)", "derivative": "e^x \\tan(x) + e^x \\sec^2(x)", "families": ["exp", "trig"], "level": "normal"},
        {"pair_id": 26, "function": "\\cos(x) \\arctan(x)", "derivative": "-\\sin(x) \\arctan(x) + \\frac{\\cos(x)}{1 + x^2}", "families": ["trig", "inv_trig"], "level": "normal"},
    ]

    # --------------------------------------------------------------
    # QUOTIENT RULE: (f/g)' = (f'g - fg')/g^2, one-to-one matching.
    # Level by the denominator g:
    #   easy   -> g is a power function (x, x^2, x+1)
    #   normal -> g in {poly, exp, sin, cos}
    #   hard   -> g also includes ln, sec, tan
    # --------------------------------------------------------------
    quotient_pairs = [
        # easy: g = power function
        {"pair_id": 1, "function": "\\frac{\\sin(x)}{x}", "derivative": "\\frac{\\cos(x) \\cdot x - \\sin(x)}{x^2}", "families": ["trig", "poly"], "level": "easy"},
        {"pair_id": 2, "function": "\\frac{\\cos(x)}{x}", "derivative": "\\frac{-\\sin(x) \\cdot x - \\cos(x)}{x^2}", "families": ["trig", "poly"], "level": "easy"},
        {"pair_id": 3, "function": "\\frac{e^x}{x}", "derivative": "\\frac{e^x \\cdot x - e^x}{x^2}", "families": ["exp", "poly"], "level": "easy"},
        {"pair_id": 4, "function": "\\frac{\\ln(x)}{x}", "derivative": "\\frac{1 - \\ln(x)}{x^2}", "families": ["log", "poly"], "level": "easy"},
        {"pair_id": 5, "function": "\\frac{\\sin(x)}{x^2}", "derivative": "\\frac{\\cos(x) \\cdot x - 2 \\sin(x)}{x^3}", "families": ["trig", "poly"], "level": "easy"},
        {"pair_id": 6, "function": "\\frac{\\cos(x)}{x^2}", "derivative": "\\frac{-\\sin(x) \\cdot x - 2 \\cos(x)}{x^3}", "families": ["trig", "poly"], "level": "easy"},
        {"pair_id": 7, "function": "\\frac{\\ln(x)}{x^2}", "derivative": "\\frac{1 - 2 \\ln(x)}{x^3}", "families": ["log", "poly"], "level": "easy"},
        {"pair_id": 8, "function": "\\frac{x}{x + 1}", "derivative": "\\frac{1}{(x + 1)^2}", "families": ["poly"], "level": "easy"},
        # normal: g in {exp, sin, cos}
        {"pair_id": 9, "function": "\\frac{x}{e^x}", "derivative": "\\frac{e^x - x e^x}{e^{2x}}", "families": ["poly", "exp"], "level": "normal"},
        {"pair_id": 10, "function": "\\frac{x^2}{e^x}", "derivative": "\\frac{2x e^x - x^2 e^x}{e^{2x}}", "families": ["poly", "exp"], "level": "normal"},
        {"pair_id": 11, "function": "\\frac{x}{\\sin(x)}", "derivative": "\\frac{\\sin(x) - x \\cos(x)}{\\sin^2(x)}", "families": ["poly", "trig"], "level": "normal"},
        {"pair_id": 12, "function": "\\frac{x}{\\cos(x)}", "derivative": "\\frac{\\cos(x) + x \\sin(x)}{\\cos^2(x)}", "families": ["poly", "trig"], "level": "normal"},
        {"pair_id": 13, "function": "\\frac{e^x}{\\sin(x)}", "derivative": "\\frac{e^x \\sin(x) - e^x \\cos(x)}{\\sin^2(x)}", "families": ["exp", "trig"], "level": "normal"},
        {"pair_id": 14, "function": "\\frac{e^x}{\\cos(x)}", "derivative": "\\frac{e^x \\cos(x) + e^x \\sin(x)}{\\cos^2(x)}", "families": ["exp", "trig"], "level": "normal"},
        {"pair_id": 15, "function": "\\frac{x^2}{\\sin(x)}", "derivative": "\\frac{2x \\sin(x) - x^2 \\cos(x)}{\\sin^2(x)}", "families": ["poly", "trig"], "level": "normal"},
        {"pair_id": 16, "function": "\\frac{x^2}{\\cos(x)}", "derivative": "\\frac{2x \\cos(x) + x^2 \\sin(x)}{\\cos^2(x)}", "families": ["poly", "trig"], "level": "normal"},
        {"pair_id": 17, "function": "\\frac{\\sin(x)}{e^x}", "derivative": "\\frac{\\cos(x) e^x - \\sin(x) e^x}{e^{2x}}", "families": ["trig", "exp"], "level": "normal"},
        {"pair_id": 18, "function": "\\frac{\\cos(x)}{e^x}", "derivative": "\\frac{-\\sin(x) e^x - \\cos(x) e^x}{e^{2x}}", "families": ["trig", "exp"], "level": "normal"},
        {"pair_id": 19, "function": "\\frac{\\ln(x)}{e^x}", "derivative": "\\frac{\\frac{e^x}{x} - e^x \\ln(x)}{e^{2x}}", "families": ["log", "exp"], "level": "normal"},
        # hard: g includes ln, sec, tan
        {"pair_id": 20, "function": "\\frac{x}{\\ln(x)}", "derivative": "\\frac{\\ln(x) - 1}{(\\ln(x))^2}", "families": ["poly", "log"], "level": "hard"},
        {"pair_id": 21, "function": "\\frac{x^2}{\\ln(x)}", "derivative": "\\frac{2x \\ln(x) - x}{(\\ln(x))^2}", "families": ["poly", "log"], "level": "hard"},
        {"pair_id": 22, "function": "\\frac{e^x}{\\ln(x)}", "derivative": "\\frac{e^x \\ln(x) - \\frac{e^x}{x}}{(\\ln(x))^2}", "families": ["exp", "log"], "level": "hard"},
        {"pair_id": 23, "function": "\\frac{\\sin(x)}{\\ln(x)}", "derivative": "\\frac{\\cos(x) \\ln(x) - \\frac{\\sin(x)}{x}}{(\\ln(x))^2}", "families": ["trig", "log"], "level": "hard"},
        {"pair_id": 24, "function": "\\frac{\\cos(x)}{\\ln(x)}", "derivative": "\\frac{-\\sin(x) \\ln(x) - \\frac{\\cos(x)}{x}}{(\\ln(x))^2}", "families": ["trig", "log"], "level": "hard"},
        {"pair_id": 25, "function": "\\frac{x}{\\tan(x)}", "derivative": "\\frac{\\tan(x) - x \\sec^2(x)}{\\tan^2(x)}", "families": ["poly", "trig"], "level": "hard"},
        {"pair_id": 26, "function": "\\frac{e^x}{\\tan(x)}", "derivative": "\\frac{e^x \\tan(x) - e^x \\sec^2(x)}{\\tan^2(x)}", "families": ["exp", "trig"], "level": "hard"},
        {"pair_id": 27, "function": "\\frac{x}{\\sec(x)}", "derivative": "\\frac{\\sec(x) - x \\sec(x)\\tan(x)}{\\sec^2(x)}", "families": ["poly", "trig"], "level": "hard"},
        # pool extension (2026-06)
        {"pair_id": 28, "function": "\\frac{\\tan(x)}{x}", "derivative": "\\frac{x \\sec^2(x) - \\tan(x)}{x^2}", "families": ["trig", "poly"], "level": "easy"},
        {"pair_id": 29, "function": "\\frac{x}{x^2 + 1}", "derivative": "\\frac{1 - x^2}{(x^2 + 1)^2}", "families": ["poly"], "level": "easy"},
        {"pair_id": 30, "function": "\\frac{\\arctan(x)}{x}", "derivative": "\\frac{\\frac{x}{1 + x^2} - \\arctan(x)}{x^2}", "families": ["inv_trig", "poly"], "level": "easy"},
        {"pair_id": 31, "function": "\\frac{\\ln(x)}{\\sin(x)}", "derivative": "\\frac{\\frac{\\sin(x)}{x} - \\ln(x) \\cos(x)}{\\sin^2(x)}", "families": ["log", "trig"], "level": "hard"},
    ]

    # --------------------------------------------------------------
    # CHAIN RULE: complex inner functions, multi-block factor matching.
    # --------------------------------------------------------------
    chain_pairs = [
        {"pair_id": 1, "function": "\\sin(\\cos(x))", "factors": ["\\cos(\\cos(x))", "-\\sin(x)"], "expected_parts": 3},
        {"pair_id": 2, "function": "\\ln(\\tan(x))", "factors": ["\\frac{1}{\\tan(x)}", "\\sec^2(x)"], "expected_parts": 3},
        {"pair_id": 3, "function": "e^{\\sec(x)}", "factors": ["e^{\\sec(x)}", "\\sec(x)\\tan(x)"], "expected_parts": 3},
        {"pair_id": 4, "function": "\\cos(\\ln(x))", "factors": ["-\\sin(\\ln(x))", "\\frac{1}{x}"], "expected_parts": 3},
        {"pair_id": 5, "function": "\\tan(\\sqrt{x})", "factors": ["\\sec^2(\\sqrt{x})", "\\frac{1}{2\\sqrt{x}}"], "expected_parts": 3},
        {"pair_id": 6, "function": "\\sin(e^x)", "factors": ["\\cos(e^x)", "e^x"], "expected_parts": 3},
        {"pair_id": 7, "function": "e^{\\sin(x)}", "factors": ["e^{\\sin(x)}", "\\cos(x)"], "expected_parts": 3},
        {"pair_id": 8, "function": "\\sqrt{\\ln(x)}", "factors": ["\\frac{1}{2\\sqrt{\\ln(x)}}", "\\frac{1}{x}"], "expected_parts": 3},
        {"pair_id": 9, "function": "\\ln(\\cos(x))", "factors": ["\\frac{1}{\\cos(x)}", "-\\sin(x)"], "expected_parts": 3},
        {"pair_id": 10, "function": "\\cos(\\sqrt{x})", "factors": ["-\\sin(\\sqrt{x})", "\\frac{1}{2\\sqrt{x}}"], "expected_parts": 3},
        {"pair_id": 11, "function": "\\sin(\\ln(x))", "factors": ["\\cos(\\ln(x))", "\\frac{1}{x}"], "expected_parts": 3},
        {"pair_id": 12, "function": "\\arctan(\\sin(x))", "factors": ["\\frac{1}{1 + \\sin^2(x)}", "\\cos(x)"], "expected_parts": 3},
        # pool extension (2026-06)
        {"pair_id": 13, "function": "\\ln(\\sin(x))", "factors": ["\\frac{1}{\\sin(x)}", "\\cos(x)"], "expected_parts": 3},
        {"pair_id": 14, "function": "(x^2 + 1)^5", "factors": ["5(x^2 + 1)^4", "2x"], "expected_parts": 3},
        {"pair_id": 15, "function": "e^{\\cos(x)}", "factors": ["e^{\\cos(x)}", "-\\sin(x)"], "expected_parts": 3},
        {"pair_id": 16, "function": "\\sqrt{x^2 + 1}", "factors": ["\\frac{1}{2\\sqrt{x^2 + 1}}", "2x"], "expected_parts": 3},
    ]

    # --- Basic: balanced one-to-one matching ---
    if mode == "basic":
        pool = _filter_pairs(basic_pairs, difficulty, families, "family")
        if not pool:
            pool = basic_pairs
        selected_pairs = _sample_balanced(pool, min(9, len(pool)), "family")
        return _build_one_to_one(selected_pairs, 2)

    # --- Product / Quotient: one-to-one matching ---
    elif mode in ("product", "quotient"):
        source = product_pairs if mode == "product" else quotient_pairs
        pool = _filter_pairs(source, difficulty, families, "families")
        if not pool:
            pool = source
        selected_pairs = random.sample(pool, min(9, len(pool)))
        return _build_one_to_one(selected_pairs, 2)

    # --- Chain rule: multi-block factor matching ---
    elif mode == "chain":
        return _build_chain(chain_pairs)

    return {"blocks": [], "operators": []}


def _filter_pairs(pairs, difficulty, families, family_key):
    """Filter a pair pool by custom families (overrides difficulty) or by a
    cumulative easy/normal/hard preset. `family_key` is 'family' (single str)
    for basic pairs or 'families' (list) for product/quotient pairs."""
    if families:
        fam = set(families)
        if family_key == "family":
            return [p for p in pairs if p["family"] in fam]
        return [p for p in pairs if set(p["families"]) <= fam]
    if difficulty in _LEVEL_ORDER:
        max_level = _LEVEL_ORDER[difficulty]
        return [p for p in pairs if _LEVEL_ORDER[p["level"]] <= max_level]
    return list(pairs)


def _sample_balanced(pairs, n, family_key):
    """Sample n pairs spread as evenly as possible across families, so no single
    family (e.g. polynomials) dominates the board."""
    groups = defaultdict(list)
    for p in pairs:
        key = p[family_key] if family_key == "family" else tuple(sorted(p["families"]))
        groups[key].append(p)
    for g in groups.values():
        random.shuffle(g)

    keys = list(groups.keys())
    random.shuffle(keys)
    result = []
    progressed = True
    while len(result) < n and progressed:
        progressed = False
        for k in keys:
            if groups[k]:
                result.append(groups[k].pop())
                progressed = True
                if len(result) >= n:
                    break
    return result


def _build_chain(chain_pairs):
    """Build multi-block chain-rule board (function block + factor blocks)."""
    remaining = list(chain_pairs)
    random.shuffle(remaining)

    selected = []
    total = 0
    for p in remaining:
        pair_total = 1 + len(p["factors"])
        if total + pair_total > 18:
            continue
        selected.append(p)
        total += pair_total
        if total >= 18:
            break

    blocks = []
    for p in selected:
        blocks.append({
            "function_id": [p["pair_id"]],
            "factor_id": [],
            "text": p["function"],
            "type": "function",
            "expected_parts": p["expected_parts"]
        })

    factor_entries = []
    for p in selected:
        for f in p["factors"]:
            factor_entries.append({"text": f, "pair_id": p["pair_id"]})

    text_counts = Counter(fe["text"] for fe in factor_entries)
    text_to_ids = {}
    for fe in factor_entries:
        text_to_ids.setdefault(fe["text"], []).append(fe["pair_id"])

    for text, pids in text_to_ids.items():
        for _ in range(text_counts[text]):
            blocks.append({
                "function_id": [],
                "factor_id": pids,
                "text": text,
                "type": "derivative",
                "expected_parts": 3
            })

    _merge_ids(blocks, role_separated=True)
    random.shuffle(blocks)
    return {"blocks": blocks, "operators": []}


def _build_one_to_one(pairs, expected_parts):
    """Build one-to-one f/f' blocks from pairs list"""
    blocks = []
    for pair in pairs:
        blocks.append({
            "function_id": [pair["pair_id"]],
            "factor_id": [],
            "text": pair["function"],
            "type": "function",
            "expected_parts": expected_parts
        })

    deriv_entries = []
    for pair in pairs:
        deriv_entries.append({"text": pair["derivative"], "pair_id": pair["pair_id"]})

    text_counts = Counter(de["text"] for de in deriv_entries)
    text_to_ids = {}
    for de in deriv_entries:
        text_to_ids.setdefault(de["text"], []).append(de["pair_id"])

    for text, pids in text_to_ids.items():
        for _ in range(text_counts[text]):
            blocks.append({
                "function_id": [],
                "factor_id": pids,
                "text": text,
                "type": "derivative",
                "expected_parts": expected_parts
            })

    _merge_ids(blocks, role_separated=False)
    random.shuffle(blocks)
    return {"blocks": blocks, "operators": []}


def _merge_ids(blocks, role_separated):
    """Merge ids across blocks with identical text.

    role_separated=True (chain mode): a function block accumulates only function_ids, a
    factor block only factor_ids. A text that is a function in one pair and a factor in
    another (e.g. cos(ln x): function of pair 4, factor of pair 11) stays as two distinct
    blocks — one pure function, one pure factor. Required so the chain click-order rules
    can't be exploited with cross-referential or duplicated factor blocks.

    role_separated=False (one-to-one modes): every block with text T gets all function_ids
    AND all factor_ids of T, so identical-looking blocks are fully interchangeable. E.g.
    cos(x) is the derivative of sin(x) (pair 7) and the function for -sin(x) (pair 8);
    both cos(x) blocks can be matched either way. Safe because a one-to-one match needs a
    function_id on one block intersecting a factor_id on the other — two cos(x) copies
    cannot match each other."""
    text_to_function_ids = defaultdict(list)
    text_to_factor_ids = defaultdict(list)
    for b in blocks:
        for fid in b["function_id"]:
            if fid not in text_to_function_ids[b["text"]]:
                text_to_function_ids[b["text"]].append(fid)
        for fid in b["factor_id"]:
            if fid not in text_to_factor_ids[b["text"]]:
                text_to_factor_ids[b["text"]].append(fid)
    for b in blocks:
        if not role_separated:
            b["function_id"] = sorted(text_to_function_ids[b["text"]])
            b["factor_id"] = sorted(text_to_factor_ids[b["text"]])
        elif b["type"] == "function":
            b["function_id"] = sorted(text_to_function_ids[b["text"]])
            b["factor_id"] = []
        else:
            b["function_id"] = []
            b["factor_id"] = sorted(text_to_factor_ids[b["text"]])
