from fastapi import APIRouter
from pydantic import BaseModel
from app.controllers.role_controller import *

router = APIRouter(prefix="/roles", tags=["Roles"])

class Role(BaseModel):
    name: str

@router.get("/")
def get_roles_route():
    return list_roles()

@router.post("/")
def create_role_route(data: Role):
    return create_new_role(data)