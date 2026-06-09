class SeverityService:
    def __init__(self):
        # Configurable velocity cutoffs in meters per second
        self.LOW_SPEED_THRESHOLD = 2.0   # ~7.2 km/h
        self.HIGH_SPEED_THRESHOLD = 5.0  # ~18.0 km/h

    def evaluate_incident(self, speed_ms, iou=0.0):
        """
        Calculates impact force severity. Higher structural overlaps (IoU) 
        and high kinetic energy scale the danger level instantly.
        """
        if speed_ms >= self.HIGH_SPEED_THRESHOLD or iou > 0.40:
            return "HIGH"
        elif speed_ms >= self.LOW_SPEED_THRESHOLD:
            return "MEDIUM"
        return "LOW"