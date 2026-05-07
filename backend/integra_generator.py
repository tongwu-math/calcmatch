import random
from collections import Counter, defaultdict

def generate_level(mode):

    easy_pairs = [
        {"pair_id": 1, "function": "x^2", "antiderivative": "\\frac{x^3}{3}"},
        {"pair_id": 2, "function": "x^3", "antiderivative": "\\frac{x^4}{4}"},
        {"pair_id": 3, "function": "x^4", "antiderivative": "\\frac{x^5}{5}"},
        {"pair_id": 4, "function": "x", "antiderivative": "\\frac{x^2}{2}"},
        {"pair_id": 5, "function": "\\sin(x)", "antiderivative": "-\\cos(x)"},
        {"pair_id": 6, "function": "\\cos(x)", "antiderivative": "\\sin(x)"},
        {"pair_id": 7, "function": "\\sec^2(x)", "antiderivative": "\\tan(x)"},
        {"pair_id": 8, "function": "\\frac{1}{x}", "antiderivative": "\\ln|x|"},
        {"pair_id": 9, "function": "e^x", "antiderivative": "e^x"},
        {"pair_id": 10, "function": "e^{2x}", "antiderivative": "\\frac{e^{2x}}{2}"},
        {"pair_id": 11, "function": "2x", "antiderivative": "x^2"},
        {"pair_id": 12, "function": "3x^2", "antiderivative": "x^3"},
        {"pair_id": 13, "function": "\\frac{1}{1 + x^2}", "antiderivative": "\\arctan(x)"},
        {"pair_id": 14, "function": "\\csc^2(x)", "antiderivative": "-\\cot(x)"},
        {"pair_id": 15, "function": "\\frac{1}{\\sqrt{1 - x^2}}", "antiderivative": "\\arcsin(x)"},
    ]

    normal_pairs = [
        {"pair_id": 1, "preusub": "2x e^{x^2}", "usub": "u = x^2", "postusub": "\\int e^u\\,du"},
        {"pair_id": 2, "preusub": "3x^2 e^{x^3}", "usub": "u = x^3", "postusub": "\\int e^u\\,du"},
        {"pair_id": 3, "preusub": "\\sec^2(x) \\tan(x)", "usub": "u = \\tan(x)", "postusub": "\\int u\\,du"},
        {"pair_id": 4, "preusub": "\\frac{\\ln(x)}{x}", "usub": "u = \\ln(x)", "postusub": "\\int u\\,du"},
        {"pair_id": 5, "preusub": "\\frac{2x}{x^2 + 1}", "usub": "u = x^2 + 1", "postusub": "\\int \\frac{1}{u}\\,du"},
        {"pair_id": 6, "preusub": "\\sin(x) \\cos(x)", "usub": "u = \\sin(x)", "postusub": "\\int u\\,du"},
        {"pair_id": 7, "preusub": "\\cos(x) e^{\\sin(x)}", "usub": "u = \\sin(x)", "postusub": "\\int e^u\\,du"},
        {"pair_id": 8, "preusub": "\\frac{1}{x \\ln(x)}", "usub": "u = \\ln(x)", "postusub": "\\int \\frac{1}{u}\\,du"},
        {"pair_id": 9, "preusub": "2x (x^2 + 1)^3", "usub": "u = x^2 + 1", "postusub": "\\int u^3\\,du"},
        {"pair_id": 10, "preusub": "\\frac{x}{\\sqrt{x^2 + 1}}", "usub": "u = x^2 + 1", "postusub": "\\int \\frac{1}{2\\sqrt{u}}\\,du"},
        {"pair_id": 11, "preusub": "\\cos(x) \\sin^2(x)", "usub": "u = \\sin(x)", "postusub": "\\int u^2\\,du"},
        {"pair_id": 12, "preusub": "\\frac{e^x}{1 + e^x}", "usub": "u = 1 + e^x", "postusub": "\\int \\frac{1}{u}\\,du"},
    ]
    for p in normal_pairs:
        p["expected_parts"] = 3

    # Hard: integration by parts  integral uv'dx = uv - integral u'v dx
    # Block 1 (uvp): integral uv' dx   -- the original integral
    # Block 2 (uv):  uv                -- the boundary term
    # Block 3 (vup): integral u'v dx   -- the remaining integral (UNSOLVED)
    hard_pairs = [
        {"pair_id": 1, "uvp": "x \\sin(x)", "uv": "-x \\cos(x)", "vup": "\\cos(x)"},
        {"pair_id": 2, "uvp": "x e^x", "uv": "x e^x", "vup": "e^x"},
        {"pair_id": 3, "uvp": "x \\cos(x)", "uv": "x \\sin(x)", "vup": "\\sin(x)"},
        {"pair_id": 4, "uvp": "\\ln(x)", "uv": "x \\ln(x)", "vup": "1"},
        {"pair_id": 5, "uvp": "x \\ln(x)", "uv": "\\frac{x^2}{2} \\ln(x)", "vup": "\\frac{x}{2}"},
        {"pair_id": 6, "uvp": "x^2 \\ln(x)", "uv": "\\frac{x^3}{3} \\ln(x)", "vup": "\\frac{x^2}{3}"},
        {"pair_id": 7, "uvp": "\\arcsin(x)", "uv": "x \\arcsin(x)", "vup": "\\frac{x}{\\sqrt{1 - x^2}}"},
        {"pair_id": 8, "uvp": "x \\sec^2(x)", "uv": "x \\tan(x)", "vup": "\\tan(x)"},
        {"pair_id": 9, "uvp": "e^x \\sin(x)", "uv": "e^x \\sin(x)", "vup": "e^x \\cos(x)"},
        {"pair_id": 10, "uvp": "x \\arctan(x)", "uv": "\\frac{x^2}{2} \\arctan(x)", "vup": "\\frac{x^2}{2(1 + x^2)}"},
    ]
    for p in hard_pairs:
        p["expected_parts"] = 3

    if mode == "easy":
        selected_pairs = random.sample(easy_pairs, 10)
        return _build_easy_mode(selected_pairs)

    elif mode == "normal":
        remaining = list(normal_pairs)
        random.shuffle(remaining)
        selected = []
        total = 0
        for p in remaining:
            pair_total = 3
            if total + pair_total > 28:
                continue
            selected.append(p)
            total += pair_total
            if total >= 18:
                break
        return _build_normal_mode(selected)

    elif mode == "hard":
        remaining = list(hard_pairs)
        random.shuffle(remaining)
        selected = []
        total = 0
        for p in remaining:
            pair_total = 3
            if total + pair_total > 28:
                continue
            selected.append(p)
            total += pair_total
            if total >= 18:
                break
        return _build_hard_mode(selected)

    return {"blocks": [], "operators": []}


