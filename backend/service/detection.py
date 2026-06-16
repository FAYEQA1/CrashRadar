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


MIN_CONFIDENCE               = 0.45
PIXEL_TO_METER               = 0.047
VIDEO_FPS                    = 30.0
SPEED_SMOOTHING_WINDOW       = 6
MIN_SPEED_FOR_BRAKE_CHECK    = 1.5
SUDDEN_BRAKE_DECEL_THRESHOLD = 3.0
BRAKE_COOLDOWN_PER_VEHICLE   = 4.0

# ── LOWERED: angled/top-down cameras produce less box overlap even in real crashes
COLLISION_IOU_THRESHOLD      = 0.08
COLLISION_IOU_THRESHOLD_MOTO = 0.03
COLLISION_MIN_SPEED_BEFORE   = 0.5   # catch slower-speed impacts too

ACCIDENT_LOCK_DURATION       = 8.0
SEVERITY_LOW_SPEED      = 2.0
SEVERITY_HIGH_SPEED     = 5.0
SEVERITY_CRITICAL_SPEED = 8.0
VEHICLE_CLASSES = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}

BASE_DIR        = os.path.dirname(os.path.abspath(__file__))
SNAPSHOT_FOLDER = os.path.join(BASE_DIR, "..", "static", "snapshots")
os.makedirs(SNAPSHOT_FOLDER, exist_ok=True)

# ── Display colours ───────────────────────────────────────────────────────────
COLOR_NORMAL   = (0, 255, 0)
COLOR_BRAKE    = (0, 165, 255)
COLOR_ACCIDENT = (0, 0, 255)
COLOR_TEXT_BG  = (0, 0, 0)
FONT       = cv2.FONT_HERSHEY_DUPLEX
FONT_SMALL = cv2.FONT_HERSHEY_SIMPLEX

BANNER_DISPLAY_DURATION = 5.0


# ── Geometry helpers ──────────────────────────────────────────────────────────
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

def center_distance_px(box_a, box_b):
    """Euclidean distance between box centres — used as a proximity fallback."""
    cx_a = (box_a[0]+box_a[2])//2;  cy_a = (box_a[1]+box_a[3])//2
    cx_b = (box_b[0]+box_b[2])//2;  cy_b = (box_b[1]+box_b[3])//2
    return math.sqrt((cx_b-cx_a)**2+(cy_b-cy_a)**2)

def boxes_touch(box_a, box_b, margin=10):
    """True when boxes are within `margin` pixels of each other (proximity check)."""
    return (box_a[0]-margin < box_b[2] and box_a[2]+margin > box_b[0] and
            box_a[1]-margin < box_b[3] and box_a[3]+margin > box_b[1])

def pixel_displacement_to_ms(px, fps): return px * PIXEL_TO_METER * fps
def now_str(): return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
def ms_to_kmh(ms): return ms * 3.6

def score_severity(speed_ms):
    if speed_ms >= SEVERITY_CRITICAL_SPEED:   return "CRITICAL"
    elif speed_ms >= SEVERITY_HIGH_SPEED:     return "HIGH"
    elif speed_ms >= SEVERITY_LOW_SPEED:      return "MEDIUM"
    else:                                      return "LOW"

def direction_vector(history, window=5):
    if len(history) < window: return (0.0, 0.0)
    x0, y0 = history[-window]; x1, y1 = history[-1]
    dx, dy = x1-x0, y1-y0
    mag = math.sqrt(dx**2+dy**2)
    return (dx/mag, dy/mag) if mag > 1e-6 else (0.0, 0.0)

def collision_type(dir_a, dir_b):
    dot = dir_a[0]*dir_b[0]+dir_a[1]*dir_b[1]
    if dot < -0.5:  return "HEAD-ON"
    elif dot > 0.5: return "REAR-END"
    return "SIDE-IMPACT"


# ── Drawing helpers ───────────────────────────────────────────────────────────
def draw_label(frame, text, x, y):
    (tw, th), bl = cv2.getTextSize(text, FONT_SMALL, 0.55, 1)
    cv2.rectangle(frame, (x, y-th-bl-4), (x+tw+4, y), COLOR_TEXT_BG, -1)
    cv2.putText(frame, text, (x+2, y-bl-2), FONT_SMALL, 0.55, (255,255,255), 1, cv2.LINE_AA)

