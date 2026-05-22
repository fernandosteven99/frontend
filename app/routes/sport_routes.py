from fastapi import APIRouter
from pydantic import BaseModel
from app.controllers.sport_controller import list_sports, list_schedules_by_sport, create_new_sport, delete_existing_sport

router = APIRouter()

class Sport(BaseModel):
    name: str

@router.get("/sports")
def get_sports():
    return list_sports()

@router.get("/sports/{sport_id}/schedules")
def get_schedules(sport_id: int):
    return list_schedules_by_sport(sport_id)

@router.post("/sports")
def create_sport(sport: Sport):
    return create_new_sport(sport.name)

@router.delete("/sports/{id}")
def delete_sport(id: int):
    return delete_existing_sport(id)