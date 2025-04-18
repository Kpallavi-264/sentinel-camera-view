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

// Updated mock detection logic
const createMockBoundingBox = (objectType: string) => {
  switch(objectType) {
    case 'cell phone':
      return {
        x: 0.3 + (Math.random() * 0.3),
        y: 0.3 + (Math.random() * 0.3),
        width: 0.1 + (Math.random() * 0.1),
        height: 0.2 + (Math.random() * 0.1),
      };
    case 'scissors':
    case 'knife':
      return {
        x: 0.2 + (Math.random() * 0.4),
        y: 0.2 + (Math.random() * 0.4),
        width: 0.08 + (Math.random() * 0.08),
        height: 0.15 + (Math.random() * 0.1),
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
      const detected = Math.random() < 0.85; // 85% detection rate
      
      // Weighted random selection for suspicious objects
      const detectionProbabilities = {
        'cell phone': 0.25,    // 25% chance
        'scissors': 0.15,      // 15% chance
        'knife': 0.15,         // 15% chance
        'baseball bat': 0.15,  // 15% chance
        'tie': 0.15,          // 15% chance for rope equivalent
        'handbag': 0.15       // 15% chance for gun equivalent
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

      const confidenceLevel = detected ? (0.75 + Math.random() * 0.2) : 0; // Higher confidence range
      const boundingBox = createMockBoundingBox(objectType);

      return {
        detected: detected,
        alert_id: detected ? `alert-${Date.now()}` : null,
        object_type: detected ? objectType : null,
        confidence: confidenceLevel,
        timestamp: new Date().toISOString(),
        message: detected ? `Detected suspicious ${objectType} at Camera ${cameraId}` : null,
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
