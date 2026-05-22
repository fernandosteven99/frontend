from fastapi import APIRouter
from pydantic import BaseModel
from app.controllers.attendance_controller import *

router = APIRouter(prefix="/attendance", tags=["Attendance"])

class Attendance(BaseModel):
    student_id: int
    schedule_id: int
    attended: bool

@router.get("/")
def get_all():
    return list_attendance()

@router.post("/")
def create(data: Attendance):
    return create_new_attendance(data)