from app.models.attendance_model import *

def list_attendance():
    return get_attendance()

def create_new_attendance(data):
    create_attendance(data.student_id, data.schedule_id, data.attended)
    return {"message": "Asistencia registrada"}