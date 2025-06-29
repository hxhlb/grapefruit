import frida from "frida";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ device: string }> },
) {
  const { device } = await params;
  const dev = await frida.getDevice(device);
  const systemParams = await dev.querySystemParameters();
  return Response.json(systemParams);
}
