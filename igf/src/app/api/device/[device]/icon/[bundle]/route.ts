import frida from "frida";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ device: string; bundle: string }> },
) {
  const { device, bundle } = await params;

  const dev = await frida.getDevice(device);
  const apps = await dev.enumerateApplications({
    identifiers: [bundle],
    scope: frida.Scope.Full,
  });

  const app = apps.at(0);
  if (app) {
    const { icons } = app?.parameters as {
      icons?: { format: string; image: Buffer }[];
    };

    if (icons && icons.length) {
      const ico = icons.find((i) => i.format === "png");
      if (ico && ico.image) {
        return new Response(ico.image, {
          status: 200,
          headers: { "Content-Type": "image/png" },
        });
      }
    }
  }
  return new Response(null, { status: 404 });
}
