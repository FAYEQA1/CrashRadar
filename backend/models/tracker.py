import math


def calculate_iou(box_a: list, box_b: list) -> float:
    """Intersection-over-Union of two [x1,y1,x2,y2] boxes."""
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
    """
    Hybrid IoU + centroid tracker.

    Matching priority:
      1. IoU overlap  ≥ iou_threshold   (handles colliding / overlapping boxes)
      2. Centroid distance < dynamic threshold based on box diagonal
         (handles normal movement)

    Only vehicles seen THIS frame are returned from update(), so the
    crash detector never processes stale ghost tracks.
    """

    def __init__(
        self,
        max_missing_frames: int = 5,
        iou_threshold: float = 0.25,
        dist_scale: float = 1.5,       # bbox-diagonal multiplier for max distance
        min_dist_threshold: float = 80, # floor so tiny boxes still match
    ):
        self.active_vehicles: dict[int, dict] = {}
        self.next_v_id = 0
        self.frame_count = 0

        self.max_missing_frames = max_missing_frames
        self.iou_threshold = iou_threshold
        self.dist_scale = dist_scale
        self.min_dist_threshold = min_dist_threshold

    # --------------------------------------------------
    # INTERNAL HELPERS
    # --------------------------------------------------
    @staticmethod
    def _center(bbox: list) -> tuple[int, int]:
        x1, y1, x2, y2 = bbox
        return int((x1 + x2) / 2), int((y1 + y2) / 2)

    @staticmethod
    def _diagonal(bbox: list) -> float:
        x1, y1, x2, y2 = bbox
        return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

    @staticmethod
    def _dist(c1: tuple, c2: tuple) -> float:
        return math.sqrt((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2)

    # --------------------------------------------------
    # MATCHING
    # --------------------------------------------------
    def _find_best_match(
        self, new_bbox: list, new_center: tuple, used_ids: set
    ) -> int | None:
        """
        Returns the ID of the best matching tracked vehicle, or None.

        Pass 1 — IoU match (best for overlapping/colliding vehicles).
        Pass 2 — centroid distance match (best for normal motion).
        """
        best_id = None

        # --- Pass 1: IoU ---
        best_iou = self.iou_threshold   # minimum to count
        for v_id, data in self.active_vehicles.items():
            if v_id in used_ids:
                continue
            iou = calculate_iou(new_bbox, data["bbox"])
            if iou > best_iou:
                best_iou = iou
                best_id = v_id

        if best_id is not None:
            return best_id

        # --- Pass 2: centroid distance ---
        # Use a per-box dynamic threshold so large (far-away) vehicles
        # can move further between frames than small (nearby) ones.
        max_dist = max(
            self.min_dist_threshold,
            self._diagonal(new_bbox) * self.dist_scale,
        )
        best_dist = max_dist
        for v_id, data in self.active_vehicles.items():
            if v_id in used_ids:
                continue
            d = self._dist(new_center, data["center"])
            if d < best_dist:
                best_dist = d
                best_id = v_id

        return best_id

    # --------------------------------------------------
    # REGISTER / UPDATE
    # --------------------------------------------------
    def _register(self, bbox: list, center: tuple) -> None:
        v_id = self.next_v_id
        self.next_v_id += 1
        self.active_vehicles[v_id] = {
            "id": v_id,
            "bbox": bbox,
            "center": center,
            "last_seen": self.frame_count,
            "visible": True,
        }

    def _update_track(self, v_id: int, bbox: list, center: tuple) -> None:
        self.active_vehicles[v_id].update({
            "bbox": bbox,
            "center": center,
            "last_seen": self.frame_count,
            "visible": True,
        })

    # --------------------------------------------------
    # CLEANUP
    # --------------------------------------------------
    def _remove_lost_vehicles(self) -> None:
        """Drop tracks that haven't been matched for too long."""
        stale = [
            v_id for v_id, data in self.active_vehicles.items()
            if self.frame_count - data["last_seen"] > self.max_missing_frames
        ]
        for v_id in stale:
            del self.active_vehicles[v_id]

    # --------------------------------------------------
    # MAIN UPDATE  ← called every frame
    # --------------------------------------------------
    def update(self, detections: list[list]) -> list[dict]:
        """
        Match detections to existing tracks.

        Returns ONLY vehicles detected in the current frame — no ghosts.
        """
        self.frame_count += 1
        used_ids: set[int] = set()
        current_frame_vehicles: list[dict] = []

        # Mark all existing tracks invisible at start of frame
        for data in self.active_vehicles.values():
            data["visible"] = False

        for bbox in detections:
            center = self._center(bbox)
            matched_id = self._find_best_match(bbox, center, used_ids)

            if matched_id is not None:
                used_ids.add(matched_id)
                self._update_track(matched_id, bbox, center)
                current_frame_vehicles.append(self.active_vehicles[matched_id])
            else:
                self._register(bbox, center)
                new_id = self.next_v_id - 1
                current_frame_vehicles.append(self.active_vehicles[new_id])

        self._remove_lost_vehicles()

        # ← KEY FIX: return only this frame's detections, not all active tracks
        return current_frame_vehicles