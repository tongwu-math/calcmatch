import random

def generate_level(mode):
    """Generate level data based on difficulty mode"""

    # Easy: basic derivatives, one-to-one matching
    easy_pairs = [
        {"pair_id": 1, "function": "x^2", "derivative": "2x"},
        {"pair_id": 2, "function": "x^3", "derivative": "3x^2"},
        {"pair_id": 3, "function": "x^4", "derivative": "4x^3"},
        {"pair_id": 4, "function": "x^5", "derivative": "5x^4"},
        {"pair_id": 5, "function": "\\sin(x)", "derivative": "\\cos(x)"},
        {"pair_id": 6, "function": "\\cos(x)", "derivative": "-\\sin(x)"},
        {"pair_id": 7, "function": "\\tan(x)", "derivative": "\\sec^2(x)"},
        {"pair_id": 8, "function": "\\ln(x)", "derivative": "\\frac{1}{x}"},
        {"pair_id": 9, "function": "e^x", "derivative": "e^x"},
        {"pair_id": 10, "function": "\\sqrt{x}", "derivative": "\\frac{1}{2\\sqrt{x}}"},
        {"pair_id": 11, "function": "\\frac{1}{x}", "derivative": "-\\frac{1}{x^2}"},
        {"pair_id": 12, "function": "\\arcsin(x)", "derivative": "\\frac{1}{\\sqrt{1 - x^2}}"},
        {"pair_id": 13, "function": "\\arctan(x)", "derivative": "\\frac{1}{1 + x^2}"},
        {"pair_id": 14, "function": "\\sec(x)", "derivative": "\\sec(x)\\tan(x)"},
        {"pair_id": 15, "function": "\\csc(x)", "derivative": "-\\csc(x)\\cot(x)"},
        {"pair_id": 16, "function": "x^{-4}", "derivative": "-4x^{-5}"},
        {"pair_id": 17, "function": "x^{-3}", "derivative": "-3x^{-4}"},
        {"pair_id": 18, "function": "x^{-2}", "derivative": "-2x^{-3}"},
        {"pair_id": 19, "function": "x", "derivative": "1"},
        {"pair_id": 20, "function": "x^{\\frac{1}{3}}", "derivative": "\\frac{1}{3}x^{-\\frac{2}{3}}"},
        {"pair_id": 21, "function": "x^{-\\frac{1}{2}}", "derivative": "-\\frac{1}{2}x^{-\\frac{3}{2}}"},
        {"pair_id": 22, "function": "x^{-\\frac{1}{3}}", "derivative": "-\\frac{1}{3}x^{-\\frac{4}{3}}"},
        {"pair_id": 23, "function": "2^x", "derivative": "2^x \\ln 2"},
        {"pair_id": 24, "function": "3^x", "derivative": "3^x \\ln 3"},
        {"pair_id": 25, "function": "4^x", "derivative": "4^x \\ln 4"},
    ]

    # Normal: product and quotient rule, one-to-one matching
    # Base functions: x, x^2, e^x, ln(x), sin(x), cos(x)
    # Products and quotients between each pair
    normal_pairs = [
        # --- Existing product pairs ---
        {"pair_id": 1, "function": "x \\sin(x)", "derivative": "\\sin(x) + x \\cos(x)"},
        {"pair_id": 2, "function": "x e^x", "derivative": "e^x + x e^x"},
        {"pair_id": 3, "function": "x \\cos(x)", "derivative": "\\cos(x) - x \\sin(x)"},
        {"pair_id": 4, "function": "x \\ln(x)", "derivative": "\\ln(x) + 1"},
        {"pair_id": 5, "function": "x^2 e^x", "derivative": "2x e^x + x^2 e^x"},
        {"pair_id": 6, "function": "e^x \\sin(x)", "derivative": "e^x \\sin(x) + e^x \\cos(x)"},
        # --- Existing quotient pairs ---
        {"pair_id": 7, "function": "\\frac{\\sin(x)}{x}", "derivative": "\\frac{\\cos(x) \\cdot x - \\sin(x)}{x^2}"},
        {"pair_id": 8, "function": "\\frac{x}{x + 1}", "derivative": "\\frac{1}{(x + 1)^2}"},
        {"pair_id": 9, "function": "\\frac{\\ln(x)}{x}", "derivative": "\\frac{1 - \\ln(x)}{x^2}"},
        {"pair_id": 10, "function": "\\frac{e^x}{x + 1}", "derivative": "\\frac{e^x(x + 1) - e^x}{(x + 1)^2}"},
        # --- New product pairs ---
        {"pair_id": 11, "function": "x^2 \\ln(x)", "derivative": "2x \\ln(x) + x"},
        {"pair_id": 12, "function": "x^2 \\sin(x)", "derivative": "2x \\sin(x) + x^2 \\cos(x)"},
        {"pair_id": 13, "function": "x^2 \\cos(x)", "derivative": "2x \\cos(x) - x^2 \\sin(x)"},
        {"pair_id": 14, "function": "e^x \\ln(x)", "derivative": "e^x \\ln(x) + \\frac{e^x}{x}"},
        {"pair_id": 15, "function": "e^x \\cos(x)", "derivative": "e^x \\cos(x) - e^x \\sin(x)"},
        {"pair_id": 16, "function": "\\ln(x) \\sin(x)", "derivative": "\\frac{\\sin(x)}{x} + \\ln(x) \\cos(x)"},
        {"pair_id": 17, "function": "\\ln(x) \\cos(x)", "derivative": "\\frac{\\cos(x)}{x} - \\ln(x) \\sin(x)"},
        {"pair_id": 18, "function": "\\sin(x) \\cos(x)", "derivative": "\\cos^2(x) - \\sin^2(x)"},
        # --- New quotient pairs: x / g ---
        {"pair_id": 19, "function": "\\frac{x}{e^x}", "derivative": "\\frac{e^x - x e^x}{e^{2x}}"},
        {"pair_id": 20, "function": "\\frac{x}{\\ln(x)}", "derivative": "\\frac{\\ln(x) - 1}{(\\ln(x))^2}"},
        {"pair_id": 21, "function": "\\frac{x}{\\sin(x)}", "derivative": "\\frac{\\sin(x) - x \\cos(x)}{\\sin^2(x)}"},
        {"pair_id": 22, "function": "\\frac{x}{\\cos(x)}", "derivative": "\\frac{\\cos(x) + x \\sin(x)}{\\cos^2(x)}"},
        # --- New quotient pairs: x^2 / g ---
        {"pair_id": 23, "function": "\\frac{x^2}{e^x}", "derivative": "\\frac{2x e^x - x^2 e^x}{e^{2x}}"},
        {"pair_id": 24, "function": "\\frac{x^2}{\\ln(x)}", "derivative": "\\frac{2x \\ln(x) - x}{(\\ln(x))^2}"},
        {"pair_id": 25, "function": "\\frac{x^2}{\\sin(x)}", "derivative": "\\frac{2x \\sin(x) - x^2 \\cos(x)}{\\sin^2(x)}"},
        {"pair_id": 26, "function": "\\frac{x^2}{\\cos(x)}", "derivative": "\\frac{2x \\cos(x) + x^2 \\sin(x)}{\\cos^2(x)}"},
        # --- New quotient pairs: e^x / g ---
        {"pair_id": 27, "function": "\\frac{e^x}{x}", "derivative": "\\frac{e^x \\cdot x - e^x}{x^2}"},
        {"pair_id": 28, "function": "\\frac{e^x}{x^2}", "derivative": "\\frac{e^x \\cdot x^2 - e^x \\cdot 2x}{x^4}"},
        {"pair_id": 29, "function": "\\frac{e^x}{\\ln(x)}", "derivative": "\\frac{e^x \\ln(x) - \\frac{e^x}{x}}{(\\ln(x))^2}"},
        {"pair_id": 30, "function": "\\frac{e^x}{\\sin(x)}", "derivative": "\\frac{e^x \\sin(x) - e^x \\cos(x)}{\\sin^2(x)}"},
        {"pair_id": 31, "function": "\\frac{e^x}{\\cos(x)}", "derivative": "\\frac{e^x \\cos(x) + e^x \\sin(x)}{\\cos^2(x)}"},
        # --- New quotient pairs: ln(x) / g ---
        {"pair_id": 32, "function": "\\frac{\\ln(x)}{x^2}", "derivative": "\\frac{1 - 2 \\ln(x)}{x^3}"},
        {"pair_id": 33, "function": "\\frac{\\ln(x)}{e^x}", "derivative": "\\frac{\\frac{e^x}{x} - e^x \\ln(x)}{e^{2x}}"},
        {"pair_id": 34, "function": "\\frac{\\ln(x)}{\\sin(x)}", "derivative": "\\frac{\\frac{\\sin(x)}{x} - \\ln(x) \\cos(x)}{\\sin^2(x)}"},
        {"pair_id": 35, "function": "\\frac{\\ln(x)}{\\cos(x)}", "derivative": "\\frac{\\frac{\\cos(x)}{x} + \\ln(x) \\sin(x)}{\\cos^2(x)}"},
        # --- New quotient pairs: sin(x) / g ---
        {"pair_id": 36, "function": "\\frac{\\sin(x)}{x^2}", "derivative": "\\frac{\\cos(x) \\cdot x - 2 \\sin(x)}{x^3}"},
        {"pair_id": 37, "function": "\\frac{\\sin(x)}{e^x}", "derivative": "\\frac{\\cos(x) e^x - \\sin(x) e^x}{e^{2x}}"},
        {"pair_id": 38, "function": "\\frac{\\sin(x)}{\\ln(x)}", "derivative": "\\frac{\\cos(x) \\ln(x) - \\frac{\\sin(x)}{x}}{(\\ln(x))^2}"},
        # --- New quotient pairs: cos(x) / g ---
        {"pair_id": 39, "function": "\\frac{\\cos(x)}{x}", "derivative": "\\frac{-\\sin(x) \\cdot x - \\cos(x)}{x^2}"},
        {"pair_id": 40, "function": "\\frac{\\cos(x)}{x^2}", "derivative": "\\frac{-\\sin(x) \\cdot x - 2 \\cos(x)}{x^3}"},
        {"pair_id": 41, "function": "\\frac{\\cos(x)}{e^x}", "derivative": "\\frac{-\\sin(x) e^x - \\cos(x) e^x}{e^{2x}}"},
        {"pair_id": 42, "function": "\\frac{\\cos(x)}{\\ln(x)}", "derivative": "\\frac{-\\sin(x) \\ln(x) - \\frac{\\cos(x)}{x}}{(\\ln(x))^2}"},
    ]

    # Hard: complex chain rule, multi-block factors for f'
    hard_pairs = [
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
    ]

    # --- Easy mode: one-to-one matching ---
    if mode == "easy":
        selected_pairs = random.sample(easy_pairs, 10)
        return _build_one_to_one(selected_pairs, 2)

    # --- Normal mode: product/quotient, one-to-one matching ---
    elif mode == "normal":
        selected_pairs = random.sample(normal_pairs, min(8, len(normal_pairs)))
        return _build_one_to_one(selected_pairs, 2)

    # --- Hard mode: chain rule, multi-block factor matching ---
    elif mode == "hard":
        remaining = list(hard_pairs)
        random.shuffle(remaining)

        selected = []
        total = 0
        for p in remaining:
            pair_total = 1 + len(p["factors"])
            if total + pair_total > 28:
                continue
            selected.append(p)
            total += pair_total
            if total >= 16:
                break

        blocks = []

        for p in selected:
            blocks.append({
                "pair_ids": [p["pair_id"]],
                "text": p["function"],
                "type": "function",
                "expected_parts": p["expected_parts"]
            })

        factor_entries = []
        for p in selected:
            for f in p["factors"]:
                factor_entries.append({"text": f, "pair_id": p["pair_id"]})

        from collections import Counter
        text_counts = Counter(fe["text"] for fe in factor_entries)
        text_to_ids = {}
        for fe in factor_entries:
            if fe["text"] not in text_to_ids:
                text_to_ids[fe["text"]] = []
            text_to_ids[fe["text"]].append(fe["pair_id"])

        for text, pids in text_to_ids.items():
            count = text_counts[text]
            for _ in range(count):
                blocks.append({
                    "pair_ids": pids,
                    "text": text,
                    "type": "derivative",
                    "expected_parts": 3
                })

        # Merge pair_ids for blocks with identical text (regardless of type)
        from collections import defaultdict
        text_to_pids = defaultdict(list)
        text_has_function = {}
        for b in blocks:
            for pid in b["pair_ids"]:
                if pid not in text_to_pids[b["text"]]:
                    text_to_pids[b["text"]].append(pid)
            if b["type"] == "function":
                text_has_function[b["text"]] = True
        for b in blocks:
            b["pair_ids"] = sorted(text_to_pids[b["text"]])
            b["can_be_function"] = text_has_function.get(b["text"], False)

        random.shuffle(blocks)
        return {"blocks": blocks, "operators": []}

    return {"blocks": [], "operators": []}


