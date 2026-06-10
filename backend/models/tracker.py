# deepsort tracker. kalman + appearance embedder so IDs hold across
# occlusions and crossings. also keeps the iou helper + cls/visible
# fields so anything downstream that expects those still works.

from deep_sort_realtime.deepsort_tracker import DeepSort


def calculate_iou(box_a, box_b):
    # iou of two [x1,y1,x2,y2] boxes
    ix1 = max(box_a[0], box_b[0])
    iy1 = max(box_a[1], box_b[1])
    ix2 = min(box_a[2], box_b[2])
    iy2 = min(box_a[3], box_b[3])
    iw = max(0, ix2 - ix1)
    ih = max(0, iy2 - iy1)
    inter = iw * ih
    if inter == 0:
        return 0.0
    area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
    area_b = (box_b[2] - box_b[0]) * (box_b[3] - box_b[1])
    union = area_a + area_b - inter
    return inter / union if union > 0 else 0.0


class VehicleTracker:
    def __init__(self):
        self.tracker = DeepSort(max_age=30, n_init=2)
        self.frame_count = 0

    def update(self, detections, frame):
        # detections = list of [x1,y1,x2,y2] or dicts with "bbox"+"cls"
        # frame needed bc the appearance embedder reads pixels
        self.frame_count += 1

        ds_input = []
        for det in detections:
            if isinstance(det, dict):
                bbox = det["bbox"]
                cls = det.get("cls", 2)
            else:
                bbox = det
                cls = 2
            x1, y1, x2, y2 = bbox
            w = x2 - x1
            h = y2 - y1
            ds_input.append(([x1, y1, w, h], 0.9, str(cls)))

        tracks = self.tracker.update_tracks(ds_input, frame=frame)

        # only return whats confirmed AND seen this frame so the crash
        # detector doesnt fire on ghosts
        results = []
        for t in tracks:
            if not t.is_confirmed():
                continue
            if t.time_since_update > 0:
                continue
            l, top, r, bot = t.to_ltrb()
            bbox = [int(l), int(top), int(r), int(bot)]
            cx = (bbox[0] + bbox[2]) // 2
            cy = (bbox[1] + bbox[3]) // 2
            try:
                cls = int(t.det_class) if t.det_class is not None else 2
            except (ValueError, TypeError):
                cls = 2
            results.append({
                "id": int(t.track_id),
                "bbox": bbox,
                "center": (cx, cy),
                "cls": cls,
                "last_seen": self.frame_count,
                "visible": True,
            })

        return results
