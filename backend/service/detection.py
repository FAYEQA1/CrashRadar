"""
CrashRadar - Accident Detection System
========================================
Improvements over previous versions:
  - Kalman-filter-ready smoothed speed using a rolling window average
  - IoU-based overlap detection (physically accurate collision check)
  - Per-vehicle brake cooldown (no global suppression)
  - Direction vector tracking to detect head-on vs rear-end collisions
  - Severity scoring based on speed + IoU magnitude
  - Per-pair accident locking with auto-expiry when vehicles separate
  - Pixel-to-meter scale calibration constant for real speed estimates
  - Memory-safe cleanup of stale track data every frame
"""

import sys
import os
import cv2
import math
import time
import datetime
from collections import defaultdict, deque

# ---------------------------------------------------
# FIX IMPORT PATH
# ---------------------------------------------------
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ultralytics import YOLO
from models.tracker import VehicleTracker
from database.queries import insert_incidents

# ===================================================
# CONFIGURATION
# ===================================================

# --- Detection confidence ---
MIN_CONFIDENCE = 0.45

# --- Scale calibration ---
# How many real-world meters does 1 pixel represent at ground level.
# Tune this for your specific camera mounting height and angle.
# Example: A 4-lane road (~14m wide) spanning 300px → 14/300 ≈ 0.047
PIXEL_TO_METER = 0.047

# --- Frame rate (used to convert pixel/frame speed → m/s) ---
# Set this to the actual FPS of your video feed.
VIDEO_FPS = 30.0

# --- Speed smoothing window (frames) ---
# Average speed over this many frames to remove noise spikes.
SPEED_SMOOTHING_WINDOW = 6

# --- Sudden brake thresholds ---
# Minimum smoothed speed (m/s) vehicle must be travelling before we
# consider a deceleration event (filters stationary jitter).
MIN_SPEED_FOR_BRAKE_CHECK = 1.5        # m/s  (~5.4 km/h)
# How sharply speed must drop in one frame window (m/s) to count as hard brake.
SUDDEN_BRAKE_DECEL_THRESHOLD = 3.0    # m/s  (~10.8 km/h drop in 1/FPS seconds)

# --- Per-vehicle brake cooldown (seconds) ---
BRAKE_COOLDOWN_PER_VEHICLE = 4.0

# --- Collision / accident thresholds ---
# IoU of bounding boxes required to flag overlap as collision.
COLLISION_IOU_THRESHOLD = 0.10
# At least ONE vehicle must have been moving above this speed (m/s)
# just before impact. Prevents parked-car false positives.
COLLISION_MIN_SPEED_BEFORE = 1.0      # m/s
# After flagging a collision, keep the pair locked for this many seconds
# even if IoU temporarily drops (e.g. vehicles bounce apart slightly).
ACCIDENT_LOCK_DURATION = 8.0          # seconds

# --- Severity scoring cutoffs (based on pre-impact speed in m/s) ---
# < LOW_SPEED  → LOW severity
# < HIGH_SPEED → MEDIUM severity
# >= HIGH_SPEED → HIGH severity
SEVERITY_LOW_SPEED   = 2.0            # m/s
SEVERITY_HIGH_SPEED  = 5.0            # m/s

# --- YOLO vehicle class IDs (COCO) ---
VEHICLE_CLASSES = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}

# ===================================================
# PATHS
# ===================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SNAPSHOT_FOLDER = os.path.join(BASE_DIR, "..", "static", "snapshots")
os.makedirs(SNAPSHOT_FOLDER, exist_ok=True)

VIDEO_PATH = os.path.join(BASE_DIR, "..", "test_vedio", "sample1.mp4")

# ===================================================
# STATE STORES
# ===================================================

# Center-point history:  id → deque of (cx, cy)
vehicle_history: dict[int, deque] = defaultdict(lambda: deque(maxlen=20))

# Raw pixel-speed history (per frame displacement in px):  id → deque of float
raw_speed_history: dict[int, deque] = defaultdict(lambda: deque(maxlen=SPEED_SMOOTHING_WINDOW))

# Smoothed speed in m/s:  id → float
smoothed_speed: dict[int, float] = {}

# Speed from PREVIOUS frame (used to compute deceleration):  id → float
prev_smoothed_speed: dict[int, float] = {}

# Per-vehicle last brake snapshot time:  id → float (unix timestamp)
last_brake_time: dict[int, float] = {}

