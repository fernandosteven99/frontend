from app.config.db_config import get_connection

def get_attendance():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM attendance")
    data = cursor.fetchall()
    conn.close()
    return data

def create_attendance(student_id, schedule_id, attended):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO attendance (student_id, schedule_id, attended) VALUES (%s,%s,%s)",
        (student_id, schedule_id, attended)
    )
    conn.commit()
    conn.close()