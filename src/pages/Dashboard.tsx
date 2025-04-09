
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCamera } from "@/context/CameraContext";
import DashboardHeader from "@/components/DashboardHeader";
import CameraCard from "@/components/CameraCard";
import AlertList from "@/components/AlertList";
import AnalyticsPanel from "@/components/AnalyticsPanel";

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const { cameras } = useCamera();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated || !user) return null;
  
  const isAdmin = user.role === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      
      <main className="flex-grow px-4 py-6 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {cameras.map((camera) => (
            <CameraCard key={camera.id} cameraId={camera.id} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AlertList />
          </div>
          <div>
            {isAdmin && <AnalyticsPanel />}
            {!isAdmin && (
              <div className="h-full flex items-center justify-center border border-dashed rounded-lg p-6 bg-secondary/20">
                <p className="text-center text-muted-foreground">
                  Analytics panel is only available for admin users.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
