
import { useState } from "react";
import { Camera, CameraStatus } from "@/types/camera";
import { toast } from "sonner";
import { sendImageForDetection } from "@/services/apiService";

interface CameraOperationsProps {
  cameras: Camera[];
  setCameras: React.Dispatch<React.SetStateAction<Camera[]>>;
  setAlerts: React.Dispatch<React.SetStateAction<any[]>>;
  setTotalDetections: React.Dispatch<React.SetStateAction<number>>;
}

export const useCameraOperations = ({
  cameras,
  setCameras,
  setAlerts,
  setTotalDetections,
}: CameraOperationsProps) => {

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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
      setIsProcessing(true);
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
          const newAlert = {
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
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    startCamera,
    stopCamera,
    captureImage,
    isProcessing,
  };
};
