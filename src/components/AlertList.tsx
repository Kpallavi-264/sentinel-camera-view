
import React, { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCamera } from "@/context/CameraContext";
import { BellRing, Clock, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <ScrollArea className="h-[calc(100vh-280px)] md:h-[380px]">
          <div className="px-4">
            {alerts.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No alerts detected yet</p>
                <p className="text-sm mt-1">Alerts will appear here when detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className="p-3 rounded-md bg-secondary/50 border border-border"
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
