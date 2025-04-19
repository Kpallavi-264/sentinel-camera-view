
import React, { createContext, useContext, useState, useEffect } from "react";
import { Camera, Alert, initialCameras, DetectedObject } from "@/types/camera";
import { useCameraOperations } from "@/hooks/useCameraOperations";
import { useAlerts } from "@/hooks/useAlerts";
import { useSystemUptime } from "@/hooks/useSystemUptime";

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
