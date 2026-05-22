from fastapi import APIRouter, HTTPException
from app.config.db_config import get_connection

router = APIRouter(prefix="/student", tags=["Student"])

@router.get("/{user_id}/inscriptions")
def get_my_inscriptions(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.id, sp.name as sport, s.day, s.time, s.capacity, s.id as schedule_id
        FROM reservations r
        JOIN schedules s ON r.schedule_id = s.id
        JOIN sports sp ON s.sport_id = sp.id
        WHERE r.user_id = %s
    """, (user_id,))
    data = cursor.fetchall()
    conn.close()
    return [{"reservation_id": r[0], "sport": r[1], "day": r[2], "time": str(r[3]), "capacity": r[4], "schedule_id": r[5]} for r in data]

@router.get("/{user_id}/attendance")
def get_my_attendance(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT sp.name, s.day, s.time, a.status
        FROM reservations r
        JOIN schedules s ON r.schedule_id = s.id
        JOIN sports sp ON s.sport_id = sp.id
        LEFT JOIN attendance a ON a.reservation_id = r.id
        WHERE r.user_id = %s
    """, (user_id,))
    data = cursor.fetchall()
    conn.close()
    return [{"sport": r[0], "day": r[1], "time": str(r[2]), "status": r[3] or "pending"} for r in data]

@router.delete("/{user_id}/cancel/{reservation_id}")
def cancel_inscription(user_id: int, reservation_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT schedule_id FROM reservations WHERE id = %s AND user_id = %s", (reservation_id, user_id))
    res = cursor.fetchone()
    if not res:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    cursor.execute("UPDATE schedules SET capacity = capacity + 1 WHERE id = %s", (res[0],))
    cursor.execute("DELETE FROM reservations WHERE id = %s", (reservation_id,))
    conn.commit()
    conn.close()
    return {"message": "Inscripción cancelada"}

@router.get("/{user_id}/notifications")
def get_notifications(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, message, seen
        FROM notifications
        WHERE user_id = %s
    """, (user_id,))
    data = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "message": r[1], "seen": r[2]} for r in data]

@router.get("/{user_id}/profile")
def get_profile(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nombre, apellido, email, usuario, role_id FROM users WHERE id = %s", (user_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"id": r[0], "nombre": r[1], "apellido": r[2], "email": r[3], "usuario": r[4], "role_id": r[5]}

@router.put("/{user_id}/password")
def change_password(user_id: int, contrasena_actual: str, contrasena_nueva: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE id = %s AND contrasena = %s", (user_id, contrasena_actual))
    if not cursor.fetchone():
        raise HTTPException(status_code=401, detail="Contraseña actual incorrecta")
    cursor.execute("UPDATE users SET contrasena = %s WHERE id = %s", (contrasena_nueva, user_id))
    conn.commit()
    conn.close()
    return {"message": "Contraseña actualizada"}