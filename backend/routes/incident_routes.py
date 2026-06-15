from flask import Blueprint, jsonify, request
from service.hospital_service import HospitalService


from database.queries import (
    get_all_incidents,
    get_incident_by_id,
    update_incident_status,
    delete_incident,
    get_incidents_by_severity,
    get_incident_stats,
    update_incident_dispatch_hospital
)

incident_bp = Blueprint('incident_bp', __name__)


def serialize_incident(r):
    return {
        "id": r[0],
        "timestamp": r[1],
        "vehicle_ids": r[2],
        "severity": r[3],
        "snapshot": r[4],
        "location": r[5],
        "status": r[6],
        "collision_distance": r[7],
        "speed_before_collision": r[8],
        "vehicle_type": r[9] if len(r) > 9 else None,
        "dispatched_hospital": r[10] if len(r) > 10 else None,
        "created_at": r[11] if len(r) > 11 else r[1],  # fallback to timestamps for old rows
    }


@incident_bp.route('/api/incidents', methods=['GET'])
def fetch_all():
    records = get_all_incidents()
    return jsonify([serialize_incident(r) for r in records]), 200


@incident_bp.route('/api/incidents/<int:inc_id>', methods=['GET'])
def fetch_by_id(inc_id):
    r = get_incident_by_id(inc_id)
    if not r:
        return jsonify({"error": "Incident not found"}), 404

    return jsonify(serialize_incident(r)), 200


# ──────────────────────────────────────────────────────────
# CRITICAL SECTION
# ──────────────────────────────────────────────────────────

@incident_bp.route('/api/incidents/critical', methods=['GET'])
def fetch_critical():
    """All incidents flagged CRITICAL (high-speed collisions)."""
    records = get_incidents_by_severity("CRITICAL")
    return jsonify([serialize_incident(r) for r in records]), 200


@incident_bp.route('/api/incidents/stats', methods=['GET'])
def fetch_stats():
    """Counts for dashboard stat cards: total / critical / high / medium / low."""
    return jsonify(get_incident_stats()), 200


# ──────────────────────────────────────────────────────────

@incident_bp.route('/api/incidents/<int:inc_id>/status', methods=['PUT'])
def update_status(inc_id):
    data = request.get_json() or {}
    new_status = data.get('status')

    if not new_status:
        return jsonify({"error": "Status parameter required"}), 400

    if not get_incident_by_id(inc_id):
        return jsonify({"error": "Incident not found"}), 404

    update_incident_status(inc_id, new_status.upper())
    return jsonify({"message": "Status updated successfully", "incident_id": inc_id}), 200


@incident_bp.route('/api/incidents/<int:inc_id>', methods=['DELETE'])
def remove_log(inc_id):
    if not get_incident_by_id(inc_id):
        return jsonify({"error": "Incident not found"}), 404

    delete_incident(inc_id)
    return jsonify({"message": f"Incident {inc_id} removed from tracking registry"}), 200

@incident_bp.route('/api/hospitals/reset', methods=['POST'])
def reset_hospitals():
    hospitals = HospitalService().reset_ambulance_availability()
    return jsonify({"message": "Ambulance availability reset", "hospitals": hospitals}), 200

@incident_bp.route('/api/hospitals/nearest/<string:camera_id>', methods=['GET'])
def nearest_hospitals(camera_id):
    hospitals = HospitalService().get_nearest_hospitals(camera_id, limit=3)
    return jsonify(hospitals), 200