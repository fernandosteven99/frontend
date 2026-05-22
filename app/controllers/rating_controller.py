from app.models.rating_model import *

def list_ratings():
    return get_ratings()

def create_new_rating(data):
    create_rating(data.student_id, data.sport_id, data.rating, data.comment)
    return {"message": "Calificación creada"}