def _build_easy_mode(pairs):
    blocks = []
    for pair in pairs:
        blocks.append({
            "func_id": [pair["pair_id"]],
            "int_id": [],
            "text": pair["function"],
            "type": "function",
            "expected_parts": 2
        })

    int_entries = []
    for pair in pairs:
        int_entries.append({"text": pair["antiderivative"], "pair_id": pair["pair_id"]})

    text_counts = Counter(ie["text"] for ie in int_entries)
    text_to_ids = {}
    for ie in int_entries:
        if ie["text"] not in text_to_ids:
            text_to_ids[ie["text"]] = []
        text_to_ids[ie["text"]].append(ie["pair_id"])

    for text, pids in text_to_ids.items():
        count = text_counts[text]
        for _ in range(count):
            blocks.append({
                "func_id": [],
                "int_id": pids,
                "text": text,
                "type": "antiderivative",
                "expected_parts": 2
            })

    text_to_func_ids = defaultdict(list)
    text_to_int_ids = defaultdict(list)
    for b in blocks:
        for fid in b["func_id"]:
            if fid not in text_to_func_ids[b["text"]]:
                text_to_func_ids[b["text"]].append(fid)
        for iid in b["int_id"]:
            if iid not in text_to_int_ids[b["text"]]:
                text_to_int_ids[b["text"]].append(iid)
    for b in blocks:
        b["func_id"] = sorted(text_to_func_ids[b["text"]])
        b["int_id"] = sorted(text_to_int_ids[b["text"]])

    random.shuffle(blocks)
    return {"blocks": blocks, "operators": []}


