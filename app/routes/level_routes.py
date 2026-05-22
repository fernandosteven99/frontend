from fastapi import APIRouter
from pydantic import BaseModel
from app.controllers.level_controller import *

router = APIRouter(prefix="/levels", tags=["Levels"])

class Level(BaseModel):
    level: str

@router.get("/")
def get_all():
    return list_levels()

@router.post("/")
def create(level: Level):
    return create_new_level(level)