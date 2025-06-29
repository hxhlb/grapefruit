import frida from "frida";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  const { hostname } = await req.json();
  await frida.getDeviceManager().addRemoteDevice(hostname);
  return new Response(null, { status: 204 });
}
