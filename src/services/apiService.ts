
// API endpoints configuration
const API_BASE_URL = "http://localhost:5000"; // Python Flask server URL

// API endpoints
const ENDPOINTS = {
  detect: `${API_BASE_URL}/detect`,
  alerts: `${API_BASE_URL}/alerts`,
};

import { SUSPICIOUS_OBJECT_TYPES, DISPLAY_TYPE_MAPPING } from "@/types/camera";

// Updated mock detection logic with better bounding boxes for each object type
const createMockBoundingBox = (objectType: string) => {
  switch(objectType.toLowerCase()) {
    case 'cell phone': // Smartphone
      return {
        x: 0.3 + (Math.random() * 0.3),
        y: 0.3 + (Math.random() * 0.3),
        width: 0.1 + (Math.random() * 0.1),
        height: 0.2 + (Math.random() * 0.1),
      };
    case 'scissors':
      return {
        x: 0.2 + (Math.random() * 0.4),
        y: 0.4 + (Math.random() * 0.3),
        width: 0.08 + (Math.random() * 0.06),
        height: 0.15 + (Math.random() * 0.08),
      };
    case 'knife':
      return {
        x: 0.15 + (Math.random() * 0.4),
        y: 0.2 + (Math.random() * 0.4),
        width: 0.06 + (Math.random() * 0.08),
        height: 0.25 + (Math.random() * 0.1),
      };
    case 'fork':
      return {
        x: 0.25 + (Math.random() * 0.3),
        y: 0.3 + (Math.random() * 0.3),
        width: 0.05 + (Math.random() * 0.05),
        height: 0.15 + (Math.random() * 0.1),
      };
    case 'baseball bat': // Bat
      return {
        x: 0.1 + (Math.random() * 0.3),
        y: 0.1 + (Math.random() * 0.5),
        width: 0.08 + (Math.random() * 0.06),
        height: 0.4 + (Math.random() * 0.2),
      };
    case 'tie': // Rope
      return {
        x: 0.25 + (Math.random() * 0.4),
        y: 0.15 + (Math.random() * 0.3),
        width: 0.05 + (Math.random() * 0.1),
        height: 0.3 + (Math.random() * 0.2),
      };
    case 'handbag': // Gun
      return {
        x: 0.2 + (Math.random() * 0.5),
        y: 0.3 + (Math.random() * 0.4),
        width: 0.15 + (Math.random() * 0.1),
        height: 0.1 + (Math.random() * 0.08),
      };
    default:
      return {
        x: Math.random() * 0.7,
        y: Math.random() * 0.7,
        width: 0.2 + Math.random() * 0.1,
        height: 0.2 + Math.random() * 0.1,
      };
  }
};

// Process image capture and send to backend for detection
export const sendImageForDetection = async (cameraId: string, imageDataUrl: string): Promise<any> => {
  try {
    // Extract base64 data from the data URL (remove the "data:image/jpeg;base64," part)
    const base64Data = imageDataUrl.split(',')[1];
    
    try {
      console.log("Sending image to detection server...");
      // Try to connect to the Python backend
      const response = await fetch(ENDPOINTS.detect, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          camera_id: cameraId,
          image: base64Data,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Detection result:", result);
      return result;
    } catch (error) {
      console.warn("Backend connection failed, using mock YOLO detection:", error);
      
      // YOLO-inspired mock detection with better probabilities for suspicious objects
      // Higher detection rate makes sure we actually see objects
      const detected = Math.random() < 0.9; // 90% detection rate
      
      // Weighted random selection for suspicious objects based on YOLO classes
      const detectionProbabilities = {
        'knife': 0.40,         // 40% chance - highest priority
        'fork': 0.15,          // 15% chance - new detection item
        'cell phone': 0.15,    // 15% chance - smartphone
        'scissors': 0.15,      // 15% chance
        'baseball bat': 0.15,   // 15% chance - bat
      };

      let objectType = 'unknown';
      const rand = Math.random();
      let cumulative = 0;

      for (const [type, prob] of Object.entries(detectionProbabilities)) {
        cumulative += prob;
        if (rand < cumulative) {
          objectType = type;
          break;
        }
      }

      // Higher confidence range to make detections more convincing
      // This simulates YOLO's confidence values (0-1)
      const confidenceLevel = detected ? (0.75 + Math.random() * 0.24) : 0;
      const boundingBox = createMockBoundingBox(objectType);
      
      // Get display name for the message
      const displayType = DISPLAY_TYPE_MAPPING[objectType.toLowerCase() as keyof typeof DISPLAY_TYPE_MAPPING] || objectType;

      // Simulate the alert condition based on YOLO confidence threshold
      // Only alert if confidence is above a certain threshold (0.75) and it's a suspicious item
      const shouldTriggerAlert = detected && 
        (confidenceLevel > 0.75) && 
        ['knife', 'fork', 'scissors', 'baseball bat', 'cell phone'].includes(objectType);

      if (shouldTriggerAlert) {
        console.log(`YOLO-like detection: ${displayType} detected with ${Math.round(confidenceLevel * 100)}% confidence`);
      }

      return {
        detected: shouldTriggerAlert,
        alert_id: shouldTriggerAlert ? `alert-${Date.now()}` : null,
        object_type: shouldTriggerAlert ? objectType : null,
        confidence: confidenceLevel,
        timestamp: new Date().toISOString(),
        message: shouldTriggerAlert ? `Alert: ${displayType} detected at Camera ${cameraId} (${Math.round(confidenceLevel * 100)}% confidence)` : null,
        bounding_box: shouldTriggerAlert ? boundingBox : null,
      };
    }
  } catch (error) {
    console.error("Error sending image for detection:", error);
    throw error;
  }
};

// Fetch alerts from backend
export const fetchAlerts = async (): Promise<any> => {
  try {
    try {
      // Try to connect to the real backend first
      const response = await fetch(ENDPOINTS.alerts);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn("Backend connection failed, using mock alerts:", error);
      
      // Generate 5-15 mock alerts if backend is not available
      const alertCount = 5 + Math.floor(Math.random() * 10);
      const mockAlerts = [];
      
      for (let i = 0; i < alertCount; i++) {
        const timestamp = new Date();
        timestamp.setMinutes(timestamp.getMinutes() - Math.floor(Math.random() * 60 * 24)); // Random time in last 24 hours
        
        const cameraId = `cam-${1 + Math.floor(Math.random() * 4)}`;
        
        // Simulate YOLO-detected objects with higher probability for dangerous items
        const objectTypeDistribution = [
          'knife', 'knife', 'knife', 'knife', // 4x chance for knives
          'fork', 'fork', // 2x chance for forks
          'scissors', 'scissors', // 2x chance for scissors
          'baseball bat', 'baseball bat', // 2x chance for bats
          'cell phone', 'cell phone' // 2x chance for cell phones
        ];
        const objectType = objectTypeDistribution[Math.floor(Math.random() * objectTypeDistribution.length)];
        
        // Get display name for the message
        const displayType = DISPLAY_TYPE_MAPPING[objectType.toLowerCase() as keyof typeof DISPLAY_TYPE_MAPPING] || objectType;
        
        mockAlerts.push({
          id: `mock-alert-${i}`,
          camera_id: cameraId,
          object_type: objectType,
          timestamp: timestamp.toISOString(),
          confidence: (0.75 + Math.random() * 0.24).toFixed(2),
          message: `YOLO detected ${displayType} at Camera ${cameraId}`,
        });
      }
      
      return mockAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  } catch (error) {
    console.error("Error fetching alerts:", error);
    throw error;
  }
};