def _build_one_to_one(pairs, expected_parts):
    """Build one-to-one f/f' blocks from pairs list"""
    blocks = []
    for pair in pairs:
        blocks.append({
            "pair_ids": [pair["pair_id"]],
            "text": pair["function"],
            "type": "function",
            "expected_parts": expected_parts
        })

    deriv_entries = []
    for pair in pairs:
        deriv_entries.append({"text": pair["derivative"], "pair_id": pair["pair_id"]})

    from collections import Counter
    text_counts = Counter(de["text"] for de in deriv_entries)
    text_to_ids = {}
    for de in deriv_entries:
        if de["text"] not in text_to_ids:
            text_to_ids[de["text"]] = []
        text_to_ids[de["text"]].append(de["pair_id"])

    for text, pids in text_to_ids.items():
        count = text_counts[text]
        for _ in range(count):
            blocks.append({
                "pair_ids": pids,
                "text": text,
                "type": "derivative",
                "expected_parts": expected_parts
            })

    # Merge pair_ids for blocks with identical text (regardless of type)
    from collections import defaultdict
    text_to_pids = defaultdict(list)
    text_has_function = {}
    for b in blocks:
        for pid in b["pair_ids"]:
            if pid not in text_to_pids[b["text"]]:
                text_to_pids[b["text"]].append(pid)
        if b["type"] == "function":
            text_has_function[b["text"]] = True
    for b in blocks:
        b["pair_ids"] = sorted(text_to_pids[b["text"]])
        b["can_be_function"] = text_has_function.get(b["text"], False)

    random.shuffle(blocks)
    return {"blocks": blocks, "operators": []}