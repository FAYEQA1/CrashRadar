from database.models import get_connections

conn = get_connections()
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(INCIDENTS)")
for row in cursor.fetchall():
    print(row)