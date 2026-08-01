/* generator.js — client-side port of the CalcMatch level generators.
 *
 * Ports backend/level_generator.py, deriva_generator.py and integra_generator.py
 * to the browser so the game needs no server. Exposes:
 *
 *     window.generateLevel(game, mode, difficulty [, families]) -> {blocks, operators}
 *
 * returning the exact same shape the Flask /api/get_level_data endpoint returned.
 *
 * The CALCMATCH_DATA table below is extracted verbatim (AST literal_eval) from the
 * Python source, so every LaTeX pair is byte-identical to the backend. The assembly
 * logic (filter / sample / build / merge) mirrors the Python line-for-line; only the
 * RNG differs (JS Math.random vs Python random) — boards are random either way, so
 * only the pool, board-size caps, merge rules and block shape need to match.
 */
(function (global) {
    'use strict';

    var CALCMATCH_DATA = {
      "deriva": {
        "basic": [
          {
            "pair_id": 1,
            "function": "x",
            "derivative": "1",
            "family": "poly",
            "level": "easy"
          },
          {
            "pair_id": 2,
            "function": "x^2",
            "derivative": "2x",
            "family": "poly",
            "level": "easy"
          },
          {
            "pair_id": 3,
            "function": "x^3",
            "derivative": "3x^2",
            "family": "poly",
            "level": "easy"
          },
          {
            "pair_id": 4,
            "function": "x^4",
            "derivative": "4x^3",
            "family": "poly",
            "level": "easy"
          },
          {
            "pair_id": 5,
            "function": "x^5",
            "derivative": "5x^4",
            "family": "poly",
            "level": "easy"
          },
          {
            "pair_id": 6,
            "function": "x^6",
            "derivative": "6x^5",
            "family": "poly",
            "level": "easy"
          },
          {
            "pair_id": 7,
            "function": "\\sin(x)",
            "derivative": "\\cos(x)",
            "family": "trig",
            "level": "easy"
          },
          {
            "pair_id": 8,
            "function": "\\cos(x)",
            "derivative": "-\\sin(x)",
            "family": "trig",
            "level": "easy"
          },
          {
            "pair_id": 9,
            "function": "e^x",
            "derivative": "e^x",
            "family": "exp",
            "level": "easy"
          },
          {
            "pair_id": 10,
            "function": "e^{2x}",
            "derivative": "2e^{2x}",
            "family": "exp",
            "level": "easy"
          },
          {
            "pair_id": 11,
            "function": "e^{3x}",
            "derivative": "3e^{3x}",
            "family": "exp",
            "level": "easy"
          },
          {
            "pair_id": 12,
            "function": "\\sqrt{x}",
            "derivative": "\\frac{1}{2\\sqrt{x}}",
            "family": "poly",
            "level": "normal"
          },
          {
            "pair_id": 13,
            "function": "\\frac{1}{x}",
            "derivative": "-\\frac{1}{x^2}",
            "family": "poly",
            "level": "normal"
          },
          {
            "pair_id": 14,
            "function": "x^{-2}",
            "derivative": "-2x^{-3}",
            "family": "poly",
            "level": "normal"
          },
          {
            "pair_id": 15,
            "function": "x^{-3}",
            "derivative": "-3x^{-4}",
            "family": "poly",
            "level": "normal"
          },
          {
            "pair_id": 16,
            "function": "x^{\\frac{1}{3}}",
            "derivative": "\\frac{1}{3}x^{-\\frac{2}{3}}",
            "family": "poly",
            "level": "normal"
          },
          {
            "pair_id": 17,
            "function": "x^{-\\frac{1}{2}}",
            "derivative": "-\\frac{1}{2}x^{-\\frac{3}{2}}",
            "family": "poly",
            "level": "normal"
          },
          {
            "pair_id": 18,
            "function": "2^x",
            "derivative": "2^x \\ln 2",
            "family": "exp",
            "level": "normal"
          },
          {
            "pair_id": 19,
            "function": "3^x",
            "derivative": "3^x \\ln 3",
            "family": "exp",
            "level": "normal"
          },
          {
            "pair_id": 20,
            "function": "\\ln(x)",
            "derivative": "\\frac{1}{x}",
            "family": "log",
            "level": "normal"
          },
          {
            "pair_id": 23,
            "function": "\\arcsin(x)",
            "derivative": "\\frac{1}{\\sqrt{1 - x^2}}",
            "family": "inv_trig",
            "level": "normal"
          },
          {
            "pair_id": 24,
            "function": "\\arccos(x)",
            "derivative": "-\\frac{1}{\\sqrt{1 - x^2}}",
            "family": "inv_trig",
            "level": "normal"
          },
          {
            "pair_id": 25,
            "function": "\\arctan(x)",
            "derivative": "\\frac{1}{1 + x^2}",
            "family": "inv_trig",
            "level": "normal"
          },
          {
            "pair_id": 26,
            "function": "\\text{arccot}(x)",
            "derivative": "-\\frac{1}{1 + x^2}",
            "family": "inv_trig",
            "level": "normal"
          },
          {
            "pair_id": 27,
            "function": "\\tan(x)",
            "derivative": "\\sec^2(x)",
            "family": "trig",
            "level": "hard"
          },
          {
            "pair_id": 28,
            "function": "\\cot(x)",
            "derivative": "-\\csc^2(x)",
            "family": "trig",
            "level": "hard"
          },
          {
            "pair_id": 29,
            "function": "\\sec(x)",
            "derivative": "\\sec(x)\\tan(x)",
            "family": "trig",
            "level": "hard"
          },
          {
            "pair_id": 30,
            "function": "\\csc(x)",
            "derivative": "-\\csc(x)\\cot(x)",
            "family": "trig",
            "level": "hard"
          },
          {
            "pair_id": 31,
            "function": "x^7",
            "derivative": "7x^6",
            "family": "poly",
            "level": "easy"
          },
          {
            "pair_id": 32,
            "function": "e^{-x}",
            "derivative": "-e^{-x}",
            "family": "exp",
            "level": "normal"
          },
          {
            "pair_id": 33,
            "function": "x^{\\frac{3}{2}}",
            "derivative": "\\frac{3}{2}x^{\\frac{1}{2}}",
            "family": "poly",
            "level": "normal"
          },
          {
            "pair_id": 34,
            "function": "5^x",
            "derivative": "5^x \\ln 5",
            "family": "exp",
            "level": "normal"
          }
        ],
        "product": [
          {
            "pair_id": 1,
            "function": "x \\sin(x)",
            "derivative": "\\sin(x) + x \\cos(x)",
            "families": [
              "poly",
              "trig"
            ],
            "level": "easy"
          },
          {
            "pair_id": 2,
            "function": "x \\cos(x)",
            "derivative": "\\cos(x) - x \\sin(x)",
            "families": [
              "poly",
              "trig"
            ],
            "level": "easy"
          },
          {
            "pair_id": 3,
            "function": "x e^x",
            "derivative": "e^x + x e^x",
            "families": [
              "poly",
              "exp"
            ],
            "level": "easy"
          },
          {
            "pair_id": 4,
            "function": "x \\ln(x)",
            "derivative": "\\ln(x) + 1",
            "families": [
              "poly",
              "log"
            ],
            "level": "easy"
          },
          {
            "pair_id": 5,
            "function": "x^2 \\sin(x)",
            "derivative": "2x \\sin(x) + x^2 \\cos(x)",
            "families": [
              "poly",
              "trig"
            ],
            "level": "easy"
          },
          {
            "pair_id": 6,
            "function": "x^2 \\cos(x)",
            "derivative": "2x \\cos(x) - x^2 \\sin(x)",
            "families": [
              "poly",
              "trig"
            ],
            "level": "easy"
          },
          {
            "pair_id": 7,
            "function": "x^2 e^x",
            "derivative": "2x e^x + x^2 e^x",
            "families": [
              "poly",
              "exp"
            ],
            "level": "easy"
          },
          {
            "pair_id": 8,
            "function": "x^2 \\ln(x)",
            "derivative": "2x \\ln(x) + x",
            "families": [
              "poly",
              "log"
            ],
            "level": "easy"
          },
          {
            "pair_id": 9,
            "function": "x \\tan(x)",
            "derivative": "\\tan(x) + x \\sec^2(x)",
            "families": [
              "poly",
              "trig"
            ],
            "level": "easy"
          },
          {
            "pair_id": 10,
            "function": "x \\arctan(x)",
            "derivative": "\\arctan(x) + \\frac{x}{1 + x^2}",
            "families": [
              "poly",
              "inv_trig"
            ],
            "level": "easy"
          },
          {
            "pair_id": 11,
            "function": "e^x \\sin(x)",
            "derivative": "e^x \\sin(x) + e^x \\cos(x)",
            "families": [
              "exp",
              "trig"
            ],
            "level": "normal"
          },
          {
            "pair_id": 12,
            "function": "e^x \\cos(x)",
            "derivative": "e^x \\cos(x) - e^x \\sin(x)",
            "families": [
              "exp",
              "trig"
            ],
            "level": "normal"
          },
          {
            "pair_id": 13,
            "function": "e^x \\ln(x)",
            "derivative": "e^x \\ln(x) + \\frac{e^x}{x}",
            "families": [
              "exp",
              "log"
            ],
            "level": "normal"
          },
          {
            "pair_id": 14,
            "function": "\\sin(x) \\cos(x)",
            "derivative": "\\cos^2(x) - \\sin^2(x)",
            "families": [
              "trig"
            ],
            "level": "normal"
          },
          {
            "pair_id": 15,
            "function": "\\sin(x) \\ln(x)",
            "derivative": "\\frac{\\sin(x)}{x} + \\ln(x) \\cos(x)",
            "families": [
              "trig",
              "log"
            ],
            "level": "normal"
          },
          {
            "pair_id": 16,
            "function": "\\cos(x) \\ln(x)",
            "derivative": "\\frac{\\cos(x)}{x} - \\ln(x) \\sin(x)",
            "families": [
              "trig",
              "log"
            ],
            "level": "normal"
          },
          {
            "pair_id": 17,
            "function": "e^x \\arctan(x)",
            "derivative": "e^x \\arctan(x) + \\frac{e^x}{1 + x^2}",
            "families": [
              "exp",
              "inv_trig"
            ],
            "level": "normal"
          },
          {
            "pair_id": 18,
            "function": "\\sin(x) \\arctan(x)",
            "derivative": "\\cos(x) \\arctan(x) + \\frac{\\sin(x)}{1 + x^2}",
            "families": [
              "trig",
              "inv_trig"
            ],
            "level": "normal"
          },
          {
            "pair_id": 19,
            "function": "\\tan(x) \\ln(x)",
            "derivative": "\\sec^2(x) \\ln(x) + \\frac{\\tan(x)}{x}",
            "families": [
              "trig",
              "log"
            ],
            "level": "hard"
          },
          {
            "pair_id": 20,
            "function": "\\ln(x) \\arctan(x)",
            "derivative": "\\frac{\\arctan(x)}{x} + \\frac{\\ln(x)}{1 + x^2}",
            "families": [
              "log",
              "inv_trig"
            ],
            "level": "hard"
          },
          {
            "pair_id": 21,
            "function": "\\ln(x) \\arcsin(x)",
            "derivative": "\\frac{\\arcsin(x)}{x} + \\frac{\\ln(x)}{\\sqrt{1 - x^2}}",
            "families": [
              "log",
              "inv_trig"
            ],
            "level": "hard"
          },
          {
            "pair_id": 22,
            "function": "\\tan(x) \\arctan(x)",
            "derivative": "\\sec^2(x) \\arctan(x) + \\frac{\\tan(x)}{1 + x^2}",
            "families": [
              "trig",
              "inv_trig"
            ],
            "level": "hard"
          },
          {
            "pair_id": 23,
            "function": "x^3 e^x",
            "derivative": "3x^2 e^x + x^3 e^x",
            "families": [
              "poly",
              "exp"
            ],
            "level": "easy"
          },
          {
            "pair_id": 24,
            "function": "x \\arcsin(x)",
            "derivative": "\\arcsin(x) + \\frac{x}{\\sqrt{1 - x^2}}",
            "families": [
              "poly",
              "inv_trig"
            ],
            "level": "easy"
          },
          {
            "pair_id": 25,
            "function": "e^x \\tan(x)",
            "derivative": "e^x \\tan(x) + e^x \\sec^2(x)",
            "families": [
              "exp",
              "trig"
            ],
            "level": "normal"
          },
          {
            "pair_id": 26,
            "function": "\\cos(x) \\arctan(x)",
            "derivative": "-\\sin(x) \\arctan(x) + \\frac{\\cos(x)}{1 + x^2}",
            "families": [
              "trig",
              "inv_trig"
            ],
            "level": "normal"
          }
        ],
        "quotient": [
          {
            "pair_id": 1,
            "function": "\\frac{\\sin(x)}{x}",
            "derivative": "\\frac{\\cos(x) \\cdot x - \\sin(x)}{x^2}",
            "families": [
              "trig",
              "poly"
            ],
            "level": "easy"
          },
          {
            "pair_id": 2,
            "function": "\\frac{\\cos(x)}{x}",
            "derivative": "\\frac{-\\sin(x) \\cdot x - \\cos(x)}{x^2}",
            "families": [
              "trig",
              "poly"
            ],
            "level": "easy"
          },
          {
            "pair_id": 3,
            "function": "\\frac{e^x}{x}",
            "derivative": "\\frac{e^x \\cdot x - e^x}{x^2}",
            "families": [
              "exp",
              "poly"
            ],
            "level": "easy"
          },
          {
            "pair_id": 4,
            "function": "\\frac{\\ln(x)}{x}",
            "derivative": "\\frac{1 - \\ln(x)}{x^2}",
            "families": [
              "log",
              "poly"
            ],
            "level": "easy"
          },
          {
            "pair_id": 5,
            "function": "\\frac{\\sin(x)}{x^2}",
            "derivative": "\\frac{\\cos(x) \\cdot x - 2 \\sin(x)}{x^3}",
            "families": [
              "trig",
              "poly"
            ],
            "level": "easy"
          },
          {
            "pair_id": 6,
            "function": "\\frac{\\cos(x)}{x^2}",
            "derivative": "\\frac{-\\sin(x) \\cdot x - 2 \\cos(x)}{x^3}",
            "families": [
              "trig",
              "poly"
            ],
            "level": "easy"
          },
          {
            "pair_id": 7,
            "function": "\\frac{\\ln(x)}{x^2}",
            "derivative": "\\frac{1 - 2 \\ln(x)}{x^3}",
            "families": [
              "log",
              "poly"
            ],
            "level": "easy"
          },
          {
            "pair_id": 8,
            "function": "\\frac{x}{x + 1}",
            "derivative": "\\frac{1}{(x + 1)^2}",
            "families": [
              "poly"
            ],
            "level": "easy"
          },
          {
            "pair_id": 9,
            "function": "\\frac{x}{e^x}",
            "derivative": "\\frac{e^x - x e^x}{e^{2x}}",
            "families": [
              "poly",
              "exp"
            ],
            "level": "normal"
          },
          {
            "pair_id": 10,
            "function": "\\frac{x^2}{e^x}",
            "derivative": "\\frac{2x e^x - x^2 e^x}{e^{2x}}",
            "families": [
              "poly",
              "exp"
            ],
            "level": "normal"
          },
          {
            "pair_id": 11,
            "function": "\\frac{x}{\\sin(x)}",
            "derivative": "\\frac{\\sin(x) - x \\cos(x)}{\\sin^2(x)}",
            "families": [
              "poly",
              "trig"
            ],
            "level": "normal"
          },
          {
            "pair_id": 12,
            "function": "\\frac{x}{\\cos(x)}",
            "derivative": "\\frac{\\cos(x) + x \\sin(x)}{\\cos^2(x)}",
            "families": [
              "poly",
              "trig"
            ],
            "level": "normal"
          },
          {
            "pair_id": 13,
            "function": "\\frac{e^x}{\\sin(x)}",
            "derivative": "\\frac{e^x \\sin(x) - e^x \\cos(x)}{\\sin^2(x)}",
            "families": [
              "exp",
              "trig"
            ],
            "level": "normal"
          },
          {
            "pair_id": 14,
            "function": "\\frac{e^x}{\\cos(x)}",
            "derivative": "\\frac{e^x \\cos(x) + e^x \\sin(x)}{\\cos^2(x)}",
            "families": [
              "exp",
              "trig"
            ],
            "level": "normal"
          },
          {
            "pair_id": 15,
            "function": "\\frac{x^2}{\\sin(x)}",
            "derivative": "\\frac{2x \\sin(x) - x^2 \\cos(x)}{\\sin^2(x)}",
            "families": [
              "poly",
              "trig"
            ],
            "level": "normal"
          },
          {
            "pair_id": 16,
            "function": "\\frac{x^2}{\\cos(x)}",
            "derivative": "\\frac{2x \\cos(x) + x^2 \\sin(x)}{\\cos^2(x)}",
            "families": [
              "poly",
              "trig"
            ],
            "level": "normal"
          },
          {
            "pair_id": 17,
            "function": "\\frac{\\sin(x)}{e^x}",
            "derivative": "\\frac{\\cos(x) e^x - \\sin(x) e^x}{e^{2x}}",
            "families": [
              "trig",
              "exp"
            ],
            "level": "normal"
          },
          {
            "pair_id": 18,
            "function": "\\frac{\\cos(x)}{e^x}",
            "derivative": "\\frac{-\\sin(x) e^x - \\cos(x) e^x}{e^{2x}}",
            "families": [
              "trig",
              "exp"
            ],
            "level": "normal"
          },
          {
            "pair_id": 19,
            "function": "\\frac{\\ln(x)}{e^x}",
            "derivative": "\\frac{\\frac{e^x}{x} - e^x \\ln(x)}{e^{2x}}",
            "families": [
              "log",
              "exp"
            ],
            "level": "normal"
          },
          {
            "pair_id": 20,
            "function": "\\frac{x}{\\ln(x)}",
            "derivative": "\\frac{\\ln(x) - 1}{(\\ln(x))^2}",
            "families": [
              "poly",
              "log"
            ],
            "level": "hard"
          },
          {
            "pair_id": 21,
            "function": "\\frac{x^2}{\\ln(x)}",
            "derivative": "\\frac{2x \\ln(x) - x}{(\\ln(x))^2}",
            "families": [
              "poly",
              "log"
            ],
            "level": "hard"
          },
          {
            "pair_id": 22,
            "function": "\\frac{e^x}{\\ln(x)}",
            "derivative": "\\frac{e^x \\ln(x) - \\frac{e^x}{x}}{(\\ln(x))^2}",
            "families": [
              "exp",
              "log"
            ],
            "level": "hard"
          },
          {
            "pair_id": 23,
            "function": "\\frac{\\sin(x)}{\\ln(x)}",
            "derivative": "\\frac{\\cos(x) \\ln(x) - \\frac{\\sin(x)}{x}}{(\\ln(x))^2}",
            "families": [
              "trig",
              "log"
            ],
            "level": "hard"
          },
          {
            "pair_id": 24,
            "function": "\\frac{\\cos(x)}{\\ln(x)}",
            "derivative": "\\frac{-\\sin(x) \\ln(x) - \\frac{\\cos(x)}{x}}{(\\ln(x))^2}",
            "families": [
              "trig",
              "log"
            ],
            "level": "hard"
          },
          {
            "pair_id": 25,
            "function": "\\frac{x}{\\tan(x)}",
            "derivative": "\\frac{\\tan(x) - x \\sec^2(x)}{\\tan^2(x)}",
            "families": [
              "poly",
              "trig"
            ],
            "level": "hard"
          },
          {
            "pair_id": 26,
            "function": "\\frac{e^x}{\\tan(x)}",
            "derivative": "\\frac{e^x \\tan(x) - e^x \\sec^2(x)}{\\tan^2(x)}",
            "families": [
              "exp",
              "trig"
            ],
            "level": "hard"
          },
          {
            "pair_id": 27,
            "function": "\\frac{x}{\\sec(x)}",
            "derivative": "\\frac{\\sec(x) - x \\sec(x)\\tan(x)}{\\sec^2(x)}",
            "families": [
              "poly",
              "trig"
            ],
            "level": "hard"
          },
          {
            "pair_id": 28,
            "function": "\\frac{\\tan(x)}{x}",
            "derivative": "\\frac{x \\sec^2(x) - \\tan(x)}{x^2}",
            "families": [
              "trig",
              "poly"
            ],
            "level": "easy"
          },
          {
            "pair_id": 29,
            "function": "\\frac{x}{x^2 + 1}",
            "derivative": "\\frac{1 - x^2}{(x^2 + 1)^2}",
            "families": [
              "poly"
            ],
            "level": "easy"
          },
          {
            "pair_id": 30,
            "function": "\\frac{\\arctan(x)}{x}",
            "derivative": "\\frac{\\frac{x}{1 + x^2} - \\arctan(x)}{x^2}",
            "families": [
              "inv_trig",
              "poly"
            ],
            "level": "easy"
          },
          {
            "pair_id": 31,
            "function": "\\frac{\\ln(x)}{\\sin(x)}",
            "derivative": "\\frac{\\frac{\\sin(x)}{x} - \\ln(x) \\cos(x)}{\\sin^2(x)}",
            "families": [
              "log",
              "trig"
            ],
            "level": "hard"
          }
        ],
        "chain": [
          {
            "pair_id": 1,
            "function": "\\sin(\\cos(x))",
            "factors": [
              "\\cos(\\cos(x))",
              "-\\sin(x)"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 2,
            "function": "\\ln(\\tan(x))",
            "factors": [
              "\\frac{1}{\\tan(x)}",
              "\\sec^2(x)"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 3,
            "function": "e^{\\sec(x)}",
            "factors": [
              "e^{\\sec(x)}",
              "\\sec(x)\\tan(x)"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 4,
            "function": "\\cos(\\ln(x))",
            "factors": [
              "-\\sin(\\ln(x))",
              "\\frac{1}{x}"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 5,
            "function": "\\tan(\\sqrt{x})",
            "factors": [
              "\\sec^2(\\sqrt{x})",
              "\\frac{1}{2\\sqrt{x}}"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 6,
            "function": "\\sin(e^x)",
            "factors": [
              "\\cos(e^x)",
              "e^x"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 7,
            "function": "e^{\\sin(x)}",
            "factors": [
              "e^{\\sin(x)}",
              "\\cos(x)"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 8,
            "function": "\\sqrt{\\ln(x)}",
            "factors": [
              "\\frac{1}{2\\sqrt{\\ln(x)}}",
              "\\frac{1}{x}"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 9,
            "function": "\\ln(\\cos(x))",
            "factors": [
              "\\frac{1}{\\cos(x)}",
              "-\\sin(x)"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 10,
            "function": "\\cos(\\sqrt{x})",
            "factors": [
              "-\\sin(\\sqrt{x})",
              "\\frac{1}{2\\sqrt{x}}"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 11,
            "function": "\\sin(\\ln(x))",
            "factors": [
              "\\cos(\\ln(x))",
              "\\frac{1}{x}"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 12,
            "function": "\\arctan(\\sin(x))",
            "factors": [
              "\\frac{1}{1 + \\sin^2(x)}",
              "\\cos(x)"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 13,
            "function": "\\ln(\\sin(x))",
            "factors": [
              "\\frac{1}{\\sin(x)}",
              "\\cos(x)"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 14,
            "function": "(x^2 + 1)^5",
            "factors": [
              "5(x^2 + 1)^4",
              "2x"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 15,
            "function": "e^{\\cos(x)}",
            "factors": [
              "e^{\\cos(x)}",
              "-\\sin(x)"
            ],
            "expected_parts": 3
          },
          {
            "pair_id": 16,
            "function": "\\sqrt{x^2 + 1}",
            "factors": [
              "\\frac{1}{2\\sqrt{x^2 + 1}}",
              "2x"
            ],
            "expected_parts": 3
          }
        ]
      },
      "integra": {
        "easy": [
          {
            "pair_id": 1,
            "function": "x^2",
            "antiderivative": "\\frac{x^3}{3}",
            "family": "poly",
            "level": "normal"
          },
          {
            "pair_id": 2,
            "function": "x^3",
            "antiderivative": "\\frac{x^4}{4}",
            "family": "poly",
            "level": "normal"
          },
          {
            "pair_id": 3,
            "function": "x^4",
            "antiderivative": "\\frac{x^5}{5}",
            "family": "poly",
            "level": "normal"
          },
          {
            "pair_id": 4,
            "function": "x",
            "antiderivative": "\\frac{x^2}{2}",
            "family": "poly",
            "level": "normal"
          },
          {
            "pair_id": 5,
            "function": "\\sin(x)",
            "antiderivative": "-\\cos(x)",
            "family": "trig",
            "level": "easy"
          },
          {
            "pair_id": 6,
            "function": "\\cos(x)",
            "antiderivative": "\\sin(x)",
            "family": "trig",
            "level": "easy"
          },
          {
            "pair_id": 7,
            "function": "\\sec^2(x)",
            "antiderivative": "\\tan(x)",
            "family": "trig",
            "level": "easy"
          },
          {
            "pair_id": 8,
            "function": "\\frac{1}{x}",
            "antiderivative": "\\ln|x|",
            "family": "log",
            "level": "normal"
          },
          {
            "pair_id": 9,
            "function": "e^x",
            "antiderivative": "e^x",
            "family": "exp",
            "level": "easy"
          },
          {
            "pair_id": 10,
            "function": "e^{2x}",
            "antiderivative": "\\frac{e^{2x}}{2}",
            "family": "exp",
            "level": "normal"
          },
          {
            "pair_id": 11,
            "function": "2x",
            "antiderivative": "x^2",
            "family": "poly",
            "level": "easy"
          },
          {
            "pair_id": 12,
            "function": "3x^2",
            "antiderivative": "x^3",
            "family": "poly",
            "level": "easy"
          },
          {
            "pair_id": 13,
            "function": "\\frac{1}{1 + x^2}",
            "antiderivative": "\\arctan(x)",
            "family": "inv_trig",
            "level": "normal"
          },
          {
            "pair_id": 14,
            "function": "\\csc^2(x)",
            "antiderivative": "-\\cot(x)",
            "family": "trig",
            "level": "easy"
          },
          {
            "pair_id": 15,
            "function": "\\frac{1}{\\sqrt{1 - x^2}}",
            "antiderivative": "\\arcsin(x)",
            "family": "inv_trig",
            "level": "normal"
          },
          {
            "pair_id": 16,
            "function": "4x^3",
            "antiderivative": "x^4",
            "family": "poly",
            "level": "easy"
          },
          {
            "pair_id": 17,
            "function": "5x^4",
            "antiderivative": "x^5",
            "family": "poly",
            "level": "easy"
          },
          {
            "pair_id": 18,
            "function": "6x^5",
            "antiderivative": "x^6",
            "family": "poly",
            "level": "easy"
          },
          {
            "pair_id": 19,
            "function": "\\sec(x)\\tan(x)",
            "antiderivative": "\\sec(x)",
            "family": "trig",
            "level": "easy"
          },
          {
            "pair_id": 20,
            "function": "\\frac{1}{2\\sqrt{x}}",
            "antiderivative": "\\sqrt{x}",
            "family": "poly",
            "level": "normal"
          },
          {
            "pair_id": 21,
            "function": "e^{3x}",
            "antiderivative": "\\frac{e^{3x}}{3}",
            "family": "exp",
            "level": "normal"
          }
        ],
        "normal": [
          {
            "pair_id": 1,
            "preusub": "2x e^{x^2}",
            "usub": "u = x^2",
            "postusub": "\\int e^u\\,du",
            "expected_parts": 3
          },
          {
            "pair_id": 2,
            "preusub": "3x^2 e^{x^3}",
            "usub": "u = x^3",
            "postusub": "\\int e^u\\,du",
            "expected_parts": 3
          },
          {
            "pair_id": 3,
            "preusub": "\\sec^2(x) \\tan(x)",
            "usub": "u = \\tan(x)",
            "postusub": "\\int u\\,du",
            "expected_parts": 3
          },
          {
            "pair_id": 4,
            "preusub": "\\frac{\\ln(x)}{x}",
            "usub": "u = \\ln(x)",
            "postusub": "\\int u\\,du",
            "expected_parts": 3
          },
          {
            "pair_id": 5,
            "preusub": "\\frac{2x}{x^2 + 1}",
            "usub": "u = x^2 + 1",
            "postusub": "\\int \\frac{1}{u}\\,du",
            "expected_parts": 3
          },
          {
            "pair_id": 6,
            "preusub": "\\sin(x) \\cos(x)",
            "usub": "u = \\sin(x)",
            "postusub": "\\int u\\,du",
            "expected_parts": 3
          },
          {
            "pair_id": 7,
            "preusub": "\\cos(x) e^{\\sin(x)}",
            "usub": "u = \\sin(x)",
            "postusub": "\\int e^u\\,du",
            "expected_parts": 3
          },
          {
            "pair_id": 8,
            "preusub": "\\frac{1}{x \\ln(x)}",
            "usub": "u = \\ln(x)",
            "postusub": "\\int \\frac{1}{u}\\,du",
            "expected_parts": 3
          },
          {
            "pair_id": 9,
            "preusub": "2x (x^2 + 1)^3",
            "usub": "u = x^2 + 1",
            "postusub": "\\int u^3\\,du",
            "expected_parts": 3
          },
          {
            "pair_id": 10,
            "preusub": "\\frac{x}{\\sqrt{x^2 + 1}}",
            "usub": "u = x^2 + 1",
            "postusub": "\\int \\frac{1}{2\\sqrt{u}}\\,du",
            "expected_parts": 3
          },
          {
            "pair_id": 11,
            "preusub": "\\cos(x) \\sin^2(x)",
            "usub": "u = \\sin(x)",
            "postusub": "\\int u^2\\,du",
            "expected_parts": 3
          },
          {
            "pair_id": 12,
            "preusub": "\\frac{e^x}{1 + e^x}",
            "usub": "u = 1 + e^x",
            "postusub": "\\int \\frac{1}{u}\\,du",
            "expected_parts": 3
          }
        ],
        "hard": [
          {
            "pair_id": 1,
            "uvp": "x \\sin(x)",
            "uv": "-x \\cos(x)",
            "vup": "-\\cos(x)",
            "expected_parts": 3
          },
          {
            "pair_id": 2,
            "uvp": "x e^x",
            "uv": "x e^x",
            "vup": "e^x",
            "expected_parts": 3
          },
          {
            "pair_id": 3,
            "uvp": "x \\cos(x)",
            "uv": "x \\sin(x)",
            "vup": "\\sin(x)",
            "expected_parts": 3
          },
          {
            "pair_id": 4,
            "uvp": "\\ln(x)",
            "uv": "x \\ln(x)",
            "vup": "1",
            "expected_parts": 3
          },
          {
            "pair_id": 5,
            "uvp": "x \\ln(x)",
            "uv": "\\frac{x^2}{2} \\ln(x)",
            "vup": "\\frac{x}{2}",
            "expected_parts": 3
          },
          {
            "pair_id": 6,
            "uvp": "x^2 \\ln(x)",
            "uv": "\\frac{x^3}{3} \\ln(x)",
            "vup": "\\frac{x^2}{3}",
            "expected_parts": 3
          },
          {
            "pair_id": 7,
            "uvp": "\\arcsin(x)",
            "uv": "x \\arcsin(x)",
            "vup": "\\frac{x}{\\sqrt{1 - x^2}}",
            "expected_parts": 3
          },
          {
            "pair_id": 8,
            "uvp": "x \\sec^2(x)",
            "uv": "x \\tan(x)",
            "vup": "\\tan(x)",
            "expected_parts": 3
          },
          {
            "pair_id": 9,
            "uvp": "e^x \\sin(x)",
            "uv": "e^x \\sin(x)",
            "vup": "e^x \\cos(x)",
            "expected_parts": 3
          },
          {
            "pair_id": 10,
            "uvp": "x \\arctan(x)",
            "uv": "\\frac{x^2}{2} \\arctan(x)",
            "vup": "\\frac{x^2}{2(1 + x^2)}",
            "expected_parts": 3
          }
        ]
      }
    };

    var LEVEL_ORDER = { easy: 1, normal: 2, hard: 3 };

    // --- RNG helpers: equivalents of Python random.shuffle / random.sample ---
    function shuffle(arr) {
        // Fisher-Yates, in place.
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    }

    function sample(arr, n) {
        // random.sample(arr, n): n distinct items, order randomized.
        var copy = arr.slice();
        shuffle(copy);
        return copy.slice(0, n);
    }

    function sortNums(arr) {
        return arr.slice().sort(function (a, b) { return a - b; });
    }

    // ============================================================
    // DERIVA  (ports deriva_generator.py)
    // ============================================================

    // _filter_pairs: custom families (overrides difficulty) or a cumulative
    // easy/normal/hard preset. familyKey is 'family' (single str) for basic pairs
    // or 'families' (list) for product/quotient pairs.
    function derivaFilterPairs(pairs, difficulty, families, familyKey) {
        if (families && families.length) {
            var fam = Object.create(null);
            families.forEach(function (f) { fam[f] = true; });
            if (familyKey === 'family') {
                return pairs.filter(function (p) { return !!fam[p.family]; });
            }
            // set(p.families) <= fam  (subset test)
            return pairs.filter(function (p) {
                return p.families.every(function (f) { return !!fam[f]; });
            });
        }
        if (LEVEL_ORDER[difficulty]) {
            var maxLevel = LEVEL_ORDER[difficulty];
            return pairs.filter(function (p) { return LEVEL_ORDER[p.level] <= maxLevel; });
        }
        return pairs.slice();
    }

    // _sample_balanced: spread n pairs as evenly as possible across families so no
    // single family dominates the board (deriva basic only).
    function derivaSampleBalanced(pairs, n, familyKey) {
        var groups = Object.create(null);
        var order = [];   // preserve first-seen key order (Python defaultdict/keys)
        pairs.forEach(function (p) {
            var key = familyKey === 'family'
                ? p.family
                : p.families.slice().sort().join(' ');
            if (!(key in groups)) { groups[key] = []; order.push(key); }
            groups[key].push(p);
        });
        order.forEach(function (k) { shuffle(groups[k]); });

        var keys = order.slice();
        shuffle(keys);
        var result = [];
        var progressed = true;
        while (result.length < n && progressed) {
            progressed = false;
            for (var i = 0; i < keys.length; i++) {
                var arr = groups[keys[i]];
                if (arr.length) {
                    result.push(arr.pop());
                    progressed = true;
                    if (result.length >= n) break;
                }
            }
        }
        return result;
    }

    // _merge_ids: merge ids across blocks with identical text. See the Python
    // docstring — role_separated=false makes duplicate texts fully interchangeable
    // (one-to-one modes); true keeps function/factor blocks distinct (chain mode).
    function derivaMergeIds(blocks, roleSeparated) {
        var toFunc = Object.create(null);
        var toFactor = Object.create(null);
        blocks.forEach(function (b) {
            if (!(b.text in toFunc)) { toFunc[b.text] = []; toFactor[b.text] = []; }
            b.function_id.forEach(function (id) {
                if (toFunc[b.text].indexOf(id) === -1) toFunc[b.text].push(id);
            });
            b.factor_id.forEach(function (id) {
                if (toFactor[b.text].indexOf(id) === -1) toFactor[b.text].push(id);
            });
        });
        blocks.forEach(function (b) {
            if (!roleSeparated) {
                b.function_id = sortNums(toFunc[b.text]);
                b.factor_id = sortNums(toFactor[b.text]);
            } else if (b.type === 'function') {
                b.function_id = sortNums(toFunc[b.text]);
                b.factor_id = [];
            } else {
                b.function_id = [];
                b.factor_id = sortNums(toFactor[b.text]);
            }
        });
    }

    function derivaBuildOneToOne(pairs, expectedParts) {
        var blocks = [];
        pairs.forEach(function (pair) {
            blocks.push({
                function_id: [pair.pair_id],
                factor_id: [],
                text: pair.function,
                type: 'function',
                expected_parts: expectedParts
            });
        });

        var textToIds = Object.create(null);
        var order = [];
        pairs.forEach(function (pair) {
            var t = pair.derivative;
            if (!(t in textToIds)) { textToIds[t] = []; order.push(t); }
            textToIds[t].push(pair.pair_id);
        });
        order.forEach(function (t) {
            var pids = textToIds[t];
            for (var i = 0; i < pids.length; i++) {
                blocks.push({
                    function_id: [],
                    factor_id: pids.slice(),
                    text: t,
                    type: 'derivative',
                    expected_parts: expectedParts
                });
            }
        });

        derivaMergeIds(blocks, false);
        shuffle(blocks);
        return { blocks: blocks, operators: [] };
    }

    function derivaBuildChain(chainPairs) {
        var remaining = chainPairs.slice();
        shuffle(remaining);

        var selected = [];
        var total = 0;
        for (var i = 0; i < remaining.length; i++) {
            var p = remaining[i];
            var pairTotal = 1 + p.factors.length;
            if (total + pairTotal > 18) continue;
            selected.push(p);
            total += pairTotal;
            if (total >= 18) break;
        }

        var blocks = [];
        selected.forEach(function (p) {
            blocks.push({
                function_id: [p.pair_id],
                factor_id: [],
                text: p.function,
                type: 'function',
                expected_parts: p.expected_parts
            });
        });

        var textToIds = Object.create(null);
        var order = [];
        selected.forEach(function (p) {
            p.factors.forEach(function (f) {
                if (!(f in textToIds)) { textToIds[f] = []; order.push(f); }
                textToIds[f].push(p.pair_id);
            });
        });
        order.forEach(function (t) {
            var pids = textToIds[t];
            for (var k = 0; k < pids.length; k++) {
                blocks.push({
                    function_id: [],
                    factor_id: pids.slice(),
                    text: t,
                    type: 'derivative',
                    expected_parts: 3
                });
            }
        });

        derivaMergeIds(blocks, true);
        shuffle(blocks);
        return { blocks: blocks, operators: [] };
    }

    function generateDeriva(mode, difficulty, families) {
        var D = CALCMATCH_DATA.deriva;
        if (mode === 'basic') {
            var pool = derivaFilterPairs(D.basic, difficulty, families, 'family');
            if (!pool.length) pool = D.basic;
            var selected = derivaSampleBalanced(pool, Math.min(9, pool.length), 'family');
            return derivaBuildOneToOne(selected, 2);
        }
        if (mode === 'product' || mode === 'quotient') {
            var source = mode === 'product' ? D.product : D.quotient;
            var pool2 = derivaFilterPairs(source, difficulty, families, 'families');
            if (!pool2.length) pool2 = source;
            var selected2 = sample(pool2, Math.min(9, pool2.length));
            return derivaBuildOneToOne(selected2, 2);
        }
        if (mode === 'chain') {
            return derivaBuildChain(D.chain);
        }
        return { blocks: [], operators: [] };
    }

    // ============================================================
    // INTEGRA  (ports integra_generator.py)
    // ============================================================

    function integraFilterPairs(pairs, difficulty, families) {
        if (families && families.length) {
            var fam = Object.create(null);
            families.forEach(function (f) { fam[f] = true; });
            return pairs.filter(function (p) { return !!fam[p.family]; });
        }
        if (LEVEL_ORDER[difficulty]) {
            var maxLevel = LEVEL_ORDER[difficulty];
            return pairs.filter(function (p) { return LEVEL_ORDER[p.level] <= maxLevel; });
        }
        return pairs.slice();
    }

    // Generic final merge: for every block, replace each id list with the union of
    // that id-role's ids across all blocks sharing the same text (sorted).
    function mergeAllIds(blocks, keys) {
        var maps = {};
        keys.forEach(function (k) { maps[k] = Object.create(null); });
        blocks.forEach(function (b) {
            keys.forEach(function (k) {
                var m = maps[k];
                if (!(b.text in m)) m[b.text] = [];
                b[k].forEach(function (id) {
                    if (m[b.text].indexOf(id) === -1) m[b.text].push(id);
                });
            });
        });
        blocks.forEach(function (b) {
            keys.forEach(function (k) { b[k] = sortNums(maps[k][b.text]); });
        });
    }

    function integraBuildEasy(pairs) {
        var keys = ['func_id', 'int_id'];
        var blocks = [];
        pairs.forEach(function (pair) {
            blocks.push({
                func_id: [pair.pair_id], int_id: [],
                text: pair.function, type: 'function', expected_parts: 2
            });
        });

        var textToIds = Object.create(null);
        var order = [];
        pairs.forEach(function (pair) {
            var t = pair.antiderivative;
            if (!(t in textToIds)) { textToIds[t] = []; order.push(t); }
            textToIds[t].push(pair.pair_id);
        });
        order.forEach(function (t) {
            var pids = textToIds[t];
            for (var i = 0; i < pids.length; i++) {
                blocks.push({
                    func_id: [], int_id: pids.slice(),
                    text: t, type: 'antiderivative', expected_parts: 2
                });
            }
        });

        // Easy mode merges both roles across identical text (like role_separated=false).
        var toFunc = Object.create(null), toInt = Object.create(null);
        blocks.forEach(function (b) {
            if (!(b.text in toFunc)) { toFunc[b.text] = []; toInt[b.text] = []; }
            b.func_id.forEach(function (id) { if (toFunc[b.text].indexOf(id) === -1) toFunc[b.text].push(id); });
            b.int_id.forEach(function (id) { if (toInt[b.text].indexOf(id) === -1) toInt[b.text].push(id); });
        });
        blocks.forEach(function (b) {
            b.func_id = sortNums(toFunc[b.text]);
            b.int_id = sortNums(toInt[b.text]);
        });

        shuffle(blocks);
        return { blocks: blocks, operators: [] };
    }

    function packThrees(pairs) {
        // normal/hard: shuffle then pack 3-block groups to an 18-block budget.
        var remaining = pairs.slice();
        shuffle(remaining);
        var selected = [];
        var total = 0;
        for (var i = 0; i < remaining.length; i++) {
            if (total + 3 > 18) continue;
            selected.push(remaining[i]);
            total += 3;
            if (total >= 18) break;
        }
        return selected;
    }

    function integraBuildNormal(pairs) {
        var keys = ['preusub_id', 'usub_id', 'postusub_id'];
        var blocks = [];

        pairs.forEach(function (p) {
            blocks.push({
                preusub_id: [p.pair_id], usub_id: [], postusub_id: [],
                text: '\\int ' + p.preusub + '\\,dx',
                type: 'function', expected_parts: p.expected_parts
            });
        });

        addRoleBlocks(blocks, pairs, function (p) { return p.usub; }, 'usub_id', keys);
        addRoleBlocks(blocks, pairs, function (p) { return p.postusub; }, 'postusub_id', keys);

        mergeAllIds(blocks, keys);
        shuffle(blocks);
        return { blocks: blocks, operators: [] };
    }

    function integraBuildHard(pairs) {
        var keys = ['uvp_id', 'uv_id', 'vup_id'];
        var blocks = [];

        pairs.forEach(function (p) {
            blocks.push({
                uvp_id: [p.pair_id], uv_id: [], vup_id: [],
                text: '\\int ' + p.uvp + '\\,dx',
                type: 'function', expected_parts: p.expected_parts
            });
        });

        addRoleBlocks(blocks, pairs, function (p) { return p.uv; }, 'uv_id', keys);
        // vup blocks: grouped by the RAW vup text, but displayed wrapped in \int ..\,dx
        // (matches Python _build_hard_mode exactly).
        addRoleBlocks(blocks, pairs, function (p) { return p.vup; }, 'vup_id', keys,
            function (rawText) { return '\\int ' + rawText + '\\,dx'; });

        mergeAllIds(blocks, keys);
        shuffle(blocks);
        return { blocks: blocks, operators: [] };
    }

    // Append answer blocks for one id-role. Group by rawText(p); the block's displayed
    // text is wrap(rawText) (identity by default). Every id key in `keys` is present
    // (empty except idKey), matching the Python block dicts.
    function addRoleBlocks(blocks, pairs, rawText, idKey, keys, wrap) {
        wrap = wrap || function (t) { return t; };
        var textToIds = Object.create(null);
        var order = [];
        pairs.forEach(function (p) {
            var t = rawText(p);
            if (!(t in textToIds)) { textToIds[t] = []; order.push(t); }
            textToIds[t].push(p.pair_id);
        });
        order.forEach(function (t) {
            var pids = textToIds[t];
            for (var i = 0; i < pids.length; i++) {
                var block = { text: wrap(t), type: 'antiderivative', expected_parts: 3 };
                keys.forEach(function (k) { block[k] = []; });
                block[idKey] = pids.slice();
                blocks.push(block);
            }
        });
    }

    function generateIntegra(mode, difficulty, families) {
        var I = CALCMATCH_DATA.integra;
        if (mode === 'easy') {
            var pool = integraFilterPairs(I.easy, difficulty, families);
            if (!pool.length) pool = I.easy;
            var selected = sample(pool, Math.min(10, pool.length));
            return integraBuildEasy(selected);
        }
        if (mode === 'normal') {
            return integraBuildNormal(packThrees(I.normal));
        }
        if (mode === 'hard') {
            return integraBuildHard(packThrees(I.hard));
        }
        return { blocks: [], operators: [] };
    }

    // ============================================================
    // Public dispatcher (ports level_generator.generate_level)
    // ============================================================
    function generateLevel(game, mode, difficulty, families) {
        if (game === 'deriva') return generateDeriva(mode, difficulty, families);
        if (game === 'integra') return generateIntegra(mode, difficulty, families);
        return { blocks: [], operators: [] };
    }

    global.generateLevel = generateLevel;
    // Also expose for Node-based verification (module.exports when available).
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { generateLevel: generateLevel, CALCMATCH_DATA: CALCMATCH_DATA };
    }
})(typeof window !== 'undefined' ? window : this);
