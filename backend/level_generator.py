import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def generate_level(game, mode, difficulty=None, families=None):
    if game == "deriva":
        from deriva_generator import generate_level as generate_deriva
        return generate_deriva(mode, difficulty, families)
    elif game == "integra":
        from integra_generator import generate_level as generate_integra
        return generate_integra(mode, difficulty, families)
    return {"blocks": [], "operators": []}
