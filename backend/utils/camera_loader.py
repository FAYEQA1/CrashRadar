import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CAMERA_FILE = os.path.abspath(
    os.path.join(BASE_DIR, "..", "data", "cameras.json")
)

print("Camera JSON:", CAMERA_FILE)
print("Exists:", os.path.exists(CAMERA_FILE))

with open(CAMERA_FILE, "r") as f:
    CAMERA_DATA = json.load(f)["cameras"]


def get_camera(camera_id):
    for camera in CAMERA_DATA:
        if camera["id"] == camera_id:
            return camera
    return None