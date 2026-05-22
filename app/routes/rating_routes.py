from fastapi import APIRouter
from pydantic import BaseModel
from app.controllers.rating_controller import *

router = APIRouter(prefix="/ratings", tags=["Ratings"])

class Rating(BaseModel):
    student_id: int
    sport_id: int
    rating: int
    comment: str

@router.get("/")
def get_all():
    return list_ratings()

@router.post("/")
def create(data: Rating):
    return create_new_rating(data)