from flask import Flask, request, jsonify, send_from_directory, make_response, abort
from flask_compress import Compress
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from level_generator import generate_level

app = Flask(__name__, static_folder='../frontend')
Compress(app)

# Only serve known web assets from frontend/.
ALLOWED_EXTENSIONS = ('.html', '.css', '.js', '.ico', '.png', '.svg')


@app.route('/healthz')
def healthz():
    # Target for an external keep-alive pinger (e.g. UptimeRobot every 5-10 min) so the
    # Render free instance never spins down. Does no work, returns no body.
    return '', 204


@app.route('/')
def index():
    response = make_response(send_from_directory('../frontend', 'index.html'))
    # HTML is never cached so the versioned asset URLs (?v=) take effect on deploy.
    response.headers['Cache-Control'] = 'no-cache'
    return response


@app.route('/<path:filename>')
def static_files(filename):
    if not filename.endswith(ALLOWED_EXTENSIONS):
        abort(404)
    response = make_response(send_from_directory('../frontend', filename))
    if filename.endswith(('.js', '.css')):
        response.headers['Cache-Control'] = 'public, max-age=86400'
    else:
        response.headers['Cache-Control'] = 'no-cache'
    return response


@app.route('/api/get_level_data', methods=['GET'])
def get_level_data():
    game = request.args.get('game', 'deriva')
    mode = request.args.get('mode', 'easy')
    difficulty = request.args.get('difficulty')
    families = request.args.get('families')
    valid_modes = {
        'deriva': ('basic', 'product', 'quotient', 'chain'),
        'integra': ('easy', 'normal', 'hard'),
    }
    if game not in valid_modes:
        return jsonify({'error': 'Invalid game param'}), 400
    if mode not in valid_modes[game]:
        return jsonify({'error': 'Invalid mode param'}), 400
    if difficulty not in (None, 'easy', 'normal', 'hard'):
        return jsonify({'error': 'Invalid difficulty param'}), 400

    valid_families = {'poly', 'trig', 'inv_trig', 'exp', 'log'}
    family_list = None
    if families:
        family_list = [f for f in families.split(',') if f]
        if any(f not in valid_families for f in family_list):
            return jsonify({'error': 'Invalid families param'}), 400

    level_data = generate_level(game, mode, difficulty, family_list)
    return jsonify(level_data)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8082))
    app.run(debug=False, host='0.0.0.0', port=port)
