from app.config.db_config import get_connection

def get_sports():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM sports")
    data = cursor.fetchall()
    conn.close()
    return [{"id": row[0], "name": row[1]} for row in data]

def get_schedules_by_sport(sport_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, day, time, capacity, location_id
        FROM schedules WHERE sport_id = %s
    """, (sport_id,))
    data = cursor.fetchall()
    conn.close()
    return [{"id": row[0], "day": row[1], "time": str(row[2]), "capacity": row[3], "location_id": row[4]} for row in data]

def create_sport(name: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO sports (name) VALUES (%s)", (name,))
    conn.commit()
    conn.close()

def delete_sport(id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sports WHERE id = %s", (id,))
    conn.commit()
    conn.close()