import time
import threading
from database.queries import get_all_incidents, update_incident_status,update_incident_dispatch_hospital
from service.hospital_service import HospitalService
from service.alert_service import AlertService
from service.dispatch_service import DispatchService


class IncidentQueueWorker:
    """
    Polls the INCIDENTS table for new PENDING incidents with
    CRITICAL or HIGH severity, and for each one:
      1. Broadcasts an emergency alert (AlertService)
      2. Requests an ambulance dispatch (HospitalService)
      3. Logs the dispatch outcome to disk (DispatchService)
      4. Updates the incident's status in the DB
    """

    DISPATCH_SEVERITIES = ("CRITICAL", "HIGH")
    POLL_INTERVAL_SECONDS = 5

    def __init__(self):
        self.hospital_service = HospitalService()
        self.alert_service    = AlertService()
        self.dispatch_service = DispatchService()
        self._processed_ids   = set()
        self._running         = False

    def start_processing(self):
        self._running = True
        thread = threading.Thread(target=self._loop, daemon=True)
        thread.start()
        print("[QUEUE WORKER] Started incident dispatch worker.")

    def stop_processing(self):
        self._running = False

    def _loop(self):
        while self._running:
            try:
                self._process_pending_incidents()
            except Exception as e:
                print(f"[QUEUE WORKER ERROR] {e}")
            time.sleep(self.POLL_INTERVAL_SECONDS)

    def _process_pending_incidents(self):
        records = get_all_incidents()

        # Column order: id, timestamps, vehicle_ids, severity, snapshot,
        # location, status, collision_distance, speed_before_collision,
        # vehicle_type, created_at
        for r in records:
            incident_id = r[0]
            severity    = r[3]
            camera_id   = r[5]
            status      = r[6]

            if incident_id in self._processed_ids:
                continue
            if status != "PENDING":
                continue
            if severity not in self.DISPATCH_SEVERITIES:
                continue

            self._handle_incident(r)
            self._processed_ids.add(incident_id)

    def _handle_incident(self, record):
        incident_id = record[0]
        severity    = record[3]
        camera_id   = record[5]

        # ── 1. Broadcast alert ──────────────────────────────
        self.alert_service.dispatch_emergency_alert(record)

        # ── 2. Request ambulance dispatch ───────────────────
        receipt = self.hospital_service.request_ambulance_dispatch(camera_id)

        # ── 3. Log outcome ───────────────────────────────────
        if receipt["status"] == "dispatched":
            hospital_name = receipt["hospital_details"]["name"]
            self.dispatch_service.log_dispatch_action(
                incident_id, hospital_name, status="DISPATCHED"
            )
            print(
                f"[DISPATCH] Incident #{incident_id} ({severity}) → {hospital_name} "
                f"({receipt['remaining_ambulances']} ambulances remaining)"
            )
            update_incident_status(incident_id, "DISPATCHED")
        else:
            self.dispatch_service.log_dispatch_action(
                incident_id, hospital_name="N/A", status="FAILED"
            )
            print(f"[DISPATCH FAILED] Incident #{incident_id} ({severity}) — {receipt.get('message')}")
            update_incident_status(incident_id, "DISPATCH_FAILED")