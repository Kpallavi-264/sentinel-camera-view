import { useEffect, useState } from "react";
import { Alert, Camera } from "@/types/camera";
import { fetchAlerts } from "@/services/apiService";

export const useAlerts = (cameras: Camera[]) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [totalDetections, setTotalDetections] = useState(0);

  // Load alerts from the backend
  const loadAlerts = async () => {
    try {
      const apiAlerts = await fetchAlerts();
      
      // Convert the API response to our Alert interface format
      const formattedAlerts: Alert[] = apiAlerts.map((alert: any) => ({
        id: alert.id || `alert-${Date.now()}-${Math.random()}`,
        cameraId: alert.camera_id,
        objectType: alert.object_type || "Unknown",
        timestamp: new Date(alert.timestamp),
        message: alert.message || `Detected ${alert.object_type} at Camera ${alert.camera_id}`,
      }));
      
      setAlerts(formattedAlerts);
      setTotalDetections(formattedAlerts.length);
    } catch (error) {
      console.error("Failed to load alerts:", error);
      // Keep the mock alerts if API fails
    }
  };

  // Initial alerts loading
  useEffect(() => {
    loadAlerts();
    
    // Set up interval to periodically fetch alerts
    const alertsInterval = setInterval(() => {
      loadAlerts();
    }, 30000); // Check for new alerts every 30 seconds
    
    return () => clearInterval(alertsInterval);
  }, []);

  // Simulate periodic alerts for active cameras
  useEffect(() => {
    const OBJECT_TYPES = ["Person", "Vehicle", "Animal", "Unknown"];
    
    const interval = setInterval(() => {
      const activeCameras = cameras.filter((cam) => cam.status === "active");
      
      if (activeCameras.length > 0) {
        // Randomly select a camera to trigger an alert
        const randomIndex = Math.floor(Math.random() * activeCameras.length);
        const camera = activeCameras[randomIndex];
        
        // Random object type
        const objectType = OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];
        
        // Create a new alert
        const newAlert: Alert = {
          id: `alert-${Date.now()}`,
          cameraId: camera.id,
          objectType,
          timestamp: new Date(),
          message: `Detected ${objectType} at ${camera.name}`,
        };
        
        setAlerts((prev) => [newAlert, ...prev].slice(0, 100)); // Keep only latest 100 alerts
        setTotalDetections((prev) => prev + 1);
      }
    }, 20000); // Check every 20 seconds
    
    return () => clearInterval(interval);
  }, [cameras]);

  return {
    alerts,
    setAlerts,
    totalDetections,
    setTotalDetections,
    loadAlerts
  };
};
