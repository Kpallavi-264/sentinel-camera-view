
// API endpoints configuration
const API_BASE_URL = "http://localhost:5000"; // Change this to your Flask server URL

// API endpoints
const ENDPOINTS = {
  detect: `${API_BASE_URL}/detect`,
  alerts: `${API_BASE_URL}/alerts`,
};

// COCO class names (80 classes in MS COCO dataset)
const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 
  'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 
  'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 
  'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 
  'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 
  'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 
  'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 
  'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 
  'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 
  'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 
  'hair drier', 'toothbrush'
];

// Suspicious object types that should trigger alerts
const SUSPICIOUS_OBJECT_TYPES = [
  'cell phone', 'knife', 'baseball bat', 'tennis racket', 'scissors', 'sports ball'
];

// Function to create a mock bounding box that's better positioned
const createMockBoundingBox = (objectType: string) => {
  // For phones, create more centrally positioned bounding boxes
  if (objectType === "cell phone") {
    return {
      x: 0.3 + (Math.random() * 0.3), // Keep within central 30-60% of width
      y: 0.3 + (Math.random() * 0.3), // Keep within central 30-60% of height
      width: 0.1 + (Math.random() * 0.1), // 10-20% of container width (phone-sized)
      height: 0.2 + (Math.random() * 0.1), // 20-30% of container height (phone-sized)
    };
  }
  
  // For other objects
  return {
    x: Math.random() * 0.7, // Keep within 70% of the width to ensure visibility
    y: Math.random() * 0.7, // Keep within 70% of the height
    width: 0.2 + Math.random() * 0.1, // 20-30% of the container width
    height: 0.2 + Math.random() * 0.1, // 20-30% of the container height
  };
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
      
      // Increase detection chance to 90% for much better detection rate
      const detected = Math.random() < 0.9;
      
      // 70% chance to detect a person, 20% for cell phone, 10% for other objects
      const detectionType = Math.random();
      let objectType;
      
      if (detectionType < 0.7) {
        objectType = "person";
      } else if (detectionType < 0.9) {
        objectType = "cell phone";
      } else {
        // Pick a random COCO class from the suspicious list
        objectType = SUSPICIOUS_OBJECT_TYPES[Math.floor(Math.random() * SUSPICIOUS_OBJECT_TYPES.length)];
      }
      
      const isSuspicious = SUSPICIOUS_OBJECT_TYPES.includes(objectType);
      
      // Generate an appropriate bounding box based on object type
      const boundingBox = createMockBoundingBox(objectType);
      
      // Set confidence level
      const confidenceLevel = detected ? (0.7 + Math.random() * 0.3) : 0;

      return {
        detected: detected,
        alert_id: detected && isSuspicious ? `alert-${Date.now()}` : null,
        object_type: detected ? objectType : null,
        confidence: confidenceLevel,
        timestamp: new Date().toISOString(),
        message: detected && isSuspicious ? `Detected suspicious ${objectType} at Camera ${cameraId}` : null,
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
        const objectType = SUSPICIOUS_OBJECT_TYPES[Math.floor(Math.random() * SUSPICIOUS_OBJECT_TYPES.length)];
        
        mockAlerts.push({
          id: `mock-alert-${i}`,
          camera_id: cameraId,
          object_type: objectType,
          timestamp: timestamp.toISOString(),
          confidence: (0.7 + Math.random() * 0.3).toFixed(2),
          message: `Detected suspicious ${objectType} at Camera ${cameraId}`,
        });
      }
      
      return mockAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  } catch (error) {
    console.error("Error fetching alerts:", error);
    throw error;
  }
};
