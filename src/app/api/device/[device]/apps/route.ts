import frida from "frida";
import { NextRequest } from "next/server";

import { app as serializeApp } from "@/lib/serialize";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ device: string }> },
) {
  const { device } = await params;
  const dev = await frida.getDevice(device);
  const apps = await dev.enumerateApplications();
  const serializedApps = apps.map(serializeApp);
  return Response.json(serializedApps, req);
}
