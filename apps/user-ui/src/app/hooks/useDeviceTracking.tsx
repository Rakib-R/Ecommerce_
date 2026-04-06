'use client'

import { useEffect, useState } from "react";

const useDeviceTracking = () => {
  const [deviceInfo, setDeviceInfo] = useState("");

  useEffect(() => {
    fetch("/api")
      .then(res => res.json())
      .then(data => setDeviceInfo(data.deviceInfo));
  }, []);

  return deviceInfo;
};

export default useDeviceTracking;