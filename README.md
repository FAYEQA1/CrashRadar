accident-detection-system/
│
├── backend/
│   ├── app.py
│   # Main Flask entry point
│   # Starts server and connects all routes/services
│
│   ├── config.py
│   # Stores configuration (DB path, model paths, thresholds)
│
│   ├── requirements.txt
│   # Python dependencies (Flask, OpenCV, torch, etc.)
│
│   ├── models/
│   │   ├── yolo_model.py
│   │   # Loads YOLO model and performs object detection
│   │
│   │   ├── tracker.py
│   │   # Tracks objects across frames (DeepSORT logic)
│
│   ├── services/
│   │   ├── detection_service.py
│   │   # Core pipeline: video → detection → accident logic
│   │
│   │   ├── severity_service.py
│   │   # Determines severity (LOW / MEDIUM / HIGH)
│   │
│   │   ├── alert_service.py
│   │   # Creates alert object (time, location, snapshot, severity)
│   │   # Sends data to DB + hospital + dispatch
│   │
│   │   ├── hospital_service.py
│   │   # Finds nearest hospital using hospitals.json + distance logic
│   │
│   │   ├── dispatch_service.py
│   │   # Sends alert to external system / hospital website
│
│   ├── database/
│   │   ├── db.py
│   │   # Initializes SQLite connection
│   │
│   │   ├── models.py
│   │   # Defines database schema (tables like incidents)
│   │
│   │   ├── queries.py
│   │   # Insert and fetch accident records
│
│   ├── routes/
│   │   ├── incident_routes.py
│   │   # API endpoints (get incidents, post alerts, etc.)
│
│   ├── utils/
│   │   ├── video_utils.py
│   │   # Handles video capture (webcam / video file)
│   │
│   │   ├── image_utils.py
│   │   # Handles image saving (snapshots)
│   │
│   │   ├── geo_utils.py
│   │   # Calculates distance between coordinates (Haversine formula)
│
│   ├── data/
│   │   ├── cameras.json
│   │   # Stores camera IDs and their locations (area, lat, lng)
│   │
│   │   ├── hospitals.json
│   │   # Stores hospital locations for nearest search
│
│   ├── queue/
│   │   ├── alert_queue.py
│   │   # Queue to store pending alerts before sending
│   │
│   │   ├── worker.py
│   │   # Background worker that processes queue and sends alerts
│
│   ├── schemas/
│   │   ├── alert_schema.json
│   │   # Defines structure/format of alert object
│
│   ├── logs/
│   │   ├── dispatch.log
│   │   # Logs success/failure of alert sending
│
│   ├── static/
│   │   ├── snapshots/
│   │   # Stores captured accident images
│
│   └── test_videos/
│       └── sample.mp4
│       # Sample video for testing detection
│
│
├── frontend/
│   ├── index.html
│   # Main HTML entry point
│
│   ├── package.json
│   # Frontend dependencies and scripts
│
│   ├── vite.config.js
│   # Vite build configuration
│
│   ├── tailwind.config.js
│   # Tailwind CSS configuration
│
│   ├── src/
│   │   ├── main.jsx
│   │   # React entry point
│   │
│   │   ├── App.jsx
│   │   # Root component (layout + routing)
│   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   # Top navigation UI
│   │   │
│   │   │   ├── IncidentCard.jsx
│   │   │   # Displays accident info (time, severity, location)
│   │   │
│   │   │   ├── VideoFeed.jsx
│   │   │   # Shows live CCTV/video feed
│   │   │
│   │   │   ├── AlertPanel.jsx
│   │   │   # Shows list of alerts
│   │   │
│   │   │   ├── MapView.jsx
│   │   │   # Leaflet map showing cameras + accidents
│   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   # Main dashboard (video + map + alerts)
│   │   │
│   │   │   ├── IncidentDetails.jsx
│   │   │   # Detailed view of a specific incident
│   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   # Axios calls to backend APIs
│   │
│   │   ├── hooks/
│   │   │   ├── useIncidents.js
│   │   │   # Custom hook to fetch/update incidents
│   │
│   │   ├── styles/
│   │   │   └── index.css
│   │   │   # Global styles (Tailwind + overrides)
│   │
│   └── public/
│   # Static assets
│
│
├── database/
│   └── accident.db
│   # SQLite database storing incidents
│
├── docker/
│   ├── backend.Dockerfile
│   # Docker setup for backend
│
│   ├── frontend.Dockerfile
│   # Docker setup for frontend
│
│   ├── docker-compose.yml
│   # Runs full system (frontend + backend together)
│
├── .gitignore
│ # Files to ignore in git
│
├── README.md
│ # Project documentation
