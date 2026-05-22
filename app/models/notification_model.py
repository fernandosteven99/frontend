from app.config.db_config import get_connection

def get_notifications():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notifications")
    data = cursor.fetchall()
    conn.close()
    return data

def create_notification(student_id, message):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO notifications (student_id, message) VALUES (%s, %s)",
        (student_id, message)
    )
    conn.commit()
    conn.close()

def delete_notification(id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notifications WHERE id=%s", (id,))
    conn.commit()
    conn.close()