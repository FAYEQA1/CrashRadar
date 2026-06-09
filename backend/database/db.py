import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.normpath(os.path.join(BASE_DIR, "..", "crash_radar.db"))

def get_db_connection():
    """Provides a reusable, clean connection instance to the SQLite database."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Enables fetching rows as dictionary-like objects
    return conn