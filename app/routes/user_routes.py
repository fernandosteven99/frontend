from fastapi import APIRouter
from app.config.db_config import get_connection

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/")
def get_users():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.id, u.nombre, u.apellido, u.email, u.usuario, u.role_id, r.name as role
        FROM users u
        JOIN roles r ON u.role_id = r.id
    """)
    data = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "nombre": r[1], "apellido": r[2], "email": r[3], "usuario": r[4], "role_id": r[5], "role": r[6]} for r in data]

@router.put("/{id}/role")
def update_role(id: int, role_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET role_id = %s WHERE id = %s", (role_id, id))
    conn.commit()
    conn.close()
    return {"message": "Rol actualizado"}

@router.delete("/{id}")
def delete_user(id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id = %s", (id,))
    conn.commit()
    conn.close()
    return {"message": "Usuario eliminado"}