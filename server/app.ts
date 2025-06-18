import fs from "node:fs";
import path from "node:path";

import frida from "frida";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import json from "koa-json";
import logger from "koa-logger";
import Router from "koa-router";

import env from "./lib/env.ts";

import {
  app as serializeApp,
  device as serializeDevice,
} from "./lib/serializer.ts";

const manager = frida.getDeviceManager();
const app = new Koa();
const router = new Router({ prefix: "/api" });

async function fetchDevice(ctx: Koa.Context, next: Koa.Next) {
  const deviceId = ctx.params.device;
  const device = await frida.getDevice(deviceId);
  if (!device) ctx.throw(404, "device not found");
  ctx.state.device = device;
  await next();
}

router
  .get("/devices", async (ctx) => {
    const skip = new Set(["local", "socket", "barebone"]);
    const devices = await frida.enumerateDevices();
    ctx.body = devices.filter((dev) => !skip.has(dev.id)).map(serializeDevice);
  })
  .get("/device/:device/apps", fetchDevice, async (ctx) => {
    const device = ctx.state.device as frida.Device;
    const apps = await device.enumerateApplications();
    ctx.body = apps.map(serializeApp);
  })
  .get("/device/:device/icon/:bundle", fetchDevice, async (ctx) => {
    const device = ctx.state.device as frida.Device;
    const apps = await device
      .enumerateApplications({
        identifiers: [ctx.params.bundle],
        scope: frida.Scope.Full,
      })
      .catch(() => []);

    ctx.type = "image/png";

    const app = apps.at(0);
    if (app) {
      const { icons } = app?.parameters as {
        icons?: { format: string; image: Buffer }[];
      };

      if (icons && icons.length) {
        const ico = icons.find((i) => i.format === "png");
        if (ico && ico.image) {
          ctx.body = ico.image;
          return;
        }
      }
    }

    const placeholder = path.join(import.meta.dirname, "assets", "app.png");
    ctx.body = fs.createReadStream(placeholder);
  })
  .get("/device/:device/info", fetchDevice, async (ctx) => {
    const device = ctx.state.device as frida.Device;
    ctx.body = await device.querySystemParameters();
  })
  .put("/devices/remote/:hostname", async (ctx) => {
    await manager.addRemoteDevice(ctx.params.hostname);
    ctx.status = 204;
  })
  .delete("/devices/remote/:hostname", async (ctx) => {
    const address = ctx.params.hostname;
    const device = await manager.getDeviceById(address, env.timeout);
    if (device) {
      await manager.removeRemoteDevice(address);
      ctx.status = 204;
    } else {
      ctx.throw(404, "remote device not found");
    }
  });

app.use(logger());
app.use(json({ pretty: false, param: "pretty" }));
app.use(router.routes()).use(router.allowedMethods()).use(bodyParser());

export default app;
