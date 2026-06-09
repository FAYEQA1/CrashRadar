import os
import cv2

def crop_vehicle_bounding_box(frame, bbox):
    """Crops out a specific vehicle cluster from an active scene matrix for isolated view panels."""
    try:
        x1, y1, x2, y2 = map(int, bbox)
        cropped_image = frame[y1:y2, x1:x2]
        return cropped_image
    except Exception as e:
        print(f"[IMAGE UTILS ERROR] Failed cropping boundary box: {e}")
        return None

def draw_danger_overlay(frame, bbox, label):
    """Draws uniform sharp alert cards directly on the cv2 image data frame."""
    x1, y1, x2, y2 = map(int, bbox)
    # High contrast Red danger marker overlay box
    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 3)
    cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
    return frame