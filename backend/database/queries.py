import sqlite3
import os
import sys
sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

import datetime
from database.models import get_connections


def insert_incidents(
    timestamps,
    vehicle_ids,
    severity,
    snapshot,
    location,
    status,
    collision_distance,
    speed_before_collision,
    created_at=None
):
    connections = get_connections()
    cursor = connections.cursor()

    created_at = datetime.datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    # --------------------------------------------------
    # DUPLICATE GUARD
    # Prevent same vehicle pair being inserted
    # repeatedly within 10 seconds
    # --------------------------------------------------

    cursor.execute("""
        SELECT COUNT(*)
        FROM INCIDENTS
        WHERE vehicle_ids = ?
          AND status = 'PENDING'
          AND created_at >= datetime('now', '-10 seconds')
    """, (vehicle_ids,))

    duplicate_count = cursor.fetchone()[0]

    if duplicate_count > 0:

        print(
            f"[SKIPPED] Duplicate incident for "
            f"{vehicle_ids}"
        )

        connections.close()
        return

    # --------------------------------------------------
    # INSERT INCIDENT
    # --------------------------------------------------

    cursor.execute("""
        INSERT INTO INCIDENTS (
            timestamps,
            vehicle_ids,
            severity,
            snapshot,
            location,
            status,
            collision_distance,
            speed_before_collision,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        timestamps,
        vehicle_ids,
        severity,
        snapshot,
        location,
        status,
        collision_distance,
        speed_before_collision,
        created_at
    ))

    connections.commit()
    connections.close()

    print(
        f"[INSERTED] Incident: "
        f"vehicles={vehicle_ids} "
        f"severity={severity}"
    )


def get_all_incidents():
    connections = get_connections()
    cursor = connections.cursor()
    cursor.execute("""
        SELECT * FROM INCIDENTS ORDER BY id DESC
    """)
    incidents = cursor.fetchall()
    connections.close()   # BUG FIX: removed commit() before close() — SELECT needs no commit
    return incidents


def get_incident_by_id(incident_id):
    connections = get_connections()
    cursor = connections.cursor()
    cursor.execute("""
        SELECT * FROM INCIDENTS
        WHERE id = ?
    """, (incident_id,))
    incident = cursor.fetchone()
    connections.close()   # BUG FIX: same — no commit needed after SELECT
    return incident


def update_incident_status(incident_id, new_status):
    connections = get_connections()
    cursor = connections.cursor()

    # BUG FIX: was `cursor = connections.execute("""..."""(new_status, incident_id))`
    # That tried to CALL the string like a function — missing the comma between
    # the SQL string and the parameter tuple. Also reassigned cursor accidentally.
    cursor.execute("""
        UPDATE INCIDENTS
        SET status = ?
        WHERE id = ?
    """, (new_status, incident_id))

    connections.commit()
    connections.close()
    print("Incident status updated successfully.")


def delete_incident(incident_id):
    """Utility: hard-delete a single incident by ID."""
    connections = get_connections()
    cursor = connections.cursor()
    cursor.execute("DELETE FROM INCIDENTS WHERE id = ?", (incident_id,))
    connections.commit()
    connections.close()
    print(f"Incident {incident_id} deleted.")


def get_incidents_by_severity(severity: str):
    """Fetch all incidents matching a severity level (LOW / MEDIUM / HIGH)."""
    connections = get_connections()
    cursor = connections.cursor()
    cursor.execute("""
        SELECT * FROM INCIDENTS
        WHERE severity = ?
        ORDER BY id DESC
    """, (severity.upper(),))
    incidents = cursor.fetchall()
    connections.close()
    return incidents


def get_pending_incidents():
    """Shortcut: all incidents still waiting for review."""
    connections = get_connections()
    cursor = connections.cursor()
    cursor.execute("""
        SELECT * FROM INCIDENTS
        WHERE status = 'PENDING'
        ORDER BY id DESC
    """)
    incidents = cursor.fetchall()
    connections.close()
    return incidents


if __name__ == '__main__':
    insert_incidents(
        timestamps="2026-05-18 20:00:00",
        vehicle_ids="4,5",
        severity="HIGH",
        snapshot="static/snapshots/accident_2.jpg",
        location="CAMERA-2",
        status="PENDING",
        collision_distance=34.5,
        speed_before_collision=27,
    )

    all_incidents = get_all_incidents()
    print(all_incidents)