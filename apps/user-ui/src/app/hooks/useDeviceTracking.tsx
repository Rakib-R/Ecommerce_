 
 "use client";
import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

const useDeviceTracking = () => {
  const [deviceInfo, setDeviceInfo] = useState("");

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    
    setDeviceInfo(
      `${result.device.type || "Desktop"} - ${result.os.name} ${result.os.version || ""} - ${result.browser.name}`
    );
  }, []);

  return deviceInfo;
};

export default useDeviceTracking;