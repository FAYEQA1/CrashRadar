import os
import sys
import threading
from flask import Flask, jsonify, request, send_from_directory
# Remove the old CORS line and replace with:
from flask_cors import CORS
 # allows all origins on all routes — fine for presentation

# Dynamic path resolution injection hook
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Existing Imports
from database.models import initialize_database
from database.queries import get_all_incidents, update_incident_status
from service.detection import DetectionService

# NEW IMPORTS: Connecting your new services and background system queue
from service.camera_service import CameraService
from service.hospital_service import HospitalService
# Change this:
from event_queue.worker import IncidentQueueWorker


app = Flask(__name__)

# Enable CORS so your React frontend can query endpoints on port 5000
CORS(app) 
# Auto-initialize SQLite data structures on app start
initialize_database()

from routes.incident_routes import incident_bp
app.register_blueprint(incident_bp)

# NEW INSTANCE INITIALIZATIONS
camera_manager = CameraService()
hospital_manager = HospitalService()
queue_worker = IncidentQueueWorker()

# Start the background queue worker loop immediately when Flask starts
queue_worker.start_processing()

# Absolute path configurations for reading generated evidence images
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_SNAPSHOTS_DIR = os.path.normpath(os.path.join(BASE_DIR, "static", "snapshots"))


@app.route("/api/health", methods=["GET"])
def home():
    return jsonify({
        "status": "active",
        "system": "CrashRadar Core API Engine",
        "version": "2.1.0"
    }), 200


@app.route('/api/incidents', methods=["GET"])
def get_incidents():
    """Fetches full log history sorted newest-first for React grid ingestion."""
    try:
        records = get_all_incidents()
        incidents_list = []
        print(records[0]) 
        for r in records:
            incidents_list.append({
                "id": r[0],
                "timestamp": r[1],
                "vehicle_ids": r[2],
                "severity": r[3],
                "snapshot_url": f"http://localhost:5000/api/static/snapshots/{os.path.basename(r[4])}" if r[4] else None,
                "location": r[5],
                "status": r[6],
                "collision_distance_m": r[7],
                "speed_before_collision_ms": r[8],
                "created_at": r[9],
                "vehicle_type": r[10],
                "dispatched_hospital": r[11],
            })
        return jsonify(incidents_list), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/incidents/<int:incident_id>/status', methods=["PUT"])
def patch_status(incident_id):
    """Allows dispatch agents to flag instances as RESOLVED or FALSE_POSITIVE."""
    data = request.get_json() or {}
    new_status = data.get("status")
    if not new_status:
        return jsonify({"error": "Missing status payload parameter"}), 400
    
    try:
        update_incident_status(incident_id, new_status.upper())
        return jsonify({"status": "success", "message": f"Incident {incident_id} updated to {new_status}"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/detection/start', methods=["POST"])
def trigger_detection():
    """
    Looks up camera configs via JSON dynamically using the passed camera_id, 
    and starts processing that specific camera's configured stream_source.
    """
    data = request.get_json() or {}
    camera_id = data.get("camera_id", "CAMERA-1") # Grab selected camera from React

    # Fetch configuration from cameras.json programmatically instead of hardcoding
    cam_config = camera_manager.get_camera_config(camera_id)
    if not cam_config:
        return jsonify({"status": "error", "message": f"Camera profile {camera_id} not registered."}), 404

    # Resolve video target stream dynamically from the JSON schema configuration
    video_target = data.get("video_path", os.path.join(BASE_DIR, "test_vedio", "sample1.mp4"))
    camera_label = cam_config["location_name"]

    if not os.path.exists(video_target):
        return jsonify({"status": "error", "message": f"Target clip video not found at path: {video_target}"}), 404

    def background_worker():
        engine = DetectionService()
        engine.run_inference(video_source=video_target, camera_id=camera_id)

    # Spawn background thread execution path
    threading.Thread(target=background_worker, daemon=True).start()

    return jsonify({
        "status": "processing_initiated",
        "camera_id": camera_id,
        "monitoring_location": camera_label,
        "target_stream": os.path.basename(video_target)
    }), 202


# NEW ROUTE: Fetch list of cameras dynamically for the React Dashboard frontend
@app.route('/api/cameras', methods=["GET"])
def get_all_registered_cameras():
    """Returns the JSON list of cameras for building interactive elements on React."""
    try:
        cameras = camera_manager.get_all_cameras()
        return jsonify(cameras), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# NEW ROUTE: Manually or Automatically trigger an ambulance dispatch from React
@app.route('/api/incidents/<string:camera_id>/dispatch', methods=["POST"])
def dispatch_emergency_services(camera_id):
    """Triggers ambulance routing using the 1-camera-per-area structure."""
    try:
        receipt = hospital_manager.request_ambulance_dispatch(camera_id)
        if receipt["status"] == "dispatched":
            return jsonify(receipt), 200
        return jsonify(receipt), 429  # Emergency assets busy or exhausted
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# MODIFIED PATH: Adjusted to match the unified prefix rule (/api/static/...)
@app.route('/api/static/snapshots/<path:filename>')
def serve_snapshot_images(filename):
    """Serves generated incident images directly to React UI img sources."""
    return send_from_directory(STATIC_SNAPSHOTS_DIR, filename)


if __name__ == '__main__':
    # Explicit execution configuration on port 5000
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)