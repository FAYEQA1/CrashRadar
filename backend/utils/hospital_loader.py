import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

HOSPITAL_FILE = os.path.abspath(
    os.path.join(BASE_DIR, "..", "data", "hospital.json")
)

with open(HOSPITAL_FILE, "r") as f:
    HOSPITAL_DATA = json.load(f)["hospitals"]


def get_hospital(camera_id):
    for hospital in HOSPITAL_DATA:
        if hospital.get("assigned_camera") == camera_id:
            return hospital
    return None