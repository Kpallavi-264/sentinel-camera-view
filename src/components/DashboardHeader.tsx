
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, ShieldCheck, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="py-4 border-b border-border">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Camera className="h-8 w-8 text-primary" />
              <ShieldCheck className="h-4 w-4 text-info absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Sentinel Camera System</h1>
              <p className="text-xs text-muted-foreground">
                {user?.role === "admin" ? "Admin Dashboard" : "Operator View"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right mr-2">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role} Role</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
