import psycopg2

def get_connection():
    return psycopg2.connect(
        "postgresql://neondb_owner:npg_1ugjFDsEAW0k@ep-rough-resonance-ambvbrlf-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    )