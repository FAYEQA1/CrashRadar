import json
import os
from utils.geo_utils import calculate_distance
from service.camera_service import CameraService


class HospitalService:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.json_path = os.path.join(self.base_dir, 'data', 'hospitals.json')
        self.camera_service = CameraService()

    # --------------------------------------------------
    # LOAD / SAVE
    # --------------------------------------------------
    def _load_hospitals(self):
        if not os.path.exists(self.json_path):
            return []
        try:
            with open(self.json_path, 'r') as f:
                data = json.load(f)
                if isinstance(data, dict):
                    return data.get("hospitals", [])
                return data
        except Exception as e:
            print(f"[HOSPITAL SERVICE ERROR] Failed to parse JSON: {e}")
            return []

    def _save_hospitals(self, hospitals):
        try:
            with open(self.json_path, 'w') as f:
                json.dump({"hospitals": hospitals}, f, indent=4)
        except Exception as e:
            print(f"[HOSPITAL SERVICE ERROR] Failed writing update state: {e}")

    # --------------------------------------------------
    # ZONE LOOKUP
    # --------------------------------------------------
    def get_hospital_by_camera(self, camera_id):
        hospitals = self._load_hospitals()
        for hospital in hospitals:
            if hospital.get("assigned_zone") == camera_id:
                return hospital
        return None

    # --------------------------------------------------
    # DISTANCE-BASED RANKING
    # --------------------------------------------------
    def get_nearest_hospitals(self, camera_id, limit=5):
        """
        Rank all hospitals by distance from the given camera's
        coordinates (both use nested {"coordinates": {"latitude":, "longitude":}}).
        """
        hospitals = self._load_hospitals()
        if not hospitals:
            return []

        cam_config = self.camera_service.get_camera_config(camera_id)
        cam_coords = cam_config.get("coordinates") if cam_config else None

        if not cam_coords:
            # No camera coordinates — can't rank, return as-is
            return hospitals[:limit]

        cam_lat = cam_coords.get("latitude")
        cam_lon = cam_coords.get("longitude")

        def distance_to(hospital):
            h_coords = hospital.get("coordinates", {})
            return calculate_distance(
                cam_lat, cam_lon,
                h_coords.get("latitude", 0), h_coords.get("longitude", 0)
            )

        ranked = sorted(hospitals, key=distance_to)
        return ranked[:limit]

    # --------------------------------------------------
    # DISPATCH — tries assigned hospital first, then cascades
    # --------------------------------------------------
    def request_ambulance_dispatch(self, camera_id):
        hospitals = self._load_hospitals()
        if not hospitals:
            return {
                "status": "error",
                "message": "No hospitals registered in the system.",
            }

        assigned = self.get_hospital_by_camera(camera_id)
        nearest = self.get_nearest_hospitals(camera_id, limit=len(hospitals))

        search_order = []
        if assigned:
            search_order.append(assigned)
        for h in nearest:
            if not assigned or h["id"] != assigned["id"]:
                search_order.append(h)

        for candidate in search_order:
            for h in hospitals:
                if h["id"] == candidate["id"] and h.get("available_ambulances", 0) > 0:
                    h["available_ambulances"] -= 1
                    self._save_hospitals(hospitals)

                    return {
                        "status": "dispatched",
                        "message": f"Ambulance dispatched from {h['name']} for zone {camera_id}.",
                        "hospital_details": h,
                        "remaining_ambulances": h["available_ambulances"],
                    }

        return {
            "status": "busy",
            "message": f"No ambulances available at any nearby hospital for zone {camera_id}.",
            "checked_hospitals": [h["name"] for h in search_order],
        }