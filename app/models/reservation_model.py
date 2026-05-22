from app.config.db_config import get_connection

def create_reservation(user_id, schedule_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT capacity FROM schedules WHERE id = %s",
        (schedule_id,)
    )
    result = cursor.fetchone()

    if result is None:
        conn.close()
        return {"error": "Horario no existe"}

    capacity = result[0]

    if capacity <= 0:
        conn.close()
        return {"error": "No hay cupos disponibles"}

    cursor.execute(
        "INSERT INTO reservations (user_id, schedule_id) VALUES (%s, %s)",
        (user_id, schedule_id)
    )

    cursor.execute(
        "UPDATE schedules SET capacity = capacity - 1 WHERE id = %s",
        (schedule_id,)
    )

    conn.commit()
    conn.close()

    return {"message": "Reserva creada"}