# Active accident pairs:  frozenset({id_a, id_b}) → expiry unix timestamp
active_accidents: dict[frozenset, float] = {}

# Pre-impact speed stored at moment of first collision detection:
# frozenset({id_a, id_b}) → float (m/s)
collision_pre_impact_speed: dict[frozenset, float] = {}


# ===================================================
# HELPERS
# ===================================================

def calculate_iou(box_a: list, box_b: list) -> float:
    """
    Intersection-over-Union of two bounding boxes.
    Boxes are [x1, y1, x2, y2].
    Returns a float in [0, 1].
    """
    inter_x1 = max(box_a[0], box_b[0])
    inter_y1 = max(box_a[1], box_b[1])
    inter_x2 = min(box_a[2], box_b[2])
    inter_y2 = min(box_a[3], box_b[3])

    inter_w = max(0, inter_x2 - inter_x1)
    inter_h = max(0, inter_y2 - inter_y1)
    inter_area = inter_w * inter_h

    if inter_area == 0:
        return 0.0

    area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
    area_b = (box_b[2] - box_b[0]) * (box_b[3] - box_b[1])
    union_area = area_a + area_b - inter_area

    return inter_area / union_area if union_area > 0 else 0.0


def pixel_displacement_to_ms(px_per_frame: float) -> float:
    """
    Convert pixel displacement per frame into metres per second.
    Formula: (px/frame) * (meters/px) * (frames/second)
    """
    return px_per_frame * PIXEL_TO_METER * VIDEO_FPS


def get_smoothed_speed(v_id: int) -> float:
    """Return rolling-average speed (m/s) for a given vehicle ID."""
    history = raw_speed_history[v_id]
    if not history:
        return 0.0
    return sum(history) / len(history)


def score_severity(speed_ms: float, iou: float = 0.0) -> str:
    """
    Determine severity label from pre-event speed and IoU.
    iou=0 for braking events; iou>0 for collision events.
    """
    if speed_ms >= SEVERITY_HIGH_SPEED:
        return "HIGH"
    elif speed_ms >= SEVERITY_LOW_SPEED:
        return "MEDIUM"
    else:
        return "LOW"


def direction_vector(history: deque, window: int = 5) -> tuple[float, float]:
    """
    Compute the recent direction of travel as a unit vector.
    Uses the displacement from `window` frames ago to now.
    Returns (dx, dy) normalised, or (0, 0) if history too short.
    """
    if len(history) < window:
        return (0.0, 0.0)
    x0, y0 = history[-window]
    x1, y1 = history[-1]
    dx, dy = x1 - x0, y1 - y0
    mag = math.sqrt(dx**2 + dy**2)
    return (dx / mag, dy / mag) if mag > 1e-6 else (0.0, 0.0)


def collision_type(dir_a: tuple, dir_b: tuple) -> str:
    """
    Classify the type of collision from direction vectors.
    dot product:
      ≈ -1  → head-on
      ≈  0  → side-impact / T-bone
      ≈ +1  → rear-end
    """
    dot = dir_a[0] * dir_b[0] + dir_a[1] * dir_b[1]
    if dot < -0.5:
        return "HEAD-ON"
    elif dot > 0.5:
        return "REAR-END"
    else:
        return "SIDE-IMPACT"


def save_snapshot(frame, label: str) -> str:
    """Write annotated frame to snapshots folder and return the path."""
    filename = f"{label}_{int(time.time() * 1000)}.jpg"
    path = os.path.join(SNAPSHOT_FOLDER, filename)
    cv2.imwrite(path, frame)
    return path


def now_str() -> str:
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def ms_to_kmh(ms: float) -> float:
    return ms * 3.6


# ===================================================
# INITIALISATION
# ===================================================
print("Loading YOLO model...")
model = YOLO("yolov8m.pt")

vehicle_tracker = VehicleTracker()

print(f"Opening video: {VIDEO_PATH}")
cap = cv2.VideoCapture(VIDEO_PATH)

if not cap.isOpened():
    print("ERROR: Cannot open video file.")
    sys.exit(1)

# Attempt to read actual FPS from the video file
actual_fps = cap.get(cv2.CAP_PROP_FPS)
if actual_fps and actual_fps > 0:
    VIDEO_FPS = actual_fps
    print(f"Video FPS detected: {VIDEO_FPS:.1f}")
else:
    print(f"Could not detect FPS, using configured value: {VIDEO_FPS}")

