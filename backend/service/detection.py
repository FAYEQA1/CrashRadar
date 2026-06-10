import os
import sys
import cv2
import math
import time
import datetime
from collections import defaultdict, deque

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ultralytics import YOLO
from models.tracker import VehicleTracker
from database.queries import insert_incidents


MIN_CONFIDENCE           = 0.45
PIXEL_TO_METER           = 0.047
VIDEO_FPS                = 30.0
SPEED_SMOOTHING_WINDOW   = 6
MIN_SPEED_FOR_BRAKE_CHECK    = 1.5
SUDDEN_BRAKE_DECEL_THRESHOLD = 3.0
BRAKE_COOLDOWN_PER_VEHICLE   = 4.0
COLLISION_IOU_THRESHOLD         = 0.25   # for car/bus/truck pairs — reduces false side-pass triggers
COLLISION_IOU_THRESHOLD_MOTO    = 0.06
COLLISION_MIN_SPEED_BEFORE   = 1.0
ACCIDENT_LOCK_DURATION       = 8.0
SEVERITY_LOW_SPEED  = 2.0
SEVERITY_HIGH_SPEED = 5.0
VEHICLE_CLASSES = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}

BASE_DIR        = os.path.dirname(os.path.abspath(__file__))
SNAPSHOT_FOLDER = os.path.join(BASE_DIR, "..", "static", "snapshots")
os.makedirs(SNAPSHOT_FOLDER, exist_ok=True)


def calculate_iou(box_a, box_b):
    ix1 = max(box_a[0], box_b[0]); iy1 = max(box_a[1], box_b[1])
    ix2 = min(box_a[2], box_b[2]); iy2 = min(box_a[3], box_b[3])
    iw, ih = max(0, ix2 - ix1), max(0, iy2 - iy1)
    inter = iw * ih
    if inter == 0: return 0.0
    area_a = (box_a[2]-box_a[0])*(box_a[3]-box_a[1])
    area_b = (box_b[2]-box_b[0])*(box_b[3]-box_b[1])
    union  = area_a + area_b - inter
    return inter / union if union > 0 else 0.0

def pixel_displacement_to_ms(px, fps): return px * PIXEL_TO_METER * fps
def now_str(): return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
def ms_to_kmh(ms): return ms * 3.6

def score_severity(speed_ms):
    if speed_ms >= SEVERITY_HIGH_SPEED: return "HIGH"
    elif speed_ms >= SEVERITY_LOW_SPEED: return "MEDIUM"
    return "LOW"

def direction_vector(history, window=5):
    if len(history) < window: return (0.0, 0.0)
    x0,y0 = history[-window]; x1,y1 = history[-1]
    dx,dy = x1-x0, y1-y0
    mag = math.sqrt(dx**2+dy**2)
    return (dx/mag, dy/mag) if mag > 1e-6 else (0.0, 0.0)

def collision_type(dir_a, dir_b):
    dot = dir_a[0]*dir_b[0]+dir_a[1]*dir_b[1]
    if dot < -0.5: return "HEAD-ON"
    elif dot > 0.5: return "REAR-END"
    return "SIDE-IMPACT"

def save_snapshot(frame, label):
    filename = f"{label}_{int(time.time()*1000)}.jpg"
    path = os.path.join(SNAPSHOT_FOLDER, filename)
    cv2.imwrite(path, frame)
    return path


