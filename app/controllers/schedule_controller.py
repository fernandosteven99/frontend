from app.models.schedule_model import get_schedules, get_schedules_by_instructor, get_students_by_schedule, mark_attendance, create_schedule, delete_schedule

def list_schedules():
    return get_schedules()

def list_schedules_by_instructor(instructor_id: int):
    return get_schedules_by_instructor(instructor_id)

def list_students_by_schedule(schedule_id: int):
    return get_students_by_schedule(schedule_id)

def register_attendance(reservation_id: int, status: str):
    return mark_attendance(reservation_id, status)

def create_new_schedule(sport_id, day, time, capacity, location_id, instructor_id):
    create_schedule(sport_id, day, time, capacity, location_id, instructor_id)
    return {"message": "Horario creado"}

def delete_existing_schedule(id: int):
    delete_schedule(id)
    return {"message": "Horario eliminado"}