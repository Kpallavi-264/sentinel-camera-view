
# Security Camera System Backend Requirements

This document outlines the requirements for the Flask backend that would integrate with this frontend application.

## Required Endpoints

### 1. Detection Endpoint (`/detect`)

**Purpose**: Receives camera frames and processes them for object detection.

**Request Format**:
```json
{
  "camera_id": "cam-1",
  "image": "base64_encoded_image_data",
  "timestamp": "2025-04-16T09:22:45Z"
}
```

**Response Format**:
```json
{
  "detected": true,
  "alert_id": "alert-123456",
  "object_type": "Knife",
  "confidence": 0.87,
  "timestamp": "2025-04-16T09:22:45Z",
  "message": "Detected suspicious Knife at Camera Front Entrance"
}
```

### 2. Alerts Endpoint (`/alerts`)

**Purpose**: Retrieves the history of detection alerts.

**Response Format**:
```json
[
  {
    "id": "alert-123456",
    "camera_id": "cam-1",
    "object_type": "Knife",
    "timestamp": "2025-04-16T09:22:45Z",
    "confidence": 0.87,
    "message": "Detected suspicious Knife at Camera Front Entrance"
  },
  // More alerts...
]
```

## Backend Implementation Guide

### Flask Setup

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
import cv2
import time
import uuid
from datetime import datetime
import mysql.connector

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="security_system"
)
cursor = db.cursor(dictionary=True)

# Create alerts table if it doesn't exist
cursor.execute("""
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(100) PRIMARY KEY,
    camera_id VARCHAR(50) NOT NULL,
    object_type VARCHAR(50),
    timestamp DATETIME NOT NULL,
    confidence FLOAT,
    message TEXT
)
""")
db.commit()

# List of suspicious objects to detect
SUSPICIOUS_OBJECTS = ["knife", "bat", "rope", "gun"]

@app.route('/detect', methods=['POST'])
def detect():
    data = request.json
    camera_id = data.get('camera_id')
    image_base64 = data.get('image')
    
    # Decode base64 image
    image_data = base64.b64decode(image_base64)
    nparr = np.frombuffer(image_data, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Here you would run your Mini YOLO model
    # For this example, we'll simulate detection
    detected, object_type, confidence = run_object_detection(image)
    
    # Generate response
    alert_id = None
    message = None
    
    if detected and object_type.lower() in SUSPICIOUS_OBJECTS:
        alert_id = f"alert-{uuid.uuid4()}"
        message = f"Detected suspicious {object_type} at Camera {camera_id}"
        
        # Log to database
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute(
            "INSERT INTO alerts (id, camera_id, object_type, timestamp, confidence, message) VALUES (%s, %s, %s, %s, %s, %s)",
            (alert_id, camera_id, object_type, timestamp, confidence, message)
        )
        db.commit()
    
    return jsonify({
        "detected": detected,
        "alert_id": alert_id,
        "object_type": object_type if detected else None,
        "confidence": confidence if detected else 0,
        "timestamp": datetime.now().isoformat(),
        "message": message
    })

@app.route('/alerts', methods=['GET'])
def get_alerts():
    cursor.execute("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 100")
    alerts = cursor.fetchall()
    
    # Convert datetime to string
    for alert in alerts:
        alert['timestamp'] = alert['timestamp'].isoformat()
    
    return jsonify(alerts)

def run_object_detection(image):
    """
    In a real implementation, you would:
    1. Preprocess the image for your Mini YOLO model
    2. Run the model to get predictions
    3. Parse predictions to identify objects
    4. Return results
    
    For this example, we'll simulate detection
    """
    # TODO: Replace with actual Mini YOLO implementation
    # Simulated detection (20% chance of detecting something)
    detected = np.random.random() < 0.2
    
    if detected:
        objects = ["Person", "Knife", "Bat", "Rope", "Vehicle", "Animal"]
        object_type = np.random.choice(objects)
        confidence = 0.7 + 0.3 * np.random.random()  # Between 0.7 and 1.0
        return True, object_type, confidence
    else:
        return False, None, 0

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### MySQL Database Setup

```sql
CREATE DATABASE security_system;
USE security_system;

CREATE TABLE alerts (
    id VARCHAR(100) PRIMARY KEY,
    camera_id VARCHAR(50) NOT NULL,
    object_type VARCHAR(50),
    timestamp DATETIME NOT NULL,
    confidence FLOAT,
    message TEXT
);
```

### Required Python Packages

- Flask
- flask-cors
- mysql-connector-python
- numpy
- opencv-python
- (Mini YOLO dependencies)

To run Mini YOLO, you will need additional packages like:
- torch
- ultralytics (for YOLOv5/v8)

## Integration Notes

1. The frontend expects the backend to be running at `http://localhost:5000`.
2. While developing, you can use the built-in mock functionality in the frontend.
3. For production, ensure proper security measures are implemented (authentication, HTTPS).