def draw_vehicle_box(frame, bbox, v_id, cls_name, speed_kmh, box_color):
    x1,y1,x2,y2 = bbox
    cv2.rectangle(frame, (x1,y1), (x2,y2), box_color, 2)
    cx,cy = (x1+x2)//2, (y1+y2)//2
    cv2.circle(frame, (cx,cy), 4, box_color, -1)
    draw_label(frame, f"ID:{v_id} {cls_name}", x1, y1)
    draw_label(frame, f"{speed_kmh:.1f}km/h",  x1, y1+22)

def draw_accident_banner(frame, col_type, severity, ids):
    h, w = frame.shape[:2]
    text = f"ACCIDENT [{col_type}]  IDs: {ids}  [{severity}]"
    overlay = frame.copy()
    cv2.rectangle(overlay, (0,0), (w,70), (0,0,180), -1)
    cv2.addWeighted(overlay, 0.55, frame, 0.45, 0, frame)
    (tw,_),_ = cv2.getTextSize(text, FONT, 1.0, 2)
    tx = max(10, (w-tw)//2)
    cv2.putText(frame, text, (tx,48), FONT, 1.0, (0,0,255), 3, cv2.LINE_AA)
    cv2.putText(frame, text, (tx,48), FONT, 1.0, (255,255,255), 1, cv2.LINE_AA)

def draw_brake_banner(frame, v_id, decel_kmh, severity):
    h, w = frame.shape[:2]
    text = f"HARD BRAKE  ID:{v_id}  -{decel_kmh:.1f}km/h  [{severity}]"
    overlay = frame.copy()
    cv2.rectangle(overlay, (0,h-60), (w,h), (0,80,200), -1)
    cv2.addWeighted(overlay, 0.55, frame, 0.45, 0, frame)
    cv2.putText(frame, text, (10,h-18), FONT, 0.75, (0,165,255), 2, cv2.LINE_AA)
    cv2.putText(frame, text, (10,h-18), FONT, 0.75, (255,255,255), 1, cv2.LINE_AA)

def draw_hud(frame, total_vehicles, incident_count):
    lines = [
        f"CrashRadar  |  {now_str()}",
        f"Vehicles: {total_vehicles}    Incidents: {incident_count}",
        "Press Q to quit",
    ]
    for i, line in enumerate(lines):
        y = 20 + i*20
        cv2.putText(frame, line, (8,y), FONT_SMALL, 0.5, (0,0,0),       3, cv2.LINE_AA)
        cv2.putText(frame, line, (8,y), FONT_SMALL, 0.5, (200,255,200), 1, cv2.LINE_AA)

def save_snapshot(frame, label):
    """Save frame AFTER all overlays have been drawn onto it."""
    filename = f"{label}_{int(time.time()*1000)}.jpg"
    path = os.path.join(SNAPSHOT_FOLDER, filename)
    cv2.imwrite(path, frame)
    return path


# ── Detection service ─────────────────────────────────────────────────────────
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

        accident_ids_on_screen = set()
        brake_ids_on_screen    = {}
        accident_banners       = []
        brake_banners          = []

        # Pending snapshots: taken AFTER drawing — stored as (type, label, pair_info)
        pending_brake_snap    = None   # (v_id, decel_kmh, severity, snap_label)
        pending_accident_snap = None   # (id_a, id_b, col_type, severity, meter_dist, max_speed, snap_label)

        incident_count = 0
        total_seen_ids = set()

        print("Loading YOLO model...")
        model   = YOLO("yolov8m.pt")
        tracker = VehicleTracker()

        cap = cv2.VideoCapture(video_source)
        if not cap.isOpened():
            print(f"ERROR: Cannot open video: {video_source}")
            return

        actual_fps = cap.get(cv2.CAP_PROP_FPS)
        if actual_fps and actual_fps > 0:
            fps = actual_fps

        frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        print(f"Detection started on {video_source} @ {fps:.1f} FPS  ({frame_w}x{frame_h})")

        window_name = "CrashRadar \u2013 Live Detection  [Q to quit]"
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(window_name, min(frame_w, 1280), min(frame_h, 720))

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            current_time      = time.time()
            current_frame_ids = set()

            # ── YOLO inference ────────────────────────────────────────────────
            results    = model(frame, verbose=False)
            detections = []
            for result in results:
                for box in result.boxes:
                    cls  = int(box.cls[0])
                    conf = float(box.conf[0])
                    if cls in VEHICLE_CLASSES and conf > MIN_CONFIDENCE:
                        detections.append({"bbox": list(map(int, box.xyxy[0])), "cls": cls})

            tracked_vehicles = tracker.update(detections, frame)

            # ── Per-vehicle speed & brake logic ──────────────────────────────
            for vehicle in tracked_vehicles:
                v_id   = vehicle["id"]
                bbox   = vehicle["bbox"]
                cx, cy = vehicle["center"]
                current_frame_ids.add(v_id)
                vehicle_class[v_id] = vehicle.get("cls", 2)
                total_seen_ids.add(v_id)

                hist    = vehicle_history[v_id]
                px_disp = math.sqrt((cx-hist[-1][0])**2+(cy-hist[-1][1])**2) if hist else 0.0
                hist.append((cx, cy))

                raw_speed_history[v_id].append(pixel_displacement_to_ms(px_disp, fps))
                buf = raw_speed_history[v_id]

                prev_speed    = smoothed_speed.get(v_id, 0.0)
                prev_smoothed_speed[v_id] = prev_speed
                current_speed = sum(buf)/len(buf) if buf else 0.0
                smoothed_speed[v_id] = current_speed
                deceleration  = prev_speed - current_speed
                warmed_up     = len(buf) >= SPEED_SMOOTHING_WINDOW

                if (warmed_up
                    and prev_speed >= MIN_SPEED_FOR_BRAKE_CHECK
                    and deceleration >= SUDDEN_BRAKE_DECEL_THRESHOLD
                    and (current_time - last_brake_time.get(v_id, 0.0)) > BRAKE_COOLDOWN_PER_VEHICLE
                    and not any(v_id in pair for pair in active_accidents)):

                    last_brake_time[v_id] = current_time
                    severity  = score_severity(prev_speed)
                    decel_kmh = ms_to_kmh(deceleration)
                    print(f"[BRAKE] ID:{v_id}  decel={decel_kmh:.1f}km/h  severity={severity}")
                    incident_count += 1

                    expire = current_time + BANNER_DISPLAY_DURATION
                    brake_ids_on_screen[v_id] = expire
                    brake_banners.append((expire, v_id, decel_kmh, severity))

                    # Queue snapshot to be taken AFTER drawing this frame
                    pending_brake_snap = (v_id, decel_kmh, severity,
                                          prev_speed, f"brake_{v_id}")

            # ── Collision detection ───────────────────────────────────────────
            for i in range(len(tracked_vehicles)):
                for j in range(i+1, len(tracked_vehicles)):
                    v_a, v_b   = tracked_vehicles[i], tracked_vehicles[j]
                    id_a, id_b = v_a["id"], v_b["id"]
                    pair_key   = frozenset({id_a, id_b})

                    if pair_key in active_accidents:
                        if current_time < active_accidents[pair_key]:
                            accident_ids_on_screen.add(id_a)
                            accident_ids_on_screen.add(id_b)
                            continue
                        else:
                            active_accidents.pop(pair_key, None)
                            accident_ids_on_screen.discard(id_a)
                            accident_ids_on_screen.discard(id_b)

                    iou       = calculate_iou(v_a["bbox"], v_b["bbox"])
                    touching  = boxes_touch(v_a["bbox"], v_b["bbox"], margin=15)
                    pre_a     = prev_smoothed_speed.get(id_a, smoothed_speed.get(id_a, 0.0))
                    pre_b     = prev_smoothed_speed.get(id_b, smoothed_speed.get(id_b, 0.0))
                    max_speed = max(pre_a, pre_b)
                    both_warmed = (len(raw_speed_history[id_a]) >= SPEED_SMOOTHING_WINDOW and
                                   len(raw_speed_history[id_b]) >= SPEED_SMOOTHING_WINDOW)

                    is_moto   = (vehicle_class.get(id_a,2)==3 or vehicle_class.get(id_b,2)==3)
                    threshold = COLLISION_IOU_THRESHOLD_MOTO if is_moto else COLLISION_IOU_THRESHOLD

                    # Trigger on IoU OR proximity touch (catches angled-camera crashes)
                    collision_detected = ((iou >= threshold or touching) and
                                          max_speed >= COLLISION_MIN_SPEED_BEFORE and
                                          both_warmed)

                    if collision_detected:
                        expire = current_time + ACCIDENT_LOCK_DURATION
                        active_accidents[pair_key] = expire

                        severity = score_severity(max_speed)
                        dir_a    = direction_vector(vehicle_history[id_a])
                        dir_b    = direction_vector(vehicle_history[id_b])
                        col_type = collision_type(dir_a, dir_b)
                        cx_a,cy_a = v_a["center"]; cx_b,cy_b = v_b["center"]
                        meter_dist = math.sqrt((cx_b-cx_a)**2+(cy_b-cy_a)**2)*PIXEL_TO_METER

                        print(f"[ACCIDENT] IDs:{id_a}&{id_b}  type={col_type}  IoU={iou:.3f}  touch={touching}  severity={severity}")
                        incident_count += 1

                        accident_ids_on_screen.add(id_a)
                        accident_ids_on_screen.add(id_b)
                        ids_str = f"{id_a} & {id_b}"
                        accident_banners.append((expire, col_type, severity, ids_str))

                        # Queue snapshot AFTER drawing
                        pending_accident_snap = (id_a, id_b, col_type, severity,
                                                  meter_dist, max_speed,
                                                  f"accident_{id_a}_{id_b}")

            # ── Stale-ID cleanup ──────────────────────────────────────────────
            stale_ids = set(vehicle_history.keys()) - current_frame_ids
            for dead_id in stale_ids:
                vehicle_history.pop(dead_id, None)
                raw_speed_history.pop(dead_id, None)
                smoothed_speed.pop(dead_id, None)
                prev_smoothed_speed.pop(dead_id, None)
                last_brake_time.pop(dead_id, None)
                accident_ids_on_screen.discard(dead_id)

            # ── Draw onto frame ───────────────────────────────────────────────
            for vehicle in tracked_vehicles:
                v_id      = vehicle["id"]
                bbox      = vehicle["bbox"]
                cls_name  = VEHICLE_CLASSES.get(vehicle_class.get(v_id, 2), "vehicle")
                speed_kmh = ms_to_kmh(smoothed_speed.get(v_id, 0.0))

                if v_id in accident_ids_on_screen:
                    box_color = COLOR_ACCIDENT
                elif v_id in brake_ids_on_screen and current_time < brake_ids_on_screen[v_id]:
                    box_color = COLOR_BRAKE
                else:
                    box_color = COLOR_NORMAL

                draw_vehicle_box(frame, bbox, v_id, cls_name, speed_kmh, box_color)

            accident_banners = [(e,c,s,i) for e,c,s,i in accident_banners if current_time < e]
            if accident_banners:
                _, ct, sv, ids = accident_banners[-1]
                draw_accident_banner(frame, ct, sv, ids)

            brake_banners = [(e,v,d,s) for e,v,d,s in brake_banners if current_time < e]
            if brake_banners and not accident_banners:
                _, vid, dc, sv = brake_banners[-1]
                draw_brake_banner(frame, vid, dc, sv)

            draw_hud(frame, len(current_frame_ids), incident_count)

            # ── Save snapshots NOW (overlays already drawn) ───────────────────
            if pending_brake_snap:
                v_id, decel_kmh, severity, prev_speed, snap_label = pending_brake_snap
                snap_path = save_snapshot(frame, snap_label)
                insert_incidents(
                    timestamps=now_str(), vehicle_ids=str(v_id),
                    severity=severity, snapshot=snap_path,
                    location=camera_id, status="PENDING",
                    collision_distance=-1.0,
                    speed_before_collision=round(prev_speed, 2),
                )
                pending_brake_snap = None

            if pending_accident_snap:
                id_a, id_b, col_type, severity, meter_dist, max_speed, snap_label = pending_accident_snap
                snap_path = save_snapshot(frame, snap_label)
                insert_incidents(
                    timestamps=now_str(), vehicle_ids=f"{id_a},{id_b}",
                    severity=severity, snapshot=snap_path,
                    location=camera_id, status="PENDING",
                    collision_distance=round(meter_dist, 3),
                    speed_before_collision=round(max_speed, 3),
                )
                pending_accident_snap = None

            # ── Show ──────────────────────────────────────────────────────────
            cv2.imshow(window_name, frame)
            key = cv2.waitKey(1) & 0xFF
            if key in (ord('q'), ord('Q'), 27):
                print("User quit.")
                break

        cap.release()
        cv2.destroyAllWindows()
        print("Detection complete.")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="CrashRadar \u2013 Live Accident Detection")
    parser.add_argument("--video",  default=None,       help="Path to video file")
    parser.add_argument("--camera", default="CAMERA-1", help="Camera ID label")
    args = parser.parse_args()

    if args.video is None:
        test_folder = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "test_vedio")
        )
        candidates = [f for f in os.listdir(test_folder)
                      if f.lower().endswith((".mp4", ".avi", ".mov", ".mkv"))]
        if not candidates:
            print(f"ERROR: No video files found in {test_folder}")
            sys.exit(1)
        video_path = os.path.join(test_folder, candidates[0])
        print(f"No --video specified. Auto-selected: {video_path}")
    else:
        video_path = args.video

    DetectionService().run_inference(video_path, camera_id=args.camera)