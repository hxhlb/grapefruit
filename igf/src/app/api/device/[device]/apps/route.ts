import frida from "frida";
import { NextRequest } from "next/server";

import { app as serializeApp } from "@/lib/serialize";
import { Application } from "@/schema";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ device: string }> },
) {
  const { device } = await params;
  if (process.env.NODE_ENV === "development" && device.startsWith("mock-")) {
    const sample: Application[] = [];
    for (let i = 0; i < 10; i++) {
      sample.push({
        name: `Mock App ${i}`,
        identifier: `com.mock.app.${i}`,
        pid: 1000 + i,
      });
    }
    return Response.json(sample);
  }

  const dev = await frida.getDevice(device);
  const apps = await dev.enumerateApplications();
  const serializedApps = apps.map(serializeApp);
  return Response.json(serializedApps);
}
