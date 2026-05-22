from fastapi import APIRouter
from pydantic import BaseModel
from app.controllers.location_controller import *

router = APIRouter(prefix="/locations", tags=["Locations"])

class Location(BaseModel):
    name: str
    capacity: int

@router.get("/")
def get_all():
    return list_locations()

@router.get("/{id}")
def get_one(id: int):
    return get_one_location(id)

@router.post("/")
def create(location: Location):
    return create_new_location(location)

@router.put("/{id}")
def update(id: int, location: Location):
    return update_existing_location(id, location)

@router.delete("/{id}")
def delete(id: int):
    return delete_existing_location(id)