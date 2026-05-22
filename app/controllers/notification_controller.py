from app.models.notification_model import *

def list_notifications():
    return get_notifications()

def create_new_notification(data):
    create_notification(data.student_id, data.message)
    return {"message": "Notificación creada"}

def delete_existing_notification(id):
    delete_notification(id)
    return {"message": "Notificación eliminada"}