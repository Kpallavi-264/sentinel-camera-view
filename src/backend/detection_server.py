
import cv2
import torch
import base64
import numpy as np
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import io
from PIL import Image
from roboflow import Roboflow
import time
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load YOLOv5 model
print("Loading YOLOv5 model...")
yolo_model = torch.hub.load('ultralytics/yolov5', 'yolov5s')  # Pretrained COCO model
classNames = yolo_model.names

# Define suspicious objects
SUSPICIOUS_OBJECTS = ["knife", "fork", "scissors", "baseball bat", "cell phone"]

# Load Roboflow model
print("Loading Roboflow workspace...")
rf = Roboflow(api_key="YAGZWZnz3p5j2WPexgga")

print("Loading Roboflow project...")
project = rf.workspace("collegeproject-y5unpq").project("thirdvision-pls-uryju")

print("Loading Roboflow model version...")
roboflow_model = project.version(1).model

if roboflow_model is None:
    print("❌ Roboflow model is None. Please check your version and deployment.")
else:
    print("✅ Roboflow model loaded successfully.")

@app.route('/detect', methods=['POST'])
def detect_objects():
    try:
        data = request.json
        image_data = data['image']
        camera_id = data.get('camera_id', 'unknown')
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        np_array = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        
        # Save temporary image for Roboflow
        temp_path = "temp_frame.jpg"
        cv2.imwrite(temp_path, img)
        
        detections = []
        suspicious_detected = False
        detected_object = None
        highest_confidence = 0
        bounding_box = None
        
        # YOLOv5 Detection
        results = yolo_model(img)
        
        for *box, conf, cls in results.xyxy[0].cpu().numpy():
            x1, y1, x2, y2 = map(int, box)
            cls_idx = int(cls)
            cls_name = classNames[cls_idx]
            confidence = float(conf)
            
            # Calculate normalized bounding box for frontend
            height, width = img.shape[:2]
            normalized_box = {
                "x": float(x1 / width),
                "y": float(y1 / height),
                "width": float((x2 - x1) / width),
                "height": float((y2 - y1) / height)
            }
            
            detections.append({
                "type": cls_name,
                "confidence": confidence,
                "boundingBox": normalized_box
            })
            
            # Check if this is a suspicious object with higher confidence
            if cls_name.lower() in SUSPICIOUS_OBJECTS and confidence > highest_confidence:
                suspicious_detected = True
                detected_object = cls_name
                highest_confidence = confidence
                bounding_box = normalized_box
        
        # Roboflow Detection (specifically for suspicious objects)
        try:
            prediction = roboflow_model.predict(temp_path, confidence=40, overlap=30).json()
            
            for pred in prediction['predictions']:
                class_name = pred['class']
                confidence = pred['confidence'] / 100.0  # Convert to 0-1 scale
                
                # Calculate normalized bounding box
                height, width = img.shape[:2]
                x, y, w, h = pred['x'], pred['y'], pred['width'], pred['height']
                
                normalized_box = {
                    "x": float((x - w/2) / width),
                    "y": float((y - h/2) / height),
                    "width": float(w / width),
                    "height": float(h / height)
                }
                
                detections.append({
                    "type": class_name,
                    "confidence": confidence,
                    "boundingBox": normalized_box
                })
                
                # Update if this is a higher confidence suspicious object
                if class_name.lower() in SUSPICIOUS_OBJECTS and confidence > highest_confidence:
                    suspicious_detected = True
                    detected_object = class_name
                    highest_confidence = confidence
                    bounding_box = normalized_box
                    
        except Exception as e:
            print(f"Roboflow prediction error: {e}")
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        # Prepare response
        if suspicious_detected:
            return jsonify({
                "detected": True,
                "alert_id": f"alert-{int(time.time() * 1000)}",
                "object_type": detected_object,
                "confidence": highest_confidence,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "message": f"Alert: {detected_object} detected at Camera {camera_id} ({int(highest_confidence * 100)}% confidence)",
                "bounding_box": bounding_box,
                "all_detections": detections
            })
        else:
            return jsonify({
                "detected": False,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "all_detections": detections
            })
            
    except Exception as e:
        print(f"Error in detection: {e}")
        return jsonify({
            "error": str(e),
            "detected": False
        }), 500

@app.route('/alerts', methods=['GET'])
def get_alerts():
    # Mock alerts endpoint
    return jsonify([])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
