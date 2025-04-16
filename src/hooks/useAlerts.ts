import { useEffect, useState } from "react";
import { Alert, Camera } from "@/types/camera";
import { fetchAlerts } from "@/services/apiService";
import { toast } from "sonner";

export const useAlerts = (cameras: Camera[]) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [totalDetections, setTotalDetections] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load alerts from the backend
  const loadAlerts = async () => {
    setIsLoading(true);
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
      toast.error("Failed to load alerts");
      // Keep existing alerts if API fails
    } finally {
      setIsLoading(false);
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
    const SUSPICIOUS_OBJECTS = ["Knife", "Bat", "Rope"];
    
    const interval = setInterval(() => {
      const activeCameras = cameras.filter((cam) => cam.status === "active");
      
      if (activeCameras.length > 0 && Math.random() < 0.3) { // 30% chance of generating alert
        // Randomly select a camera to trigger an alert
        const randomIndex = Math.floor(Math.random() * activeCameras.length);
        const camera = activeCameras[randomIndex];
        
        // Random object type
        const objectType = SUSPICIOUS_OBJECTS[Math.floor(Math.random() * SUSPICIOUS_OBJECTS.length)];
        
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
    loadAlerts,
    isLoading
  };
};
