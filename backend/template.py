import os 
from pathlib import Path
import logging

list_of_files=[
    "backend/app.py",
    "backend/config.py",
    "backend/models/yolo_model.py",
    "backend/models/tracker.py",
    "backend/service/detection.py",
    "backend/service/severity.py",
    "backend/service/hospital_service.py",
    "backend/service/alert_service.py",
    "backend/service/dispatch_service.py",
    "backend/database/db.py",
    "backend/database/models.py",
    "backend/database/queries.py",
    "backend/routes/incident_routes.py",
    "backend/utils/video_utils.py",
    "backend/utils/image_utils.py",
    "backend/utils/geo_utils.py",
    "backend/data/hospital.json",
    "backend/data/cameras.json",
    "backend/queue/alert_queue.py",
    "backend/queue/worker.py",
    "backend/schemas/alert_schema.json",
    "backend/logs/dispatch.log",
    "backend/static/snapshots.py",
    "backend/test_vedio/sample.m4"
]

for filepath in list_of_files:
    filepath = Path(filepath)
    filedir,filenames=os.path.split(filepath)
    if filedir:
        os.makedirs(filedir,exist_ok=True)
    if (not os.path.exists(filepath) or os.path.getsize==0):
        with open(filepath,'w') as f:
            pass
            logging.info(f"Creating files{filenames}")
    else:
        logging.info("Files already exists")
