import { UAParser } from "ua-parser-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    // Format device info nicely
    const deviceType = result.device.type || "Desktop";
    const osName = result.os.name || "Unknown OS";
    const osVersion = result.os.version ? ` ${result.os.version}` : "";
    const browserName = result.browser.name || "Unknown Browser";
    const browserVersion = result.browser.version ? ` ${result.browser.version}` : "";
    
    const deviceInfo = `${deviceType} - ${osName}${osVersion} - ${browserName}${browserVersion}`;
    
    return NextResponse.json({
      success: true,
      deviceInfo,
      details: {
        device: result.device,
        os: result.os,
        browser: result.browser,
        engine: result.engine
      }
    });
  } catch (error) {
    console.error("Error parsing user agent:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to parse user agent",
        deviceInfo: "Desktop - Unknown OS - Unknown Browser"
      },
      { status: 500 }
    );
  }
}