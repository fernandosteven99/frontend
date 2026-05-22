from app.models.reservation_model import create_reservation

def reserve(user_id, schedule_id):
    return create_reservation(user_id, schedule_id)