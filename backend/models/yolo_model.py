from ultralytics import YOLO

class YOLODetector:
    def __init__(self, model_path="yolov8n.pt"):
        self.model = YOLO(model_path)

    def detect(self, frame):
        results = self.model(frame)

        detections = []

        for result in results:
            boxes = result.boxes

            for box in boxes:
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])

                # COCO vehicle classes
                vehicle_classes = [2, 3, 5, 7]
                # 2 = car
                # 3 = motorcycle
                # 5 = bus
                # 7 = truck

                if cls_id in vehicle_classes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])

                    detections.append({
                        "class_id": cls_id,
                        "confidence": confidence,
                        "bbox": [x1, y1, x2, y2]
                    })

        return detections