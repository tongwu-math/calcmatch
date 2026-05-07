from flask import Flask, request, jsonify, send_from_directory
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from level_generator import generate_level

app = Flask(__name__, static_folder='../frontend')


@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')


@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('../frontend', filename)


@app.route('/api/get_level_data', methods=['GET'])
def get_level_data():
    game = request.args.get('game', 'deriva')
    mode = request.args.get('mode', 'easy')
    if game not in ('deriva', 'integra'):
        return jsonify({'error': 'Invalid game param'}), 400
    if mode not in ('easy', 'normal', 'hard'):
        return jsonify({'error': 'Invalid mode param'}), 400
    level_data = generate_level(game, mode)
    return jsonify(level_data)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8082))
    app.run(debug=False, host='0.0.0.0', port=port)
