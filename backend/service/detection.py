import sys
import os
import cv2
import math
import time
import datetime
from collections import defaultdict, deque

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ultralytics import YOLO
from models.tracker import VehicleTracker
from database.queries import insert_incidents

class DetectionService:
    def __init__(self):
        # Configuration Parameters
        self.MIN_CONFIDENCE = 0.45
        self.PIXEL_TO_METER = 0.047
        self.VIDEO_FPS = 30.0
        self.SPEED_SMOOTHING_WINDOW = 6
        self.MIN_SPEED_FOR_BRAKE_CHECK = 1.5
        self.SUDDEN_BRAKE_DECEL_THRESHOLD = 3.0
        self.BRAKE_COOLDOWN_PER_VEHICLE = 4.0
        self.COLLISION_IOU_THRESHOLD = 0.10
        self.COLLISION_MIN_SPEED_BEFORE = 1.0
        self.ACCIDENT_LOCK_DURATION = 8.0
        self.SEVERITY_LOW_SPEED = 2.0
        self.SEVERITY_HIGH_SPEED = 5.0
        self.VEHICLE_CLASSES = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}

        # Paths
        self.BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        self.SNAPSHOT_FOLDER = os.path.normpath(os.path.join(self.BASE_DIR, "..", "static", "snapshots"))
        os.makedirs(self.SNAPSHOT_FOLDER, exist_ok=True)

        # Lazy load YOLO to avoid slowing app initialization
        print("Loading YOLO model components...")
        self.model = YOLO("yolov8m.pt")
        self.vehicle_tracker = VehicleTracker()

        # State Engines
        self.vehicle_history = defaultdict(lambda: deque(maxlen=20))
        self.raw_speed_history = defaultdict(lambda: deque(maxlen=self.SPEED_SMOOTHING_WINDOW))
        self.smoothed_speed = {}
        self.prev_smoothed_speed = {}
        self.last_brake_time = {}
        self.active_accidents = {}
        self.collision_pre_impact_speed = {}

    def calculate_iou(self, box_a, box_b):
        inter_x1 = max(box_a[0], box_b[0])
        inter_y1 = max(box_a[1], box_b[1])
        inter_x2 = min(box_a[2], box_b[2])
        inter_y2 = min(box_a[3], box_b[3])
        inter_w = max(0, inter_x2 - inter_x1)
        inter_h = max(0, inter_y2 - inter_y1)
        inter_area = inter_w * inter_h
        if inter_area == 0: return 0.0
        area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
        area_b = (box_b[2] - box_b[0]) * (box_b[3] - box_b[1])
        union_area = area_a + area_b - inter_area
        return inter_area / union_area if union_area > 0 else 0.0

    def pixel_displacement_to_ms(self, px_per_frame):
        return px_per_frame * self.PIXEL_TO_METER * self.VIDEO_FPS

    def get_smoothed_speed(self, v_id):
        history = self.raw_speed_history[v_id]
        return sum(history) / len(history) if history else 0.0

    def score_severity(self, speed_ms):
        if speed_ms >= self.SEVERITY_HIGH_SPEED: return "HIGH"
        if speed_ms >= self.SEVERITY_LOW_SPEED: return "MEDIUM"
        return "LOW"

    def direction_vector(self, history, window=5):
        if len(history) < window: return (0.0, 0.0)
        x0, y0 = history[-window]
        x1, y1 = history[-1]
        dx, dy = x1 - x0, y1 - y0
        mag = math.sqrt(dx**2 + dy**2)
        return (dx / mag, dy / mag) if mag > 1e-6 else (0.0, 0.0)

    def collision_type(self, dir_a, dir_b):
        dot = dir_a[0] * dir_b[0] + dir_a[1] * dir_b[1]
        if dot < -0.5: return "HEAD-ON"
        if dot > 0.5: return "REAR-END"
        return "SIDE-IMPACT"

    def save_snapshot(self, frame, label):
        filename = f"{label}_{int(time.time() * 1000)}.jpg"
        path = os.path.join(self.SNAPSHOT_FOLDER, filename)
        cv2.imwrite(path, frame)
        return f"static/snapshots/{filename}"

    def run_inference(self, video_source, camera_id="CAMERA-1"):
        """Executes full computer vision loop on targeted input stream."""
        cap = cv2.VideoCapture(video_source)
        if not cap.isOpened():
            print(f"[ERROR] Could not mount video source reference: {video_source}")
            return False

        actual_fps = cap.get(cv2.CAP_PROP_FPS)
        if actual_fps and actual_fps > 0:
            self.VIDEO_FPS = actual_fps

        print(f"[SYSTEM ENGINE] Processing video stream via {camera_id} at {self.VIDEO_FPS:.1f} FPS")

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break

            current_time = time.time()
            current_frame_ids = set()

            results = self.model(frame, verbose=False)
            detections = []
            for result in results:
                for box in result.boxes:
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    if cls in self.VEHICLE_CLASSES and conf > self.MIN_CONFIDENCE:
                        detections.append(list(map(int, box.xyxy[0])))

            tracked_vehicles = self.vehicle_tracker.update(detections)

            for vehicle in tracked_vehicles:
                v_id = vehicle["id"]
                bbox = vehicle["bbox"]
                cx, cy = vehicle["center"]
                current_frame_ids.add(v_id)

                hist = self.vehicle_history[v_id]
                px_disp = math.sqrt((cx - hist[-1][0])**2 + (cy - hist[-1][1])**2) if hist else 0.0
                hist.append((cx, cy))

                speed_ms = self.pixel_displacement_to_ms(px_disp)
                self.raw_speed_history[v_id].append(speed_ms)

                prev_speed = self.smoothed_speed.get(v_id, 0.0)
                self.prev_smoothed_speed[v_id] = prev_speed
                current_speed = self.get_smoothed_speed(v_id)
                self.smoothed_speed[v_id] = current_speed

                deceleration = prev_speed - current_speed

                # Brake Diagnostics Trigger Rule
                if (prev_speed >= self.MIN_SPEED_FOR_BRAKE_CHECK and 
                    deceleration >= self.SUDDEN_BRAKE_DECEL_THRESHOLD and 
                    (current_time - self.last_brake_time.get(v_id, 0.0)) > self.BRAKE_COOLDOWN_PER_VEHICLE and 
                    not any(v_id in pair for pair in self.active_accidents)):
                    
                    self.last_brake_time[v_id] = current_time
                    severity = self.score_severity(prev_speed)
                    snap_path = self.save_snapshot(frame, f"brake_{v_id}")

                    insert_incidents(
                        timestamps=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        vehicle_ids=str(v_id), severity=severity, snapshot=snap_path,
                        location=camera_id, status="PENDING", collision_distance=-1.0,
                        speed_before_collision=round(prev_speed, 2)
                    )

            # Intersection Collision Diagnostics Matrix
            for i in range(len(tracked_vehicles)):
                for j in range(i + 1, len(tracked_vehicles)):
                    v_a, v_b = tracked_vehicles[i], tracked_vehicles[j]
                    id_a, id_b = v_a["id"], v_b["id"]
                    pair_key = frozenset({id_a, id_b})

                    speed_a = self.smoothed_speed.get(id_a, 0.0)
                    speed_b = self.smoothed_speed.get(id_b, 0.0)
                    max_pre_impact = max(self.prev_smoothed_speed.get(id_a, speed_a), self.prev_smoothed_speed.get(id_b, speed_b))
                    iou = self.calculate_iou(v_a["bbox"], v_b["bbox"])

                    if pair_key in self.active_accidents:
                        if current_time < self.active_accidents[pair_key]: continue
                        else:
                            self.active_accidents.pop(pair_key, None)
                            self.collision_pre_impact_speed.pop(pair_key, None)

                    if iou >= self.COLLISION_IOU_THRESHOLD and max_pre_impact >= self.COLLISION_MIN_SPEED_BEFORE:
                        self.active_accidents[pair_key] = current_time + self.ACCIDENT_LOCK_DURATION
                        self.collision_pre_impact_speed[pair_key] = max_pre_impact

                        severity = self.score_severity(max_pre_impact)
                        col_type = self.collision_type(self.direction_vector(self.vehicle_history[id_a]), self.direction_vector(self.vehicle_history[id_b]))
                        meter_dist = math.sqrt((v_b["center"][0] - v_a["center"][0])**2 + (v_b["center"][1] - v_a["center"][1])**2) * self.PIXEL_TO_METER
                        snap_path = self.save_snapshot(frame, f"accident_{id_a}_{id_b}")

                        insert_incidents(
                            timestamps=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            vehicle_ids=f"{id_a},{id_b}", severity=severity, snapshot=snap_path,
                            location=camera_id, status="PENDING", collision_distance=round(meter_dist, 3),
                            speed_before_collision=round(max_pre_impact, 3)
                        )

            # Memory Garbage Collection Cycle
            for dead_id in (set(self.vehicle_history.keys()) - current_frame_ids):
                self.vehicle_history.pop(dead_id, None)
                self.raw_speed_history.pop(dead_id, None)
                self.smoothed_speed.pop(dead_id, None)
                self.prev_smoothed_speed.pop(dead_id, None)
                self.last_brake_time.pop(dead_id, None)

        cap.release()
        print(f"[SYSTEM ENGINE] Stream complete processing for {camera_id}.")
        return True