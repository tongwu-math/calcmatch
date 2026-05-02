from flask import Flask, request, jsonify, send_from_directory
from level_generator import generate_level
import os
import math
import random

app = Flask(__name__, static_folder='../frontend')

@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('../frontend', filename)

@app.route('/api/get_level_data', methods=['GET'])
def get_level_data():
    mode = request.args.get('mode', 'easy')
    level_data = generate_level(mode)
    return jsonify(level_data)

@app.route('/api/validate_hard_mode', methods=['POST'])
def validate_hard_mode():
    data = request.get_json()
    target_function_id = data.get('target_id')
    user_latex = data.get('user_string', '').strip()

    # Correct derivatives for hard mode (pair_ids 100-110)
    correct_derivatives = {
        100: "cos(2*x)*2",
        101: "exp(3*x)*3",
        102: "4/(4*x+1)",
        103: "sec(2*x)**2*2",
        104: "sin(x)+x*cos(x)",
        105: "exp(x)+x*exp(x)",
        106: "2*x*log(x)+x",
        107: "(x*cos(x)-sin(x))/(x**2)",
        108: "1/((x+1)**2)",
        109: "cos(x)/(2*sqrt(sin(x)))",
        110: "2*x*exp(x**2)",
    }

    if target_function_id not in correct_derivatives:
        return jsonify({"valid": False, "message": "Invalid target function"}), 400

    correct_expr = correct_derivatives[target_function_id]

    # Convert user LaTeX to Python expression
    user_expr = latex_to_python(user_latex)

    x = random.uniform(1.5, 4.5)

    try:
        correct_val = safe_eval(correct_expr, x)
        user_val = safe_eval(user_expr, x)

        if abs(correct_val - user_val) < 0.01:
            return jsonify({
                "valid": True,
                "message": "Correct!",
                "x": x,
                "correct": correct_val,
                "user": user_val
            })
        else:
            return jsonify({
                "valid": False,
                "message": "Incorrect",
                "x": x,
                "correct": correct_val,
                "user": user_val
            })
    except Exception as e:
        return jsonify({
            "valid": False,
            "message": f"Evaluation error: {str(e)}",
            "x": x,
            "correct": 0,
            "user": 0
        })


def latex_to_python(latex):
    """Convert LaTeX math string to Python-evaluable expression"""
    import re
    s = latex.strip()

    # Remove \left \right
    s = s.replace('\\left(', '(').replace('\\right)', ')')

    # \frac{A}{B} -> ((A)/(B))
    while '\\frac{' in s:
        start = s.index('\\frac{')
        # find matching braces for numerator
        depth = 0
        i = start + 6  # skip \frac{
        num_start = i
        while i < len(s):
            if s[i] == '{': depth += 1
            elif s[i] == '}':
                if depth == 0: break
                depth -= 1
            i += 1
        num_end = i
        # skip }{
        denom_start = i + 2
        depth = 0
        j = denom_start
        while j < len(s):
            if s[j] == '{': depth += 1
            elif s[j] == '}':
                if depth == 0: break
                depth -= 1
            j += 1
        denom_end = j
        numerator = s[num_start:num_end]
        denominator = s[denom_start:denom_end]
        s = s[:start] + '((' + numerator + ')/(' + denominator + '))' + s[denom_end + 1:]

    # \sqrt{expr} -> sqrt(expr)
    while '\\sqrt{' in s:
        start = s.index('\\sqrt{')
        depth = 0
        i = start + 6
        expr_start = i
        while i < len(s):
            if s[i] == '{': depth += 1
            elif s[i] == '}':
                if depth == 0: break
                depth -= 1
            i += 1
        inner = s[expr_start:i]
        s = s[:start] + 'sqrt(' + inner + ')' + s[i + 1:]
    s = s.replace('\\sqrt', 'sqrt')

    # Remove remaining braces
    s = s.replace('{', '').replace('}', '')

    # Replace LaTeX commands FIRST (before ^ -> **)
    s = s.replace('\\cdot', '*').replace('\\times', '*')
    s = s.replace('\\arcsin', 'arcsin').replace('\\arctan', 'arctan')
    s = s.replace('\\sin', 'sin').replace('\\cos', 'cos').replace('\\tan', 'tan')
    s = s.replace('\\sec', 'sec').replace('\\csc', 'csc').replace('\\cot', 'cot')
    s = s.replace('\\ln', 'log')

    # Handle func^n(...) -> (func(...))**n  e.g. sec^2(x) -> (sec(x))**2
    # Must happen BEFORE ^ -> **
    func_pow = re.compile(r'(sec|csc|cot|sin|cos|tan|log|sqrt|exp|arcsin|arctan)\^(\d+)')
    s = func_pow.sub(r'_FP_\1_\2_', s)

    s = s.replace('^', '**')

    # Implicit multiplication: digit*letter, digit*(, )*(
    s = re.sub(r'(\d)([a-zA-Z])', r'\1*\2', s)
    s = re.sub(r'(\d)(\()', r'\1*\2', s)
    s = re.sub(r'\)\s*\(', ')*(', s)
    s = re.sub(r'\)\s*([a-zA-Z])', r')*\1', s)

    # Fix placeholder back - _FP_func_n_(args) -> (func(args))**n
    fp_pattern = re.compile(r'_FP_(\w+)_(\d+)_\(([^)]*)\)')
    while fp_pattern.search(s):
        s = fp_pattern.sub(r'(\1(\3))**\2', s)

    return s


def safe_eval(expr, x_val):
    """Safely evaluate math expression at x = x_val"""
    def sin(v): return math.sin(v)
    def cos(v): return math.cos(v)
    def tan(v): return math.tan(v)
    def sec(v): return 1.0 / math.cos(v)
    def csc(v): return 1.0 / math.sin(v)
    def cot(v): return math.cos(v) / math.sin(v)
    def log(v): return math.log(v)
    def sqrt(v): return math.sqrt(v)
    def exp(v): return math.exp(v)
    def arcsin(v): return math.asin(v)
    def arctan(v): return math.atan(v)

    local_vars = {
        'x': x_val,
        'sin': sin, 'cos': cos, 'tan': tan,
        'sec': sec, 'csc': csc, 'cot': cot,
        'log': log, 'ln': log,
        'sqrt': sqrt, 'exp': exp,
        'arcsin': arcsin, 'arctan': arctan,
        'abs': abs, 'pi': math.pi, 'e': math.e,
    }

    return eval(expr, {"__builtins__": {}}, local_vars)


if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 8080))
    app.run(debug=False, host='0.0.0.0', port=port)