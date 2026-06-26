#  CrashRadar - AI Powered Traffic Accident Detection & Emergency Response System

<p align="center">
  <b>Real-time AI Surveillance • Automatic Accident Detection • Emergency Dispatch • Intelligent Analytics</b>
</p>

---

##  Overview

**CrashRadar** is an AI-powered traffic surveillance system designed to automatically detect road accidents from live camera feeds, assess their severity, and initiate emergency response workflows.

Instead of relying on manual monitoring, CrashRadar continuously analyzes video streams using computer vision techniques to identify collisions in real time. Once an accident is detected, the system records incident details, captures snapshot evidence, determines the severity level, and automatically assigns the nearest hospital for severe incidents.

The platform also provides an interactive dashboard for authorities to monitor live incidents, review historical accident logs, analyze statistics, and access captured evidence.

---

#  Features

##  AI Accident Detection

* Real-time accident detection
* Vehicle tracking
* Collision detection
* Speed estimation
* Collision distance estimation

---

## 📸 Automatic Snapshot Capture

Whenever an accident is detected:

* Accident snapshot is automatically saved
* Snapshot linked with incident
* Evidence available in dashboard
* One-click image preview

---

##  Severity Classification

Every detected accident is classified into one of four categories:

* 🔴 Critical
* 🟠 High
* 🟡 Medium
* 🟢 Low

Severity is calculated using:

* Vehicle speed
* Collision distance
* Impact conditions

---

##  Smart Hospital Assignment

Hospitals are automatically assigned **only** for:

* Critical accidents
* High severity accidents

Medium and Low incidents remain unassigned.

---

## 📊 Analytics Dashboard

The dashboard provides:

* Total Incidents Logged
* Critical Incidents
* High Severity Incidents
* Low & Medium Incidents
* Live Incident Table
* Emergency Alerts
* AI Engine Status
* System Health
* Snapshot Gallery
* Active Warnings

Animated metric counters create a smooth analytics experience.

---

##  Incident History

Every accident is permanently logged with:

* Incident ID
* Timestamp
* Location
* Vehicle IDs
* Severity
* Hospital Assigned
* Current Status
* Snapshot Evidence

Includes:

* Search
* Pagination
* Incident Details
* Snapshot Viewer

---

## 🗑 Incident Management

Administrators can:

* Delete incidents
* Refresh dashboard
* Review evidence
* View complete incident details

---

# 🛠 Tech Stack

## Frontend

* React.js
* Tailwind CSS
* React Router
* Lucide React Icons

---

## Backend

* Flask
* Python

---

## AI / Computer Vision

* YOLOv8
* OpenCV

---

## Database

* SQLite

---

# 📂 Project Structure

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

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/CrashRadar.git
```

```bash
cd CrashRadar
```

---

## Backend

```bash
cd backend
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run Flask

```bash
python app.py
```

Backend starts on

```
http://localhost:5000
```

---

## Frontend

```bash
cd frontend
```

Install packages

```bash
npm install
```

Start React

```bash
npm run dev
```

Frontend starts on

```
http://localhost:5173
```

---

# 📡 API Endpoints

### Get all incidents

```
GET /api/incidents
```

---

### Incident Statistics

```
GET /api/incidents/stats
```

Returns

```json
{
  "total": 150,
  "critical": 12,
  "high": 25,
  "medium": 60,
  "low": 53
}
```

---

### Critical Incidents

```
GET /api/incidents/critical
```

---

### Delete Incident

```
DELETE /api/incidents/:id
```

---

# 📊 Dashboard Modules

✔ Live Metrics

✔ AI Status Monitor

✔ Camera Status

✔ Recent Incidents

✔ Critical Alert Banner

✔ Snapshot Evidence Gallery

✔ Active Warnings

✔ System Infrastructure Panel

✔ Analytics Cards

---

# 🎯 Workflow

```text
Live Camera Feed
        │
        ▼
YOLO Vehicle Detection
        │
        ▼
Vehicle Tracking
        │
        ▼
Collision Detection
        │
        ▼
Severity Analysis
        │
        ▼
Snapshot Capture
        │
        ▼
Database Storage
        │
        ▼
Hospital Assignment
        │
        ▼
Dashboard Update
```

---

# 📸 Key Functionalities

* Real-time accident detection
* Snapshot capture
* Severity prediction
* Hospital assignment
* Dashboard analytics
* Incident search
* Evidence viewer
* Animated statistics
* Incident deletion
* Pagination
* Live updates

---

#  Future Improvements

* Email notifications
* SMS alerts
* Google Maps integration
* Heatmap visualization
* AI accident prediction
* Role-based authentication
* Cloud deployment
* Mobile application

---



---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

It helps others discover the project and supports future development.
