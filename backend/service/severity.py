class SeverityService:
    def __init__(self):
        # Configurable velocity cutoffs in meters per second
        self.LOW_SPEED_THRESHOLD      = 2.0   # ~7.2 km/h
        self.MEDIUM_SPEED_THRESHOLD   = 5.0   # ~18.0 km/h
        self.HIGH_SPEED_THRESHOLD     = 8.0   # ~28.8 km/h — above this + collision = CRITICAL

    def evaluate_incident(self, speed_ms, iou=0.0, is_collision=False):
        """
        Calculates impact severity. CRITICAL is reserved for actual
        collisions (iou > 0 or is_collision=True) at high speed or
        severe structural overlap — a solo hard-brake event, no matter
        how fast, tops out at HIGH.
        """
        collision_detected = is_collision or iou > 0.0

        if collision_detected and (speed_ms >= self.HIGH_SPEED_THRESHOLD or iou > 0.60):
            return "CRITICAL"
        elif speed_ms >= self.HIGH_SPEED_THRESHOLD or iou > 0.40:
            return "HIGH"
        elif speed_ms >= self.MEDIUM_SPEED_THRESHOLD:
            return "MEDIUM"
        elif speed_ms >= self.LOW_SPEED_THRESHOLD:
            return "LOW"
        return "LOW"