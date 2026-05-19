# CrashRadar 🚨

AI-powered accident detection and emergency response system using YOLO, OpenCV, Flask, and React.

---

## Project Structure

```bash
accident-detection-system/
│
├── backend/
│   ├── app.py
│   # Main Flask entry point
│
│   ├── config.py
│   # Stores configuration
│
│   ├── requirements.txt
│
│   ├── models/
│   │   ├── yolo_model.py
│   │   ├── tracker.py
│
│   ├── services/
│   │   ├── detection_service.py
│   │   ├── severity_service.py
│   │   ├── alert_service.py
│   │   ├── hospital_service.py
│   │   ├── dispatch_service.py
│
│   ├── database/
│   │   ├── db.py
│   │   ├── models.py
│   │   ├── queries.py
│
│   ├── routes/
│   │   ├── incident_routes.py
│
│   ├── utils/
│   │   ├── video_utils.py
│   │   ├── image_utils.py
│   │   ├── geo_utils.py
│
│   ├── data/
│   │   ├── cameras.json
│   │   ├── hospitals.json
│
│   ├── queue/
│   │   ├── alert_queue.py
│   │   ├── worker.py
│
│   ├── schemas/
│   │   ├── alert_schema.json
│
│   ├── logs/
│   │   ├── dispatch.log
│
│   ├── static/
│   │   ├── snapshots/
│
│   └── test_videos/
│       └── sample.mp4
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│
├── database/
│   └── accident.db
│
├── docker/
│
├── .gitignore
├── README.md
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