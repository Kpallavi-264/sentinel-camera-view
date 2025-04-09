
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

type Role = "admin" | "operator" | null;

type User = {
  id: string;
  username: string;
  role: Role;
};

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS = [
  { id: "1", username: "admin", password: "admin123", role: "admin" as Role },
  { id: "2", username: "operator", password: "operator123", role: "operator" as Role },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved user on mount
    const savedUser = localStorage.getItem("securityUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const foundUser = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("securityUser", JSON.stringify(userWithoutPassword));
      toast.success(`Welcome back, ${username}!`);
      return true;
    } else {
      toast.error("Invalid username or password");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("securityUser");
    toast.info("You have been logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
