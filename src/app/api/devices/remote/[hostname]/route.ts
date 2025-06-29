import frida from "frida";
import { NextRequest } from "next/server";
import env from "@/lib/env";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ hostname: string }> },
) {
  const deviceManager = frida.getDeviceManager();
  const { hostname } = await params;
  const device = await deviceManager.getDeviceById(hostname, env.timeout);
  if (device.type !== "remote") {
    return new Response(null, { status: 404 });
  }
  await deviceManager.removeRemoteDevice(hostname);
  return new Response(null, { status: 204 });
}
