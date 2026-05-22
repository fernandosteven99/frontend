from app.config.db_config import get_connection

def get_roles():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM roles")
    data = cursor.fetchall()
    conn.close()
    return data

def create_role(name):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO roles (name) VALUES (%s)", (name,))
    conn.commit()
    conn.close()