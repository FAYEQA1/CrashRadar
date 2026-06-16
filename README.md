# CrashRadar 

AI-powered accident detection and emergency response system built using **YOLOv8**, **OpenCV**, **Flask**, **SQLite**, and **React**.

CrashRadar monitors CCTV/video feeds, detects potential accidents in real time, estimates severity, stores incident data, and assists emergency response workflows.

---

## Features

*  Real-time vehicle detection using YOLOv8
*  Accident detection and monitoring
*  Severity estimation
*  Hospital recommendation support
*  Location tracking
*  Incident snapshot generation
*  SQLite-based incident storage
*  REST API with Flask
*  React frontend dashboard
*  Support for multiple test video feeds

---

## Project Structure

```text
CrashRadars/
│
├── backend/
│   │
│   ├── event_queue/
│   ├── logs/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── service/
│   ├── static/
│   │
│   ├── test_vedio/
│   │   ├── sample1.mp4
│   │   ├── sample2.mp4
│   │   └── sample3.mp4
│   │
│   ├── utils/
│   │   ├── geo_utils.py
│   │   ├── image_utils.py
│   │   └── video_utils.py
│   │
│   ├── app.py
│   ├── config.py
│   ├── template.py
│   ├── requirements.txt
│   └── yolov8m.pt
│
├── database/
│   └── accidents.db
│
├── frontend/
│
├── README.md
├── yolov8l.pt
├── yolov8m.pt
└── yolov8n.pt
```

---

## Tech Stack

### Backend

* Python
* Flask
* OpenCV
* YOLOv8
* SQLite

### Frontend

* React
* Vite
* Tailwind CSS

### AI / Computer Vision

* Ultralytics YOLOv8
* Object Tracking
* Video Processing

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/CrashRadar.git
cd CrashRadar
```

---

### 2. Backend Setup

```bash
cd backend

pip install -r requirements.txt
```

Run the backend:

```bash
python app.py
```

---

### 3. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

---

## Database

CrashRadar uses SQLite for storing incident records.

Database location:

```text
database/accidents.db
```

Main incident fields:

* id
* timestamps
* vehicle_ids
* severity
* snapshot
* location
* status
* collision_distance
* speed_before_collision
* vehicle_type
* dispatched_hospital
* created_at

---

## How It Works

1. Video feed is processed frame by frame.
2. YOLOv8 detects and tracks vehicles.
3. Potential collisions are identified.
4. Accident severity is estimated.
5. Incident data is stored in SQLite.
6. Snapshots are generated.
7. Emergency response information is prepared.
8. Results are displayed on the dashboard.

---

## Future Improvements

* Live CCTV integration
* Real-time emergency dispatch
* SMS and email notifications
* GPS-based ambulance routing
* Cloud database support
* Multi-camera monitoring
* Advanced severity prediction

---

## License

This project is for educational and research purposes.

---


```
```