def _build_normal_mode(pairs):
    blocks = []

    for p in pairs:
        blocks.append({
            "preusub_id": [p["pair_id"]],
            "usub_id": [],
            "postusub_id": [],
            "text": "\\int " + p["preusub"] + "\\,dx",
            "type": "function",
            "expected_parts": p["expected_parts"]
        })

    usub_entries = []
    for p in pairs:
        usub_entries.append({"text": p["usub"], "pair_id": p["pair_id"]})

    text_counts = Counter(ue["text"] for ue in usub_entries)
    text_to_ids = {}
    for ue in usub_entries:
        if ue["text"] not in text_to_ids:
            text_to_ids[ue["text"]] = []
        text_to_ids[ue["text"]].append(ue["pair_id"])

    for text, pids in text_to_ids.items():
        count = text_counts[text]
        for _ in range(count):
            blocks.append({
                "preusub_id": [],
                "usub_id": pids,
                "postusub_id": [],
                "text": text,
                "type": "antiderivative",
                "expected_parts": 3
            })

    postusub_entries = []
    for p in pairs:
        postusub_entries.append({"text": p["postusub"], "pair_id": p["pair_id"]})

    text_counts = Counter(pe["text"] for pe in postusub_entries)
    text_to_ids = {}
    for pe in postusub_entries:
        if pe["text"] not in text_to_ids:
            text_to_ids[pe["text"]] = []
        text_to_ids[pe["text"]].append(pe["pair_id"])

    for text, pids in text_to_ids.items():
        count = text_counts[text]
        for _ in range(count):
            blocks.append({
                "preusub_id": [],
                "usub_id": [],
                "postusub_id": pids,
                "text": text,
                "type": "antiderivative",
                "expected_parts": 3
            })

    text_to_preusub_ids = defaultdict(list)
    text_to_usub_ids = defaultdict(list)
    text_to_postusub_ids = defaultdict(list)
    for b in blocks:
        for pid in b["preusub_id"]:
            if pid not in text_to_preusub_ids[b["text"]]:
                text_to_preusub_ids[b["text"]].append(pid)
        for uid in b["usub_id"]:
            if uid not in text_to_usub_ids[b["text"]]:
                text_to_usub_ids[b["text"]].append(uid)
        for po_id in b["postusub_id"]:
            if po_id not in text_to_postusub_ids[b["text"]]:
                text_to_postusub_ids[b["text"]].append(po_id)
    for b in blocks:
        b["preusub_id"] = sorted(text_to_preusub_ids[b["text"]])
        b["usub_id"] = sorted(text_to_usub_ids[b["text"]])
        b["postusub_id"] = sorted(text_to_postusub_ids[b["text"]])

    random.shuffle(blocks)
    return {"blocks": blocks, "operators": []}


def _build_hard_mode(pairs):
    blocks = []

    # UVP blocks: integral uv' dx
    for p in pairs:
        blocks.append({
            "uvp_id": [p["pair_id"]],
            "uv_id": [],
            "vup_id": [],
            "text": "\\int " + p["uvp"] + "\\,dx",
            "type": "function",
            "expected_parts": p["expected_parts"]
        })

    # UV blocks
    uv_entries = []
    for p in pairs:
        uv_entries.append({"text": p["uv"], "pair_id": p["pair_id"]})

    text_counts = Counter(uve["text"] for uve in uv_entries)
    text_to_ids = {}
    for uve in uv_entries:
        if uve["text"] not in text_to_ids:
            text_to_ids[uve["text"]] = []
        text_to_ids[uve["text"]].append(uve["pair_id"])

    for text, pids in text_to_ids.items():
        count = text_counts[text]
        for _ in range(count):
            blocks.append({
                "uvp_id": [],
                "uv_id": pids,
                "vup_id": [],
                "text": text,
                "type": "antiderivative",
                "expected_parts": 3
            })

    # VUP blocks: integral u'v dx (unsimplified)
    vup_entries = []
    for p in pairs:
        vup_entries.append({"text": p["vup"], "pair_id": p["pair_id"]})

    text_counts = Counter(ve["text"] for ve in vup_entries)
    text_to_ids = {}
    for ve in vup_entries:
        if ve["text"] not in text_to_ids:
            text_to_ids[ve["text"]] = []
        text_to_ids[ve["text"]].append(ve["pair_id"])

    for text, pids in text_to_ids.items():
        count = text_counts[text]
        for _ in range(count):
            blocks.append({
                "uvp_id": [],
                "uv_id": [],
                "vup_id": pids,
                "text": "\\int " + text + "\\,dx",
                "type": "antiderivative",
                "expected_parts": 3
            })

    text_to_uvp_ids = defaultdict(list)
    text_to_uv_ids = defaultdict(list)
    text_to_vup_ids = defaultdict(list)
    for b in blocks:
        for uvp_id in b["uvp_id"]:
            if uvp_id not in text_to_uvp_ids[b["text"]]:
                text_to_uvp_ids[b["text"]].append(uvp_id)
        for uv_id in b["uv_id"]:
            if uv_id not in text_to_uv_ids[b["text"]]:
                text_to_uv_ids[b["text"]].append(uv_id)
        for vup_id in b["vup_id"]:
            if vup_id not in text_to_vup_ids[b["text"]]:
                text_to_vup_ids[b["text"]].append(vup_id)
    for b in blocks:
        b["uvp_id"] = sorted(text_to_uvp_ids[b["text"]])
        b["uv_id"] = sorted(text_to_uv_ids[b["text"]])
        b["vup_id"] = sorted(text_to_vup_ids[b["text"]])

    random.shuffle(blocks)
    return {"blocks": blocks, "operators": []}
