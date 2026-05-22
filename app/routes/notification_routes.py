from fastapi import APIRouter
from pydantic import BaseModel
from app.controllers.notification_controller import *

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class Notification(BaseModel):
    student_id: int
    message: str

@router.get("/")
def get_all():
    return list_notifications()

@router.post("/")
def create(data: Notification):
    return create_new_notification(data)

@router.delete("/{id}")
def delete(id: int):
    return delete_existing_notification(id)