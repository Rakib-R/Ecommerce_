import { UAParser } from "ua-parser-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    let country = 
      request.headers.get("x-vercel-ip-country") || 
      request.headers.get("cf-ipcountry") || 
      "Unknown";

    let city = 
      request.headers.get("x-vercel-ip-city") || 
      "Unknown";

       if (!country || country === "Unknown") {
    try {
      const response = await fetch("https://ipinfo.io", {
        headers: { "Authorization": "Bearer 2e25ffaadd8bfe" }
      });
      const data = await response.json();
        country = data.country;
        city = data.city;
    } catch (err) {
      console.error("Local fallback failed:", err);
    }
  }

    // 2. Format Device Info
    const deviceType = result.device.type || "Desktop";
    const osName = result.os.name || "Unknown OS";
    const browserName = result.browser.name || "Unknown Browser";
    const deviceInfo = `${deviceType} - ${osName} - ${browserName}`;
    
    return NextResponse.json({
      success: true,
      deviceInfo,
      location: {
        country,
        city,
      },
      details: {
        device: result.device,
        os: result.os,
        browser: result.browser,
      }
    });
  } catch (error) {
    return NextResponse.json(    { 
        success: false, 
        error: "Failed to parse user agent",
        deviceInfo: "Desktop - Unknown OS - Unknown Browser"
      },
      { status: 500 }
    );
  }
}
