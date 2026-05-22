from app.models.location_model import *

def list_locations():
    return get_locations()

def get_one_location(id):
    return get_location(id)

def create_new_location(data):
    create_location(data.name, data.capacity)
    return {"message": "Location creada"}

def update_existing_location(id, data):
    update_location(id, data.name, data.capacity)
    return {"message": "Location actualizada"}

def delete_existing_location(id):
    delete_location(id)
    return {"message": "Location eliminada"}