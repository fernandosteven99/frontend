from app.models.level_model import *

def list_levels():
    return get_levels()

def create_new_level(data):
    create_level(data.level)
    return {"message": "Nivel creado"}