from app.models.history_model import *

def list_history():
    return get_history()

def create_new_history(data):
    create_history(data.student_id, data.sport_id, data.date)
    return {"message": "Historial guardado"}