
import React, { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCamera } from "@/context/CameraContext";
import { BellRing, Clock, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const AlertList: React.FC = () => {
  const { alerts, cameras, loadAlerts } = useCamera();
  const [isLoading, setIsLoading] = React.useState(false);

  const getCameraName = (cameraId: string) => {
    const camera = cameras.find((cam) => cam.id === cameraId);
    return camera ? camera.name : "Unknown Camera";
  };
  
  const handleRefreshAlerts = async () => {
    try {
      setIsLoading(true);
      await loadAlerts();
      toast.success("Alerts refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh alerts");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load of alerts
  useEffect(() => {
    handleRefreshAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasSuspiciousItems = alerts.some(alert => 
    ["Knife", "Bat", "Rope"].includes(alert.objectType)
  );

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <BellRing className="h-4 w-4 mr-2 text-alert" />
            Alert Log
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshAlerts}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        {hasSuspiciousItems && (
          <Alert variant="destructive" className="mx-4 mt-2 mb-3">
            <AlertDescription>
              Suspicious items detected on camera feed. Security team has been notified.
            </AlertDescription>
          </Alert>
        )}
        <ScrollArea className="h-[calc(100vh-280px)] md:h-[380px]">
          <div className="px-4">
            {isLoading && alerts.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <p>Loading alerts...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No alerts detected yet</p>
                <p className="text-sm mt-1">Alerts will appear here when detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-md border border-border ${
                      ["Knife", "Bat", "Rope"].includes(alert.objectType)
                        ? "bg-destructive/10 border-destructive/30"
                        : "bg-secondary/50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-sm">
                        {alert.objectType} Detected
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Location: {getCameraName(alert.cameraId)}
                    </div>
                    <div className="text-xs mt-1">{alert.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AlertList;
