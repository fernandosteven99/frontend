from app.config.db_config import get_connection

def get_ratings():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ratings")
    data = cursor.fetchall()
    conn.close()
    return data

def create_rating(student_id, sport_id, rating, comment):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO ratings (student_id, sport_id, rating, comment) VALUES (%s,%s,%s,%s)",
        (student_id, sport_id, rating, comment)
    )
    conn.commit()
    conn.close()