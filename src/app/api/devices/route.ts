import frida from "frida";

import { device as serializeDevice } from "@/lib/serialize";

export async function GET() {
  const skip = new Set(["local", "socket", "barebone"]);
  const rawDevices = await frida.enumerateDevices();
  const devices = rawDevices
    .filter((dev) => !skip.has(dev.id))
    .map(serializeDevice);

  if (process.env.NODE_ENV === "development") {
    for (let i = 0; i < 9; i++) {
      devices.push({
        name: `Mock Device ${i}`,
        id: `mock-${i}`,
        type: "usb",
        removable: true,
      });
    }
  }

  return Response.json(devices);
}
