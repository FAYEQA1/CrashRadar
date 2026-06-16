# CrashRadar 🚨

AI-powered accident detection and emergency response system using YOLO, OpenCV, Flask, and React.

---

## Project Structure

```bash
```text
CrashRadars/
│
├── backend/
│   │
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── template.py
│
│   ├── models/
│   │   ├── yolo_model.py
│   │   └── tracker.py
│
│   ├── service/
│   │   ├── detection_service.py
│   │   ├── severity_service.py
│   │   ├── alert_service.py
│   │   ├── hospital_service.py
│   │   ├── dispatch_service.py
│   │   └── camera_service.py
│
│   ├── database/
│   │   ├── db.py
│   │   ├── models.py
│   │   └── queries.py
│
│   ├── routes/
│   │   └── incident_routes.py
│
│   ├── schemas/
│   │   └── alert_schema.json
│
│   ├── event_queue/
│   │   ├── alert_queue.py
│   │   └── worker.py
│
│   ├── logs/
│   │   └── dispatch.log
│
│   ├── static/
│   │   └── snapshots/
│
│   ├── utils/
│   │   ├── video_utils.py
│   │   ├── image_utils.py
│   │   └── geo_utils.py
│
│   └── test_vedio/
│       ├── sample1.mp4
│       ├── sample2.mp4
│       └── sample3.mp4
│
├── frontend/
│   │
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   └── accidents.db
│
├── README.md
├── .gitignore
├── yolov8n.pt
├── yolov8m.pt
└── yolov8l.pt


```

---

## Features

- Real-time accident detection
- YOLO-based vehicle monitoring
- Severity estimation
- Emergency dispatch alerts
- Live dashboard with React
- CCTV feed integration
- Hospital recommendation system

---

## Tech Stack

### Backend
- Flask
- OpenCV
- YOLOv8
- SQLite

### Frontend
- React
- Vite
- Tailwind CSS

---

## Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```