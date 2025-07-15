import frida from "frida";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ device: string }> },
) {
  const { device } = await params;
  if (process.env.NODE_ENV === "development" && device.startsWith("mock-")) {
    return Response.json({
      name: `Mock Device ${device.replace("mock-", "")}`,
      id: device,
      type: "usb",
      removable: true,
    });
  }

  const dev = await frida.getDevice(device);
  const systemParams = await dev.querySystemParameters();
  return Response.json(systemParams);
}
