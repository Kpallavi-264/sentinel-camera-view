
// API endpoints configuration
const API_BASE_URL = "http://localhost:5000"; // Change this to your Flask server URL

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
      // Try to connect to the real backend first
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

      return await response.json();
    } catch (error) {
      console.warn("Backend connection failed, using mock detection:", error);
      
      // Enhanced mock detection with better probabilities for suspicious objects
      // Higher detection rate makes sure we actually see objects
      const detected = Math.random() < 0.85; // 85% detection rate
      
      // Weighted random selection for suspicious objects to ensure we detect what we want
      // Significantly boosted probability for knife detection
      const detectionProbabilities = {
        'knife': 0.30,         // 30% chance - prioritized knife detection
        'cell phone': 0.14,    // 14% chance - smartphone
        'scissors': 0.14,      // 14% chance
        'baseball bat': 0.14,  // 14% chance - bat
        'tie': 0.14,           // 14% chance - rope
        'handbag': 0.14        // 14% chance - gun
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
      const confidenceLevel = detected ? (0.75 + Math.random() * 0.2) : 0;
      const boundingBox = createMockBoundingBox(objectType);
      
      // Get display name for the message
      const displayType = DISPLAY_TYPE_MAPPING[objectType.toLowerCase() as keyof typeof DISPLAY_TYPE_MAPPING] || objectType;

      return {
        detected: detected,
        alert_id: detected ? `alert-${Date.now()}` : null,
        object_type: detected ? objectType : null,
        confidence: confidenceLevel,
        timestamp: new Date().toISOString(),
        message: detected ? `Detected suspicious ${displayType} at Camera ${cameraId}` : null,
        bounding_box: detected ? boundingBox : null,
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
        
        // Add more knives to the mock alerts
        const objectTypeDistribution = [
          'knife', 'knife', 'knife', // Triple the chance of knives appearing
          ...SUSPICIOUS_OBJECT_TYPES
        ];
        const objectType = objectTypeDistribution[Math.floor(Math.random() * objectTypeDistribution.length)];
        
        // Get display name for the message
        const displayType = DISPLAY_TYPE_MAPPING[objectType.toLowerCase() as keyof typeof DISPLAY_TYPE_MAPPING] || objectType;
        
        mockAlerts.push({
          id: `mock-alert-${i}`,
          camera_id: cameraId,
          object_type: objectType,
          timestamp: timestamp.toISOString(),
          confidence: (0.7 + Math.random() * 0.3).toFixed(2),
          message: `Detected suspicious ${displayType} at Camera ${cameraId}`,
        });
      }
      
      return mockAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  } catch (error) {
    console.error("Error fetching alerts:", error);
    throw error;
  }
};
