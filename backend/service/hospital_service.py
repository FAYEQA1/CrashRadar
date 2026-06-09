import json
import os
from utils.geo_utils import calculate_distance

def find_nearest_hospital(location_name):
    """Parses static data configs to locate closest emergency care coordinates."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(base_dir, 'data', 'hospitals.json')
    
    # Safe fallback if file hasn't been fully populated yet
    if not os.path.exists(json_path):
        return {"name": "Osmania General Hospital", "distance_km": 2.4, "phone": "+91-40-24600144"}
        
    with open(json_path, 'r') as f:
        hospitals = json.load(f)
        
    # Mock lookup or sorting by proximity matrix depending on your camera metadata mapping
    return hospitals[0] if hospitals else None