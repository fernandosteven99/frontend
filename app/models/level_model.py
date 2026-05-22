from app.config.db_config import get_connection

def get_levels():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sport_levels")
    data = cursor.fetchall()
    conn.close()
    return data

def create_level(level):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO sport_levels (level) VALUES (%s)",
        (level,)
    )
    conn.commit()
    conn.close()