from fastapi import APIRouter
from pydantic import BaseModel
from app.controllers.reservation_controller import reserve

router = APIRouter()

class Reservation(BaseModel):
    user_id: int
    schedule_id: int

@router.post("/reserve")
def create(reservation: Reservation):
    return reserve(reservation.user_id, reservation.schedule_id)