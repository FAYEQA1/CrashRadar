import os
import datetime

class DispatchService:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.log_path = os.path.normpath(os.path.join(self.base_dir, "..", "logs", "dispatch.log"))
        
        # Ensure the log folder container is safely constructed
        os.makedirs(os.path.dirname(self.log_path), exist_ok=True)

    def log_dispatch_action(self, incident_id, hospital_name, status="DISPATCHED"):
        """Appends structured audit tracking lines directly to the log file."""
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] [INCIDENT_ID: {incident_id}] -> Unit Assigned: {hospital_name} | Action Status: {status}\n"
        
        with open(self.log_path, "a") as log_file:
            log_file.write(log_entry)
            
        print(f"[DISPATCH LOG REGISTERED] {log_entry.strip()}")