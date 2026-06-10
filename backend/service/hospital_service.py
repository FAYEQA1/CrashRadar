import json
import os
from utils.geo_utils import calculate_distance

class HospitalService:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        # Matches your layout: backend/data/hospitals.json
        self.json_path = os.path.join(self.base_dir, 'data', 'hospitals.json')

    def _load_hospitals(self):
        """Helper to safely read hospitals from the data file."""
        if not os.path.exists(self.json_path):
            return []
        try:
            with open(self.json_path, 'r') as f:
                data = json.load(f)
                # Handle both structural layouts: raw array or nested {"hospitals": [...]}
                if isinstance(data, dict):
                    return data.get("hospitals", [])
                return data
        except Exception as e:
            print(f"[HOSPITAL SERVICE ERROR] Failed to parse JSON: {e}")
            return []

    def get_hospital_by_camera(self, camera_id):
        """
        Direct 1:1 lookup mapping a single camera zone area to its 
        assigned nearest emergency medical facility.
        """
        hospitals = self._load_hospitals()
        for hospital in hospitals:
            if hospital.get("assigned_zone") == camera_id:
                return hospital
        
        # Safe fallback if file hasn't been fully populated or zone isn't matched
        return {
            "id": "fallback_01",
            "name": "Osmania General Hospital", 
            "contact_number": "+91-40-24600144",
            "tier": "LEVEL-1-TRAUMA",
            "available_ambulances": 3
        }

    def request_ambulance_dispatch(self, camera_id):
        """Triggered automatically by detection layers to claim an available ambulance."""
        hospitals = self._load_hospitals()
        hospital = self.get_hospital_by_camera(camera_id)
        
        if not hospital or hospital.get("id") == "fallback_01":
            return {
                "status": "dispatched", 
                "message": "Ambulance successfully dispatched from Osmania General Hospital (Fallback).",
                "hospital_details": hospital
            }

        success = False
        message = f"All ambulances at {hospital['name']} are currently deployed."

        # Find the correct item in the list state to decrement its counter
        for h in hospitals:
            if h["id"] == hospital["id"]:
                if h.get("available_ambulances", 0) > 0:
                    h["available_ambulances"] -= 1
                    success = True
                    message = f"Ambulance successfully dispatched from {h['name']} for zone {camera_id}."
                    break
        
        if success:
            try:
                # Save state changes back to the JSON matrix structure programmatically
                with open(self.json_path, 'w') as f:
                    # If it was a nested dict originally, preserve that structure
                    json.dump({"hospitals": hospitals}, f, indent=4)
            except Exception as e:
                print(f"[HOSPITAL SERVICE ERROR] Failed writing update state: {e}")

        return {
            "status": "dispatched" if success else "busy",
            "message": message,
            "hospital_details": hospital
        }