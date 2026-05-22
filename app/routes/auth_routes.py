from fastapi import APIRouter, HTTPException
from app.config.db_config import get_connection
from app.models.user_model import User

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(user: User):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE usuario = %s OR email = %s", (user.usuario, user.email))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El usuario o email ya existe")
        
        cursor.execute("""
            INSERT INTO users (nombre, apellido, email, usuario, contrasena, role_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user.nombre, user.apellido, user.email, user.usuario, user.contrasena, user.role_id))
        
        conn.commit()
        return {"message": "Usuario registrado exitosamente"}
    
    except HTTPException:
        raise
    except Exception as err:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        conn.close()


@router.post("/login")
def login(credencial: str, contrasena: str, role_id: int):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, nombre, apellido, usuario, role_id
            FROM users 
            WHERE (usuario = %s OR email = %s) AND contrasena = %s AND role_id = %s
        """, (credencial, credencial, contrasena, role_id))
        
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=401, detail="Credenciales incorrectas o rol equivocado")
        
        return {
            "message": "Login exitoso",
            "user": {
                "id": user[0],
                "nombre": user[1],
                "apellido": user[2],
                "usuario": user[3],
                "role_id": user[4]
            }
        }
    
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        conn.close()