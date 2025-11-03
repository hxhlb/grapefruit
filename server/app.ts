import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

import frida from "frida";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { createMiddleware } from "hono/factory";

import env from "./lib/env.ts";

import {
  app as serializeApp,
  device as serializeDevice,
} from "./lib/serializer.ts";

const manager = frida.getDeviceManager();
const app = new Hono();

app.use(logger());
app.use("/api/*", prettyJSON());

const api = new Hono();

const getDeviceMiddleware = createMiddleware<{
  Variables: {
    device: frida.Device;
  };
}>(async (c, next) => {
  const deviceId = c.req.param("device");
  if (!deviceId) {
    return c.json({ error: "device not found" }, 404);
  }

  const device = await frida.getDevice(deviceId);
  if (!device) {
    return c.json({ error: "device not found" }, 404);
  }
  c.set("device", device);
  await next();
});

api
  .get("/devices", async (c) => {
    const skip = new Set(["local", "socket", "barebone"]);
    const devices = await frida.enumerateDevices();
    return c.json(
      devices.filter((dev) => !skip.has(dev.id)).map(serializeDevice),
    );
  })
  .get("/device/:device/apps", getDeviceMiddleware, async (c) => {
    const device = c.get("device");
    const apps = await device.enumerateApplications();
    return c.json(apps.map(serializeApp));
  })
  .get("/device/:device/icon/:bundle", getDeviceMiddleware, async (c) => {
    const device = c.get("device");
    const bundle = c.req.param("bundle");
    const apps = await device
      .enumerateApplications({
        identifiers: [bundle],
        scope: frida.Scope.Full,
      })
      .catch(() => []);

    const app = apps.at(0);
    if (app) {
      const { icons } = app?.parameters as {
        icons?: { format: string; image: Buffer }[];
      };

      if (icons && icons.length) {
        const ico = icons.find((i) => i.format === "png");
        if (ico && ico.image) {
          return c.body(ico.image, 200, {
            "Content-Type": "image/png",
          });
        }
      }
    }

    const placeholder = path.join(import.meta.dirname, "assets", "app.png");
    const stream = fs.createReadStream(placeholder);

    return c.body(Readable.toWeb(stream), 200, {
      "Content-Type": "image/png",
    });
  })
  .get("/device/:device/info", getDeviceMiddleware, async (c) => {
    const device = c.get("device");
    return c.json(await device.querySystemParameters());
  })
  .put("/devices/remote/:hostname", async (c) => {
    const hostname = c.req.param("hostname");
    await manager.addRemoteDevice(hostname);
    return c.body(null, 204);
  })
  .delete("/devices/remote/:hostname", async (c) => {
    const address = c.req.param("hostname");
    const device = await manager.getDeviceById(address, env.timeout);
    if (device) {
      await manager.removeRemoteDevice(address);
      return c.body(null, 204);
    } else {
      return c.json({ error: "remote device not found" }, 404);
    }
  });

app.route("/api", api);

export default app;