class DetectionService:
    def run_inference(self, video_source: str, camera_id: str = "CAMERA-1"):
        fps = VIDEO_FPS

        vehicle_history       = defaultdict(lambda: deque(maxlen=20))
        raw_speed_history     = defaultdict(lambda: deque(maxlen=SPEED_SMOOTHING_WINDOW))
        smoothed_speed        = {}
        prev_smoothed_speed   = {}
        vehicle_class         = {}
        last_brake_time       = {}
        active_accidents      = {}
        collision_pre_impact_speed = {}
        total_seen_ids        = set()

        print("Loading YOLO model...")
        model = YOLO("yolov8m.pt")
        tracker = VehicleTracker()

        cap = cv2.VideoCapture(video_source)
        if not cap.isOpened():
            print(f"ERROR: Cannot open video: {video_source}")
            return

        actual_fps = cap.get(cv2.CAP_PROP_FPS)
        if actual_fps and actual_fps > 0:
            fps = actual_fps

        print(f"Detection started on {video_source} @ {fps:.1f} FPS")

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            current_time = time.time()
            current_frame_ids = set()

            results = model(frame, verbose=False)
            detections = []
            for result in results:
                for box in result.boxes:
                    cls  = int(box.cls[0])
                    conf = float(box.conf[0])
                    if cls in VEHICLE_CLASSES and conf > MIN_CONFIDENCE:
                        detections.append(list(map(int, box.xyxy[0])))

            tracked_vehicles = tracker.update(detections)

            for vehicle in tracked_vehicles:
                v_id   = vehicle["id"]
                bbox   = vehicle["bbox"]
                cx, cy = vehicle["center"]
                current_frame_ids.add(v_id)

                hist = vehicle_history[v_id]
                px_disp = math.sqrt((cx-hist[-1][0])**2+(cy-hist[-1][1])**2) if hist else 0.0
                hist.append((cx, cy))

                raw_speed_history[v_id].append(pixel_displacement_to_ms(px_disp, fps))
                buf = raw_speed_history[v_id]

                prev_speed = smoothed_speed.get(v_id, 0.0)
                prev_smoothed_speed[v_id] = prev_speed
                current_speed = sum(buf)/len(buf) if buf else 0.0
                smoothed_speed[v_id] = current_speed
                deceleration = prev_speed - current_speed

                warmed_up = len(buf) >= SPEED_SMOOTHING_WINDOW
                x1,y1,x2,y2 = bbox

                if (warmed_up
                    and prev_speed >= MIN_SPEED_FOR_BRAKE_CHECK
                    and deceleration >= SUDDEN_BRAKE_DECEL_THRESHOLD
                    and (current_time - last_brake_time.get(v_id, 0.0)) > BRAKE_COOLDOWN_PER_VEHICLE
                    and not any(v_id in pair for pair in active_accidents)):

                    last_brake_time[v_id] = current_time
                    severity  = score_severity(prev_speed)
                    snap_path = save_snapshot(frame, f"brake_{v_id}")
                    print(f"[BRAKE] ID:{v_id}  decel={ms_to_kmh(deceleration):.1f}km/h  severity={severity}")
                    insert_incidents(
                        timestamps=now_str(), vehicle_ids=str(v_id),
                        severity=severity, snapshot=snap_path,
                        location=camera_id, status="PENDING",
                        collision_distance=-1.0,
                        speed_before_collision=round(prev_speed, 2),
                    )

            for i in range(len(tracked_vehicles)):
                for j in range(i+1, len(tracked_vehicles)):
                    v_a, v_b   = tracked_vehicles[i], tracked_vehicles[j]
                    id_a, id_b = v_a["id"], v_b["id"]
                    pair_key   = frozenset({id_a, id_b})

                    if pair_key in active_accidents:
                        if current_time < active_accidents[pair_key]:
                            continue
                        else:
                            active_accidents.pop(pair_key, None)
                            collision_pre_impact_speed.pop(pair_key, None)

                    iou = calculate_iou(v_a["bbox"], v_b["bbox"])
                    pre_a = prev_smoothed_speed.get(id_a, smoothed_speed.get(id_a, 0.0))
                    pre_b = prev_smoothed_speed.get(id_b, smoothed_speed.get(id_b, 0.0))
                    max_speed = max(pre_a, pre_b)
                    both_warmed = (len(raw_speed_history[id_a]) >= SPEED_SMOOTHING_WINDOW and
                                   len(raw_speed_history[id_b]) >= SPEED_SMOOTHING_WINDOW)

                    if iou >= COLLISION_IOU_THRESHOLD and max_speed >= COLLISION_MIN_SPEED_BEFORE and both_warmed:
                        active_accidents[pair_key] = current_time + ACCIDENT_LOCK_DURATION
                        severity  = score_severity(max_speed)
                        dir_a     = direction_vector(vehicle_history[id_a])
                        dir_b     = direction_vector(vehicle_history[id_b])
                        col_type  = collision_type(dir_a, dir_b)
                        cx_a,cy_a = v_a["center"]; cx_b,cy_b = v_b["center"]
                        meter_dist = math.sqrt((cx_b-cx_a)**2+(cy_b-cy_a)**2) * PIXEL_TO_METER
                        snap_path = save_snapshot(frame, f"accident_{id_a}_{id_b}")
                        print(f"[ACCIDENT] IDs:{id_a}&{id_b}  type={col_type}  IoU={iou:.3f}  severity={severity}")
                        insert_incidents(
                            timestamps=now_str(), vehicle_ids=f"{id_a},{id_b}",
                            severity=severity, snapshot=snap_path,
                            location=camera_id, status="PENDING",
                            collision_distance=round(meter_dist, 3),
                            speed_before_collision=round(max_speed, 3),
                        )

            stale_ids = set(vehicle_history.keys()) - current_frame_ids
            for dead_id in stale_ids:
                vehicle_history.pop(dead_id, None)
                raw_speed_history.pop(dead_id, None)
                smoothed_speed.pop(dead_id, None)
                prev_smoothed_speed.pop(dead_id, None)
                last_brake_time.pop(dead_id, None)

        cap.release()
        print("Detection complete.")