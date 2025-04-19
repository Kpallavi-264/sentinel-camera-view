
import { useState } from "react";
import { Camera, CameraStatus, DetectedObject } from "@/types/camera";
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
  // Track the current active camera stream for reuse
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

  const startCamera = async (cameraId: string) => {
    try {
      const camera = cameras.find((cam) => cam.id === cameraId);
      if (!camera) return;

      // Get or reuse a stream
      let stream: MediaStream;
      
      // If we already have a stream active, clone it for the new camera
      if (currentStream && currentStream.active) {
        stream = currentStream;
      } else {
        // Request camera access if no stream exists
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setCurrentStream(stream);
      }
      
      // Create a clone of the track to use for this camera
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error("No video track available");
      }
      
      // Update the camera status and add the stream
      setCameras((prev) =>
        prev.map((cam) =>
          cam.id === cameraId
            ? {
                ...cam,
                status: "active",
                stream: stream,
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

    // Only stop the overall stream if no cameras are using it
    const activeStreams = cameras.filter(
      (cam) => cam.id !== cameraId && cam.status === "active"
    );
    
    if (activeStreams.length === 0 && currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      setCurrentStream(null);
    }

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
          // Handle main detection that triggered the alert
          const mainDetection: DetectedObject = {
            type: detectionResult.object_type || "Unknown",
            confidence: detectionResult.confidence || 0.8,
            boundingBox: detectionResult.bounding_box || {
              x: 0.1,
              y: 0.1,
              width: 0.2,
              height: 0.2
            }
          };
          
          // Handle all detections (if available)
          let allDetections = [mainDetection];
          
          if (detectionResult.all_detections && Array.isArray(detectionResult.all_detections)) {
            allDetections = detectionResult.all_detections;
          }
          
          // Update camera status to alert and add detected objects
          setCameras((prev) =>
            prev.map((cam) =>
              cam.id === cameraId ? { 
                ...cam, 
                status: "alert" as CameraStatus,
                detectedObjects: allDetections 
              } : cam
            )
          );
          
          // Create a new alert from the detection result
          const newAlert = {
            id: detectionResult.alert_id || `alert-${Date.now()}`,
            cameraId: cameraId,
            objectType: detectionResult.object_type || "Unknown",
            timestamp: new Date(),
            message: detectionResult.message || `Detected suspicious object at ${camera.name}`,
            boundingBox: detectionResult.bounding_box,
          };
          
          setAlerts((prev) => [newAlert, ...prev].slice(0, 100)); // Keep only latest 100 alerts
          setTotalDetections((prev) => prev + 1);
          
          // Set camera back to active after 5 seconds and clear detected objects
          setTimeout(() => {
            setCameras((prev) =>
              prev.map((cam) =>
                cam.id === cameraId ? { 
                  ...cam, 
                  status: "active" as CameraStatus,
                  detectedObjects: [] // Clear detected objects after alert
                } : cam
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
