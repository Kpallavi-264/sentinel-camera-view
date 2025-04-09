
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCamera } from "@/context/CameraContext";
import { 
  Activity, 
  Clock, 
  BarChart2, 
  ArrowUp, 
  EyeOff, 
  AlertTriangle 
} from "lucide-react";

const AnalyticsPanel: React.FC = () => {
  const { cameras, totalDetections, systemUptime } = useCamera();
  
  const activeCameras = cameras.filter(cam => cam.status === "active" || cam.status === "alert").length;
  const alertCameras = cameras.filter(cam => cam.status === "alert").length;
  
  // Format uptime in days/hours
  const formatUptime = (minutes: number) => {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Activity className="h-4 w-4 mr-2 text-info" />
          System Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              System Uptime
            </div>
            <div className="font-medium">{formatUptime(systemUptime)}</div>
          </div>
          <Progress value={(systemUptime % 1440) / 1440 * 100} className="h-2" />
        </div>
        
        <div className="grid grid-cols-1 gap-4 pt-2">
          <div className="flex items-center p-3 rounded-md bg-secondary/50 border border-border">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">Total Detections</div>
              <div className="text-2xl font-semibold">{totalDetections}</div>
            </div>
          </div>
          
          <div className="flex items-center p-3 rounded-md bg-secondary/50 border border-border">
            <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center mr-3">
              <ArrowUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="text-sm font-medium">Active Cameras</div>
              <div className="text-2xl font-semibold">{activeCameras} / {cameras.length}</div>
            </div>
          </div>
          
          <div className="flex items-center p-3 rounded-md bg-secondary/50 border border-border">
            <div className="h-10 w-10 rounded-full bg-alert/20 flex items-center justify-center mr-3">
              <AlertTriangle className="h-5 w-5 text-alert" />
            </div>
            <div>
              <div className="text-sm font-medium">Alert Status</div>
              <div className="text-2xl font-semibold">{alertCameras}</div>
            </div>
          </div>
          
          <div className="flex items-center p-3 rounded-md bg-secondary/50 border border-border">
            <div className="h-10 w-10 rounded-full bg-inactive/20 flex items-center justify-center mr-3">
              <EyeOff className="h-5 w-5 text-inactive" />
            </div>
            <div>
              <div className="text-sm font-medium">Inactive Cameras</div>
              <div className="text-2xl font-semibold">
                {cameras.filter(cam => cam.status === "inactive").length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsPanel;
