import cv2
import os
import datetime

def save_collision_snapshot(frame, prefix="accident"):
    """Saves the crash frame to static/snapshots/ and returns the path."""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{prefix}_{timestamp}.jpg"
    
    # Save directory mapping relative to backend app execution context
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_dir = os.path.join(base_dir, 'static', 'snapshots')
    os.makedirs(target_dir, exist_ok=True)
    
    filepath = os.path.join(target_dir, filename)
    cv2.imwrite(filepath, frame)
    
    # Return accessible web URL path context
    return f"static/snapshots/{filename}"