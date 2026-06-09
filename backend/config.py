import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'crash_radar_secret_key_9981')
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    
    # Accurate paths matching your structure
    UPLOAD_FOLDER = os.path.normpath(os.path.join(BASE_DIR, 'static', 'snapshots'))
    ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}
    
    # Model configuration
    YOLO_MODEL_PATH = os.environ.get('YOLO_MODEL_PATH', 'yolov8m.pt')
    
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)