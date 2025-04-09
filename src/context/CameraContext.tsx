import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { sendImageForDetection, fetchAlerts } from "@/services/apiService";

export type CameraStatus = "active" | "alert" | "inactive";

export interface Alert {
  id: string;
  cameraId: string;
  objectType: string;
  timestamp: Date;
  message: string;
}

export interface Camera {
  id: string;
  name: string;
  status: CameraStatus;
  stream: MediaStream | null;
  lastImage: string | null;
  lastUpdated: Date;
}

interface CameraContextType {
  cameras: Camera[];
  alerts: Alert[];
  startCamera: (cameraId: string) => void;
  stopCamera: (cameraId: string) => void;
  captureImage: (cameraId: string) => Promise<string | null>;
  totalDetections: number;
  systemUptime: number; // in minutes
  loadAlerts: () => Promise<void>;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

// Initial camera setup
const initialCameras: Camera[] = [
  {
    id: "cam-1",
    name: "Front Entrance",
    status: "inactive",
    stream: null,
    lastImage: null,
    lastUpdated: new Date(),
  },
  {
    id: "cam-2",
    name: "Back Door",
    status: "inactive",
    stream: null,
    lastImage: null,
    lastUpdated: new Date(),
  },
  {
    id: "cam-3",
    name: "Parking Lot",
    status: "inactive",
    stream: null,
    lastImage: null,
    lastUpdated: new Date(),
  },
  {
    id: "cam-4",
    name: "Reception",
    status: "inactive",
    stream: null,
    lastImage: null,
    lastUpdated: new Date(),
  },
];

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cameras, setCameras] = useState<Camera[]>(initialCameras);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [totalDetections, setTotalDetections] = useState(0);
  const [systemUptime, setSystemUptime] = useState(0);

  // Simulate system uptime
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemUptime((prev) => prev + 1);
    }, 60000); // Increment every minute

    // Initial uptime
    setSystemUptime(Math.floor(Math.random() * 1000));

    return () => clearInterval(interval);
  }, []);

  // Initial alerts loading
  useEffect(() => {
    loadAlerts();
    
    // Set up interval to periodically fetch alerts
    const alertsInterval = setInterval(() => {
      loadAlerts();
    }, 30000); // Check for new alerts every 30 seconds
    
    return () => clearInterval(alertsInterval);
  }, []);

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

  // Cleanup camera streams on unmount
  useEffect(() => {
    return () => {
      cameras.forEach((camera) => {
        if (camera.stream) {
          camera.stream.getTracks().forEach((track) => track.stop());
        }
      });
    };
  }, [cameras]);

  // Simulate periodic alerts for active cameras
  useEffect(() => {
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
        
        // Update camera status to alert temporarily
        setCameras((prev) =>
          prev.map((cam) =>
            cam.id === camera.id ? { ...cam, status: "alert" as CameraStatus } : cam
          )
        );
        
        // Set camera back to active after 5 seconds
        setTimeout(() => {
          setCameras((prev) =>
            prev.map((cam) =>
              cam.id === camera.id ? { ...cam, status: "active" as CameraStatus } : cam
            )
          );
        }, 5000);
      }
    }, 20000); // Check every 20 seconds
    
    return () => clearInterval(interval);
  }, [cameras]);

  const startCamera = async (cameraId: string) => {
    try {
      const camera = cameras.find((cam) => cam.id === cameraId);
      if (!camera) return;

      // Stop any existing stream
      if (camera.stream) {
        camera.stream.getTracks().forEach((track) => track.stop());
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      setCameras((prev) =>
        prev.map((cam) =>
          cam.id === cameraId
            ? {
                ...cam,
                status: "active",
                stream,
                lastUpdated: new Date(),
              }
            : cam
        )
      );

      toast.success(`${camera.name} is now active`);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error(`Failed to access camera: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const stopCamera = (cameraId: string) => {
    const camera = cameras.find((cam) => cam.id === cameraId);
    if (!camera) return;

    if (camera.stream) {
      camera.stream.getTracks().forEach((track) => track.stop());
    }

    setCameras((prev) =>
      prev.map((cam) =>
        cam.id === cameraId
          ? {
              ...cam,
              status: "inactive",
              stream: null,
              lastUpdated: new Date(),
            }
          : cam
      )
    );

    toast.info(`${camera.name} has been deactivated`);
  };

  const captureImage = async (cameraId: string): Promise<string | null> => {
    const camera = cameras.find((cam) => cam.id === cameraId);
    if (!camera || !camera.stream) return null;

    try {
      // Create a video element to capture the frame
      const video = document.createElement('video');
      video.srcObject = camera.stream;
      video.play();

      // Wait for the video to be ready
      await new Promise((resolve) => {
        video.onplaying = resolve;
      });

      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;
      
      // Draw the current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      
      // Update the camera's last image
      setCameras((prev) =>
        prev.map((cam) =>
          cam.id === cameraId
            ? {
                ...cam,
                lastImage: imageDataUrl,
                lastUpdated: new Date(),
              }
            : cam
        )
      );
      
      // Send the captured image to the backend for detection
      try {
        const detectionResult = await sendImageForDetection(cameraId, imageDataUrl);
        
        // If detection found something suspicious
        if (detectionResult && detectionResult.detected) {
          // Update camera status to alert
          setCameras((prev) =>
            prev.map((cam) =>
              cam.id === cameraId ? { ...cam, status: "alert" as CameraStatus } : cam
            )
          );
          
          // Create a new alert from the detection result
          const newAlert: Alert = {
            id: detectionResult.alert_id || `alert-${Date.now()}`,
            cameraId: cameraId,
            objectType: detectionResult.object_type || "Unknown",
            timestamp: new Date(),
            message: detectionResult.message || `Detected suspicious object at ${camera.name}`,
          };
          
          setAlerts((prev) => [newAlert, ...prev].slice(0, 100)); // Keep only latest 100 alerts
          setTotalDetections((prev) => prev + 1);
          
          // Set camera back to active after 5 seconds
          setTimeout(() => {
            setCameras((prev) =>
              prev.map((cam) =>
                cam.id === cameraId ? { ...cam, status: "active" as CameraStatus } : cam
              )
            );
          }, 5000);
        }
      } catch (error) {
        console.error("Error processing detection:", error);
        // If API fails, fallback to local mock detection logic
      }
      
      return imageDataUrl;
    } catch (error) {
      console.error("Error capturing image:", error);
      return null;
    }
  };

  return (
    <CameraContext.Provider
      value={{
        cameras,
        alerts,
        startCamera,
        stopCamera,
        captureImage,
        totalDetections,
        systemUptime,
        loadAlerts,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
};

// Mock object types for detection
const OBJECT_TYPES = ["Person", "Vehicle", "Animal", "Unknown"];

export const useCamera = (): CameraContextType => {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error("useCamera must be used within a CameraProvider");
  }
  return context;
};
