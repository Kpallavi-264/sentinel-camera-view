
# Object Detection Integration

This project integrates YOLOv5 and Roboflow models for real-time object detection.

## Setup Instructions

### Backend Setup (Important!)

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

**Important**: The object detection will only work correctly when the Python backend is running. If the backend is not running, the system will fall back to mock detection mode, which randomly generates detections and may not be accurate.

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

## Troubleshooting

If you're seeing incorrect detections (e.g., smartphone being detected as a knife):
- Make sure the Python backend server is running at http://localhost:5000
- Check the console logs for connection errors
- If you see "Backend connection failed, using mock detection" messages, it means the system is using random mock detections instead of actual detection

## Important Notes

- The Roboflow API key is included for demo purposes but should be managed securely in production
- Detection will fall back to mock mode if the backend is unreachable
