from app.config.db_config import get_connection

def get_locations():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM locations")
    data = cursor.fetchall()
    conn.close()
    return data

def get_location(id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM locations WHERE id=%s", (id,))
    data = cursor.fetchone()
    conn.close()
    return data

def create_location(name, capacity):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO locations (name, capacity) VALUES (%s, %s)",
        (name, capacity)
    )
    conn.commit()
    conn.close()

def update_location(id, name, capacity):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE locations SET name=%s, capacity=%s WHERE id=%s",
        (name, capacity, id)
    )
    conn.commit()
    conn.close()

def delete_location(id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM locations WHERE id=%s", (id,))
    conn.commit()
    conn.close()