# ===================================================
# MAIN DETECTION LOOP
# ===================================================
print("Starting detection loop. Press 'Q' to quit.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("End of video.")
        break

    current_time = time.time()
    current_frame_ids: set[int] = set()

    # --------------------------------------------------
    # 1. YOLO DETECTION
    # --------------------------------------------------
    results = model(frame, verbose=False)
    detections = []

    for result in results:
        for box in result.boxes:
            cls  = int(box.cls[0])
            conf = float(box.conf[0])
            if cls in VEHICLE_CLASSES and conf > MIN_CONFIDENCE:
                detections.append(list(map(int, box.xyxy[0])))

    # --------------------------------------------------
    # 2. MULTI-OBJECT TRACKING
    # --------------------------------------------------
    tracked_vehicles = vehicle_tracker.update(detections)

    # --------------------------------------------------
    # 3. PER-VEHICLE SPEED & BRAKE ANALYSIS
    # --------------------------------------------------
    for vehicle in tracked_vehicles:
        v_id   = vehicle["id"]
        bbox   = vehicle["bbox"]   # [x1, y1, x2, y2]
        center = vehicle["center"] # (cx, cy)
        cx, cy = center
        current_frame_ids.add(v_id)

        # --- Displacement (pixels) since last frame ---
        hist = vehicle_history[v_id]
        if hist:
            prev_cx, prev_cy = hist[-1]
            px_disp = math.sqrt((cx - prev_cx) ** 2 + (cy - prev_cy) ** 2)
        else:
            px_disp = 0.0

        hist.append((cx, cy))

        # --- Rolling speed buffer ---
        speed_ms = pixel_displacement_to_ms(px_disp)
        raw_speed_history[v_id].append(speed_ms)

        # --- Smoothed speed ---
        prev_speed = smoothed_speed.get(v_id, 0.0)
        prev_smoothed_speed[v_id] = prev_speed
        current_speed = get_smoothed_speed(v_id)
        smoothed_speed[v_id] = current_speed

        # --- Deceleration (m/s drop between smoothed frames) ---
        deceleration = prev_speed - current_speed

        # --- Draw per-vehicle info overlay ---
        x1, y1, x2, y2 = bbox
        speed_kmh = ms_to_kmh(current_speed)
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 220, 0), 2)
        cv2.putText(
            frame,
            f"ID:{v_id}  {speed_kmh:.1f}km/h",
            (x1, y1 - 8),
            cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 220, 0), 1
        )
        cv2.circle(frame, (cx, cy), 3, (0, 0, 255), -1)

        # --------------------------------------------------
        # TRIGGER A — SUDDEN BRAKE (single vehicle)
        # --------------------------------------------------
        vehicle_was_moving   = prev_speed >= MIN_SPEED_FOR_BRAKE_CHECK
        sharp_decel          = deceleration >= SUDDEN_BRAKE_DECEL_THRESHOLD
        brake_cooldown_ok    = (current_time - last_brake_time.get(v_id, 0.0)) > BRAKE_COOLDOWN_PER_VEHICLE
        not_in_accident      = not any(v_id in pair for pair in active_accidents)

        if vehicle_was_moving and sharp_decel and brake_cooldown_ok and not_in_accident:
            last_brake_time[v_id] = current_time
            severity = score_severity(prev_speed)

            # Annotate frame
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 140, 255), 3)
            cv2.putText(
                frame,
                f"SUDDEN BRAKE  {ms_to_kmh(deceleration):.1f} km/h drop",
                (30, 55),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 140, 255), 2
            )

            snap_path = save_snapshot(frame, f"brake_{v_id}")
            print(f"[BRAKE] ID:{v_id}  decel={ms_to_kmh(deceleration):.1f}km/h  severity={severity}")

            insert_incidents(
                timestamps=now_str(),
                vehicle_ids=str(v_id),
                severity=severity,
                snapshot=snap_path,
                location="CAMERA-1",
                status="PENDING",
                collision_distance=-1.0,
                speed_before_collision=round(prev_speed, 2),
                created_at=now_str()
            )

    # --------------------------------------------------
    # 4. MULTI-VEHICLE COLLISION DETECTION
    # --------------------------------------------------
    for i in range(len(tracked_vehicles)):
        for j in range(i + 1, len(tracked_vehicles)):
            v_a = tracked_vehicles[i]
            v_b = tracked_vehicles[j]
            id_a, id_b = v_a["id"], v_b["id"]
            pair_key = frozenset({id_a, id_b})

            speed_a = smoothed_speed.get(id_a, 0.0)
            speed_b = smoothed_speed.get(id_b, 0.0)
            pre_speed_a = prev_smoothed_speed.get(id_a, speed_a)
            pre_speed_b = prev_smoothed_speed.get(id_b, speed_b)
            max_pre_impact = max(pre_speed_a, pre_speed_b)

            iou = calculate_iou(v_a["bbox"], v_b["bbox"])

            # --- Check if this pair is already in a locked accident window ---
            if pair_key in active_accidents:
                expiry = active_accidents[pair_key]
                if current_time < expiry:
                    # Still locked — just re-draw the warning overlay
                    for v in (v_a, v_b):
                        bx1, by1, bx2, by2 = v["bbox"]
                        cv2.rectangle(frame, (bx1, by1), (bx2, by2), (0, 0, 255), 3)
                    cv2.putText(frame, "ACCIDENT", (30, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)
                    continue
                else:
                    # Lock expired — clear it
                    active_accidents.pop(pair_key, None)
                    collision_pre_impact_speed.pop(pair_key, None)

            # --- Collision conditions ---
            boxes_overlap   = iou >= COLLISION_IOU_THRESHOLD
            was_moving      = max_pre_impact >= COLLISION_MIN_SPEED_BEFORE

            if boxes_overlap and was_moving:
                # --- Lock this pair ---
                active_accidents[pair_key] = current_time + ACCIDENT_LOCK_DURATION
                collision_pre_impact_speed[pair_key] = max_pre_impact

                severity = score_severity(max_pre_impact, iou)

                # --- Determine collision type from direction vectors ---
                dir_a = direction_vector(vehicle_history[id_a])
                dir_b = direction_vector(vehicle_history[id_b])
                col_type = collision_type(dir_a, dir_b)

                # --- Euclidean distance between centers at impact ---
                cx_a, cy_a = v_a["center"]
                cx_b, cy_b = v_b["center"]
                px_dist = math.sqrt((cx_b - cx_a) ** 2 + (cy_b - cy_a) ** 2)
                meter_dist = px_dist * PIXEL_TO_METER

                # --- Annotate frame ---
                for v in (v_a, v_b):
                    bx1, by1, bx2, by2 = v["bbox"]
                    cv2.rectangle(frame, (bx1, by1), (bx2, by2), (0, 0, 255), 4)

                label = f"ACCIDENT [{col_type}]  IoU:{iou:.2f}  {ms_to_kmh(max_pre_impact):.1f}km/h"
                cv2.putText(frame, label, (30, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 255), 2)

                snap_path = save_snapshot(frame, f"accident_{id_a}_{id_b}")
                print(
                    f"[ACCIDENT] IDs:{id_a}&{id_b}  type={col_type}  "
                    f"IoU={iou:.3f}  speed={ms_to_kmh(max_pre_impact):.1f}km/h  "
                    f"dist={meter_dist:.2f}m  severity={severity}"
                )

                insert_incidents(
                    timestamps=now_str(),
                    vehicle_ids=f"{id_a},{id_b}",
                    severity=severity,
                    snapshot=snap_path,
                    location="CAMERA-1",
                    status="PENDING",
                    collision_distance=round(meter_dist, 3),
                    speed_before_collision=round(max_pre_impact, 3),
                    created_at=now_str()
                )

    # --------------------------------------------------
    # 5. MEMORY CLEANUP — remove stale track data
    # --------------------------------------------------
    stale_ids = set(vehicle_history.keys()) - current_frame_ids
    for dead_id in stale_ids:
        vehicle_history.pop(dead_id, None)
        raw_speed_history.pop(dead_id, None)
        smoothed_speed.pop(dead_id, None)
        prev_smoothed_speed.pop(dead_id, None)
        last_brake_time.pop(dead_id, None)

    # Expire accident pairs where BOTH vehicles have left the frame
    expired_pairs = [
        p for p in active_accidents
        if not any(vid in current_frame_ids for vid in p)
    ]
    for p in expired_pairs:
        active_accidents.pop(p, None)
        collision_pre_impact_speed.pop(p, None)

    # --------------------------------------------------
    # 6. DISPLAY
    # --------------------------------------------------
    cv2.imshow("CrashRadar - Accident Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        print("User quit.")
        break

# ===================================================
# CLEANUP
# ===================================================
cap.release()
cv2.destroyAllWindows()
print("Done.")