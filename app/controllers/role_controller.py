from app.models.role_model import *

def list_roles():
    return get_roles()

def create_new_role(data):
    create_role(data.name)
    return {"message": "Role created"}