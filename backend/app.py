import os
import threading
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from database.models import initialize_database
from database.queries import get_all_incidents, update_incident_status
from service.detection import DetectionService

app = Flask(__name__)
# Enable CORS so your React frontend can query endpoints on port 5000
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Auto-initialize SQLite data structures on app start
initialize_database()

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
        for r in records:
            incidents_list.append({
                "id": r[0],
                "timestamp": r[1],
                "vehicle_ids": r[2],
                "severity": r[3],
                "snapshot_url": f"http://localhost:5000/static/snapshots/{os.path.basename(r[4])}" if r[4] else None,
                "location": r[5],
                "status": r[6],
                "collision_distance_m": r[7],
                "speed_before_collision_ms": r[8],
                "created_at": r[9]
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
    Spawns the analytical processing script on a dedicated background thread 
    to prevent blocking HTTP operations.
    """
    data = request.get_json() or {}
    # Use your defined sample video path as the default fallback
    video_target = data.get("video_path", os.path.join(BASE_DIR, "test_videos", "sample.mp4"))
    camera_label = data.get("location_label", "CAMERA-MAIN-INT")

    if not os.path.exists(video_target):
        return jsonify({"status": "error", "message": f"Target clip video not found at path: {video_target}"}), 404

    def background_worker():
        engine = DetectionService()
        engine.run_inference(video_source=video_target, camera_id=camera_label)

    # Spawn background thread execution path
    threading.Thread(target=background_worker, daemon=True).start()

    return jsonify({
        "status": "processing_initiated",
        "target_stream": os.path.basename(video_target),
        "monitoring_location": camera_label
    }), 202

@app.route('/static/snapshots/<path:filename>')
def serve_snapshot_images(filename):
    """Serves generated incident images directly to React UI img sources."""
    return send_from_directory(STATIC_SNAPSHOTS_DIR, filename)

if __name__ == '__main__':
    # Explicit execution configuration on port 5000
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)