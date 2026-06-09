import time
import threading
from queue import alert_queue
from service.dispatch_service import DispatchService
from service.hospital_service import HospitalService

class IncidentQueueWorker:
    def __init__(self):
        self.queue_broker = alert_queue.AlertQueue()
        self.dispatcher = DispatchService()
        self.medical_lookup = HospitalService()
        self.is_running = False

    def start_processing(self):
        """Spawns the loop container explicitly on an isolated daemon process layer."""
        if self.is_running:
            return
        self.is_running = True
        worker_thread = threading.Thread(target=self._worker_loop, daemon=True)
        worker_thread.start()
        print("[QUEUE WORKER ENGINE] Background worker processing loop mounted successfully.")

    def _worker_loop(self):
        while self.is_running:
            try:
                # Blocks cleanly until an event enters the queue registry
                payload = self.queue_broker.pop_incident()
                
                print(f"[WORKER PROCESSING] Evaluating queued incident ID: {payload.get('incident_id')}")
                
                camera_id = payload.get("camera_id", "CAMERA-1")
                incident_id = payload.get("incident_id")
                
                # Fetch closest dispatch center using your 1-camera-per-area mapping rules
                assigned_unit = self.medical_lookup.get_hospital_by_camera(camera_id)
                
                if assigned_unit:
                    # Write down to your dispatch log file
                    self.dispatcher.log_dispatch_action(
                        incident_id=incident_id,
                        hospital_name=assigned_unit["name"],
                        status="RESPONDING_EMERGENCY"
                    )
                
                # Acknowledge completion
                self.queue_broker.task_complete()
                
            except Exception as e:
                print(f"[QUEUE WORKER EXCEPTION] Error compiling queued task: {e}")
                time.sleep(2) # Prevent rapid error cycling