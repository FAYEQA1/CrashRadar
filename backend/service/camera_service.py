import os
import json

class CameraService:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        # Matches your data folder layout: backend/data/cameras.json
        self.json_path = os.path.normpath(os.path.join(self.base_dir, "..", "data", "cameras.json"))

    def _load_cameras(self):
        if not os.path.exists(self.json_path):
            return {"cameras": []}
        with open(self.json_path, 'r') as f:
            return json.load(f)

    def get_all_cameras(self):
        """Returns the entire camera asset list for the frontend."""
        return self._load_cameras().get("cameras", [])

    def get_camera_config(self, camera_id):
        """Fetches operational configurations for a specific camera ID."""
        cameras = self.get_all_cameras()
        for cam in cameras:
            if cam["id"] == camera_id:
                return cam
        return None