from app.models.sport_model import get_sports, get_schedules_by_sport, create_sport, delete_sport

def list_sports():
    return get_sports()

def list_schedules_by_sport(sport_id: int):
    return get_schedules_by_sport(sport_id)

def create_new_sport(name: str):
    create_sport(name)
    return {"message": "Deporte creado"}

def delete_existing_sport(id: int):
    delete_sport(id)
    return {"message": "Deporte eliminado"}