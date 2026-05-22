from fastapi import APIRouter
from pydantic import BaseModel
from app.controllers.history_controller import *

router = APIRouter(prefix="/history", tags=["History"])

class History(BaseModel):
    student_id: int
    sport_id: int
    date: str

@router.get("/")
def get_all():
    return list_history()

@router.post("/")
def create(data: History):
    return create_new_history(data)