
import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Power, PowerOff, RefreshCw, AlertTriangle } from "lucide-react";
import { useCamera } from "@/context/CameraContext";
import { CameraStatus } from "@/types/camera";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface CameraCardProps {
  cameraId: string;
}

const CameraCard: React.FC<CameraCardProps> = ({ cameraId }) => {
  const { cameras, startCamera, stopCamera, captureImage } = useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const camera = cameras.find((cam) => cam.id === cameraId);
  
  useEffect(() => {
    if (!camera) return;
    
    // Update the "last updated" text every minute
    const updateLastUpdatedText = () => {
      if (camera.lastUpdated) {
        setLastUpdatedText(formatDistanceToNow(camera.lastUpdated, { addSuffix: true }));
      }
    };
    
    updateLastUpdatedText();
    const interval = setInterval(updateLastUpdatedText, 60000);
    
    return () => clearInterval(interval);
  }, [camera]);
  
  // Handle video stream connection and disconnection
  useEffect(() => {
    if (!camera || !videoRef.current) return;
    
    if (camera.stream && camera.status === "active") {
      videoRef.current.srcObject = camera.stream;
      
      // Set up periodic image capture every 10 seconds
      const captureInterval = setInterval(async () => {
        try {
          setIsProcessing(true);
          await captureImage(cameraId);
        } finally {
          setIsProcessing(false);
        }
      }, 10000);
      
      return () => clearInterval(captureInterval);
    } else if (camera.status !== "active" && videoRef.current.srcObject) {
      // Clear the video element if camera is inactive
      videoRef.current.srcObject = null;
    }
  }, [camera, cameraId, captureImage]);
  
  if (!camera) return null;
  
  const handleToggleCamera = async () => {
    if (camera.status === "inactive") {
      await startCamera(cameraId);
    } else {
      stopCamera(cameraId);
    }
  };
  
  const handleManualCapture = async () => {
    try {
      setIsProcessing(true);
      toast.info(`Processing frame from ${camera.name}...`);
      await captureImage(cameraId);
      toast.success(`Frame processed from ${camera.name}`);
    } catch (error) {
      toast.error(`Error processing frame: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card className={`overflow-hidden h-full flex flex-col ${camera.status === "alert" ? "border-destructive pulse-border" : ""}`}>
      <CardHeader className="space-y-0 p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            <Camera className="h-4 w-4 mr-2" />
            {camera.name}
          </CardTitle>
          <div className={`status-indicator ${camera.status}`}>
            <div className="pulse-ring"></div>
            {camera.status === "active" ? "Active" : camera.status === "alert" ? "Alert!" : "Inactive"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow relative">
        <div className="camera-container">
          {camera.status !== "inactive" ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={camera.status === "alert" ? "border-2 border-destructive animate-pulse" : ""}
            />
          ) : camera.lastImage ? (
            <img 
              src={camera.lastImage}
              alt={`Last frame from ${camera.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Camera className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
          )}
          
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="flex flex-col items-center">
                <AlertTriangle className="h-8 w-8 text-warning animate-pulse mb-2" />
                <p className="text-sm font-medium">Processing frame...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 flex justify-between bg-muted/50">
        <div className="text-xs text-muted-foreground">
          {lastUpdatedText ? `Updated ${lastUpdatedText}` : "Not yet activated"}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualCapture}
            disabled={camera.status === "inactive" || isProcessing}
            title="Capture Image"
          >
            <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant={camera.status === "inactive" ? "default" : "destructive"}
            size="sm"
            onClick={handleToggleCamera}
            disabled={isProcessing}
          >
            {camera.status === "inactive" ? (
              <Power className="h-4 w-4" />
            ) : (
              <PowerOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CameraCard;
