from pydantic import BaseModel

class User(BaseModel):
    id: int = None
    nombre: str
    apellido: str
    email: str
    usuario: str
    contrasena: str
    role_id: int = 1