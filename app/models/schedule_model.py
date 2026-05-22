from app.config.db_config import get_connection

def get_schedules():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT s.id, sp.name as sport, s.day, s.time, s.capacity, s.location_id, s.instructor_id
        FROM schedules s
        JOIN sports sp ON s.sport_id = sp.id
    """)
    data = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "sport": r[1], "day": r[2], "time": str(r[3]), "capacity": r[4], "location_id": r[5], "instructor_id": r[6]} for r in data]

def get_schedules_by_instructor(instructor_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT s.id, sp.name as sport, s.day, s.time, s.capacity, s.location_id
        FROM schedules s
        JOIN sports sp ON s.sport_id = sp.id
        WHERE s.instructor_id = %s
    """, (instructor_id,))
    data = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "sport": r[1], "day": r[2], "time": str(r[3]), "capacity": r[4], "location_id": r[5]} for r in data]

def get_students_by_schedule(schedule_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.id, u.nombre, u.apellido, u.email, r.id as reservation_id
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        WHERE r.schedule_id = %s
    """, (schedule_id,))
    data = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "nombre": r[1], "apellido": r[2], "email": r[3], "reservation_id": r[4]} for r in data]

def mark_attendance(reservation_id: int, status: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM attendance WHERE reservation_id = %s", (reservation_id,))
    existing = cursor.fetchone()
    if existing:
        cursor.execute("UPDATE attendance SET status = %s WHERE reservation_id = %s", (status, reservation_id))
    else:
        cursor.execute("INSERT INTO attendance (reservation_id, status) VALUES (%s, %s)", (reservation_id, status))
    conn.commit()
    conn.close()
    return {"message": "Asistencia registrada"}

def create_schedule(sport_id: int, day: str, time: str, capacity: int, location_id: int, instructor_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO schedules (sport_id, day, time, capacity, location_id, instructor_id)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (sport_id, day, time, capacity, location_id, instructor_id))
    conn.commit()
    conn.close()

def delete_schedule(id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM schedules WHERE id = %s", (id,))
    conn.commit()
    conn.close()