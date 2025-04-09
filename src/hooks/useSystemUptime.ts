
import { useState, useEffect } from "react";

export const useSystemUptime = () => {
  const [systemUptime, setSystemUptime] = useState(0);

  // Simulate system uptime
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemUptime((prev) => prev + 1);
    }, 60000); // Increment every minute

    // Initial uptime
    setSystemUptime(Math.floor(Math.random() * 1000));

    return () => clearInterval(interval);
  }, []);

  return { systemUptime };
};
