import requests

class AlertService:
    @staticmethod
    def dispatch_emergency_alert(incident_data):
        """
        Formats warning payload logs. Can be hooked up to Twilio/SMS 
        or an external API gateway.
        """
        payload = {
            "alert_type": "CRITICAL_TRAFFIC_ACCIDENT",
            "timestamp": incident_data[1],
            "camera": incident_data[5],
            "severity": incident_data[3],
            "visual_evidence": incident_data[4]
        }
        print(f"[ALERT BROADCAST SENT]: {payload}")
        return True