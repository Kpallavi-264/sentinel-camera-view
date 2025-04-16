// API endpoints configuration
const API_BASE_URL = "http://localhost:5000"; // Change this to your Flask server URL

// API endpoints
const ENDPOINTS = {
  detect: `${API_BASE_URL}/detect`,
  alerts: `${API_BASE_URL}/alerts`,
};

// Mock data for when the backend is not available
const MOCK_OBJECT_TYPES = ["Person", "Vehicle", "Animal", "Phone", "Knife", "Bat", "Rope", "Gun"];
const SUSPICIOUS_OBJECT_TYPES = ["Phone", "Knife", "Bat", "Rope", "Gun"];

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
      
      // Create a mock detection response with 20% chance of detecting something
      const detected = Math.random() < 0.2;
      const objectType = MOCK_OBJECT_TYPES[Math.floor(Math.random() * MOCK_OBJECT_TYPES.length)];
      const isSuspicious = SUSPICIOUS_OBJECT_TYPES.includes(objectType);
      
      // Generate a random bounding box
      const boundingBox = {
        x: Math.random() * 0.7, // Keep within 70% of the width to ensure visibility
        y: Math.random() * 0.7, // Keep within 70% of the height
        width: 0.2 + Math.random() * 0.1, // 20-30% of the container width
        height: 0.2 + Math.random() * 0.1, // 20-30% of the container height
      };

      // Only trigger alert for suspicious objects
      return {
        detected: detected && isSuspicious,
        alert_id: detected && isSuspicious ? `alert-${Date.now()}` : null,
        object_type: detected ? objectType : null,
        confidence: detected ? (0.7 + Math.random() * 0.3) : 0,
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
        const objectType = ["Knife", "Bat", "Rope"][Math.floor(Math.random() * 3)];
        
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
