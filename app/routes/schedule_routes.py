from fastapi import APIRouter
from pydantic import BaseModel
from app.controllers.schedule_controller import list_schedules, list_schedules_by_instructor, list_students_by_schedule, register_attendance, create_new_schedule, delete_existing_schedule

router = APIRouter()

class AttendanceRequest(BaseModel):
    reservation_id: int
    status: str

class ScheduleRequest(BaseModel):
    sport_id: int
    day: str
    time: str
    capacity: int
    location_id: int
    instructor_id: int

@router.get("/schedules")
def get_schedules():
    return list_schedules()

@router.get("/schedules/instructor/{instructor_id}")
def get_schedules_instructor(instructor_id: int):
    return list_schedules_by_instructor(instructor_id)

@router.get("/schedules/{schedule_id}/students")
def get_students(schedule_id: int):
    return list_students_by_schedule(schedule_id)

@router.post("/attendance")
def post_attendance(request: AttendanceRequest):
    return register_attendance(request.reservation_id, request.status)

@router.post("/schedules")
def post_schedule(request: ScheduleRequest):
    return create_new_schedule(request.sport_id, request.day, request.time, request.capacity, request.location_id, request.instructor_id)

@router.delete("/schedules/{id}")
def remove_schedule(id: int):
    return delete_existing_schedule(id)