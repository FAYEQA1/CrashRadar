import json
import os


class CameraService:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.json_path = os.path.join(self.base_dir, 'data', 'cameras.json')

    def _load_cameras(self):
        if not os.path.exists(self.json_path):
            return []
        try:
            with open(self.json_path, 'r') as f:
                data = json.load(f)
                if isinstance(data, dict):
                    return data.get("cameras", [])
                return data
        except Exception as e:
            print(f"[CAMERA SERVICE ERROR] Failed to parse JSON: {e}")
            return []

    def get_all_cameras(self):
        return self._load_cameras()

    def get_camera_config(self, camera_id):
        for cam in self._load_cameras():
            if cam.get("id") == camera_id:
                return cam
        return None