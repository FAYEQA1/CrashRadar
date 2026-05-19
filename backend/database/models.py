import sqlite3 
import os 

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR,"..","..","database","accidents.db")
os.makedirs(
    os.path.dirname(DB_PATH),
    exist_ok=True
)

def get_connections():
    connections = sqlite3.connect(DB_PATH)
    return connections

def create_incidents_table():
    connections = get_connections()
    cursor = connections.cursor()

    cursor.execute("""
                    CREATE TABLE if not exists INCIDENTS(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamps TEXT,
                    vehicle_ids TEXT,
                    severity TEXT,
                    snapshot TEXT,
                   location TEXT,
                   status TEXT,
                   collision_distance REAL,
                   speed_before_collision REAL,
                   created_at TEXT)
    """)
    connections.commit()
    connections.close()
    print("Incidents table created succefully ")

    
def initialize_database():
    create_incidents_table()
    print("Database initialized succefully ")

if __name__== "__main__":
    initialize_database()
