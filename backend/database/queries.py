import sqlite3
import os
import sys 
sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
) 
from database.models import get_connections
import datetime



def insert_incidents(timestamps,
    vehicle_ids,
    severity,
    snapshot,
    location,
    status,
    collision_distance,
    speed_before_collision,created_at):

    connections = get_connections()
    cursor = connections.cursor()
    created_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
    INSERT INTO INCIDENTS (timestamps,
    vehicle_ids,
    severity,
    snapshot,
    location,
    status,
    collision_distance,
    speed_before_collision,created_at)
    Values (?,?,?,?,?,?,?,?,?)         
    
    """,(timestamps,
    vehicle_ids,
    severity,
    snapshot,
    location,status,
    collision_distance,
    speed_before_collision,created_at)
    )

    connections.commit()
    connections.close()
    print("Incidents insered succefully .")


def get_all_incidents():
    connections = get_connections()
    cursor = connections.cursor()
    cursor.execute("""
        SELECT * FROM INCIDENTS ORDER BY id DESC
                   
""")
    incidents = cursor.fetchall()
    connections.commit()
    connections.close()
    return incidents


def get_incident_by_id(incident_id):
    connections = get_connections()
    cursor = connections.cursor()
    cursor.execute("""
        SELECT * FROM INCIDENTS
        WHERE ID = ?
""",(incident_id))
    incident = cursor.fetchone()
    connections.commit()
    connections.close()
    return incident


def  update_incident_status (incident_id,new_status):
    connections = get_connections()
    cursor = connections.cursor()
    cursor = connections.execute("""
        Update INCIDENTS SET status =?
        where id = ?
"""(new_status,incident_id))
    connections.commit()
    connections.close()

    print("Incident status updated successfully")


if __name__=='__main__':
        insert_incidents(

        timestamps="2026-05-18 20:00:00",

        vehicle_ids="2,5",

        severity="HIGH",

        snapshot="static/snapshots/accident_1.jpg",

        location="CAMERA-1",

        status="PENDING",

        collision_distance=34.5,

        speed_before_collision=27,
        created_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    )

        all_incidents = get_all_incidents()

        print(all_incidents)