
# Object Detection Integration

This project integrates YOLOv5 and Roboflow models for real-time object detection.

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```
cd src/backend
```

2. Install the required Python packages:
```
pip install -r requirements.txt
```

3. Start the backend server:
```
python detection_server.py
```

The server will run on http://localhost:5000

### Frontend Setup

Make sure the backend server is running, then start the React application normally.

## How It Works

1. The frontend captures frames from the camera
2. Images are sent to the Python backend for processing
3. The backend uses:
   - YOLOv5 for general object detection
   - Roboflow for specialized detection of suspicious items
4. Detection results are sent back to the frontend
5. Alerts are triggered when suspicious objects are detected

## Important Notes

- The Roboflow API key is included for demo purposes but should be managed securely in production
- Detection may fall back to mock mode if the backend is unreachable
