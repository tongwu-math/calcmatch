from flask import Flask, request, jsonify, send_from_directory, abort
import sys
import os

# Ensure backend/ is on the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from level_generator import generate_level

ALLOWED_MODES = {"easy", "normal", "hard"}
ALLOWED_EXTENSIONS = {".html", ".css", ".js", ".ico", ".png", ".svg", ".json"}

app = Flask(__name__, static_folder='../frontend')

@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    _, ext = os.path.splitext(filename)
    if ext.lower() not in ALLOWED_EXTENSIONS:
        abort(404)
    return send_from_directory('../frontend', filename)

@app.route('/api/get_level_data', methods=['GET'])
def get_level_data():
    mode = request.args.get('mode', 'easy')
    if mode not in ALLOWED_MODES:
        return jsonify({"error": f"Invalid mode: {mode}. Use easy, normal, or hard."}), 400
    level_data = generate_level(mode)
    return jsonify(level_data)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(debug=False, host='0.0.0.0', port=port)