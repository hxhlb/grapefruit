import frida from "frida";

import { device as serializeDevice } from "@/lib/serialize";

export async function GET() {
  const skip = new Set(["local", "socket", "barebone"]);
  const rawDevices = await frida.enumerateDevices();
  const devices = rawDevices
    .filter((dev) => !skip.has(dev.id))
    .map(serializeDevice);

  return Response.json(devices);
}
