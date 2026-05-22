from app.config.db_config import get_connection

def get_history():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM enrollments_history")
    data = cursor.fetchall()
    conn.close()
    return data

def create_history(student_id, sport_id, date):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO enrollments_history (student_id, sport_id, date) VALUES (%s,%s,%s)",
        (student_id, sport_id, date)
    )
    conn.commit()
    conn.close()