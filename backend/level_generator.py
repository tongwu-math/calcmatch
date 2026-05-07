import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from deriva_generator import generate_level as generate_deriva
from integra_generator import generate_level as generate_integra


def generate_level(game, mode):
    if game == "deriva":
        return generate_deriva(mode)
    elif game == "integra":
        return generate_integra(mode)
    return {"blocks": [], "operators": []}
