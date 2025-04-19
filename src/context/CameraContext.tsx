
import React, { createContext, useContext, useState, useEffect } from "react";
import { Camera, Alert, initialCameras, DetectedObject } from "@/types/camera";
import { useCameraOperations } from "@/hooks/useCameraOperations";
import { useAlerts } from "@/hooks/useAlerts";
import { useSystemUptime } from "@/hooks/useSystemUptime";
import { toast } from "sonner";

interface CameraContextType {
  cameras: Camera[];
  alerts: Alert[];
  startCamera: (cameraId: string) => Promise<void>;
  stopCamera: (cameraId: string) => void;
  captureImage: (cameraId: string) => Promise<string | null>;
  totalDetections: number;
  systemUptime: number; // in minutes
  loadAlerts: () => Promise<void>;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cameras, setCameras] = useState<Camera[]>(initialCameras);
  const { systemUptime } = useSystemUptime();
  const { 
    alerts, 
    setAlerts, 
    totalDetections, 
    setTotalDetections, 
    loadAlerts 
  } = useAlerts(cameras);
  
  const { 
    startCamera, 
    stopCamera, 
    captureImage 
  } = useCameraOperations({
    cameras,
    setCameras,
    setAlerts,
    setTotalDetections
  });

  // Show backend connection message on mount
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch("http://localhost:5000/alerts");
        if (response.ok) {
          toast.success("Connected to detection server", {
            description: "Using real-time object detection"
          });
        }
      } catch (error) {
        toast.warning("Detection server not connected", {
          description: "Follow the README instructions to start the Python backend for accurate detection"
        });
      }
    };
    
    checkBackendConnection();
  }, []);

  // Cleanup camera streams on unmount
  useEffect(() => {
    return () => {
      cameras.forEach((camera) => {
        if (camera.stream) {
          camera.stream.getTracks().forEach((track) => track.stop());
        }
      });
    };
  }, []);

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

export const useCamera = (): CameraContextType => {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error("useCamera must be used within a CameraProvider");
  }
  return context;
};
