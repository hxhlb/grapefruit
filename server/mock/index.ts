import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { Readable } from "node:stream";

import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { toNodeListener } from "@hono/node-server";
import { Server } from "socket.io";
import frida from "frida";

import env from "../lib/env.ts";
import type { Device, Application } from "../../gui/src/schema.d.ts";

// Mock data
const mockDevices: Device[] = [
  {
    name: "Mock iPhone",
    id: "mock-iphone-id",
    type: "usb",
    removable: false,
  },
  {
    name: "Mock iPad",
    id: "mock-ipad-id",
    type: "usb",
    removable: false,
  },
  {
    name: "Mock Remote Device",
    id: "mock-remote-id",
    type: "remote",
    removable: true,
  },
];

const mockApps: Application[] = [
  {
    name: "App Store",
    identifier: "com.apple.AppStore",
    pid: 1001,
  },
  {
    name: "Safari",
    identifier: "com.apple.mobilesafari",
    pid: 1002,
  },
  {
    name: "Settings",
    identifier: "com.apple.Preferences",
    pid: 1003,
  },
  {
    name: "Maps",
    identifier: "com.apple.Maps",
    pid: 1004,
  },
];

const mockDeviceInfo: frida.SystemParameters = {
  os: {
    id: "ios",
    name: "iOS",
    version: "16.0",
    build: "20A362",
  },
  platform: "darwin",
  arch: "arm64",
  hardware: {
    product: "iPhone14,2",
    platform: "t8010",
    model: "J71bAP",
  },
  access: "full",
  name: "Mock Device",
  uuid: "mock-device-uuid",
};

// Set up Hono app
const app = new Hono();
const api = new Hono();

// Middleware to simulate delay for network requests
async function delayMiddleware(c: any, next: any) {
  const delay = Math.random() * 300 + 100; // Random delay between 100-400ms
  await new Promise((resolve) => setTimeout(resolve, delay));
  await next();
}

api
  .get("/devices", async (c) => {
    return c.json(mockDevices);
  })
  .get("/device/:device/apps", async (c) => {
    return c.json(mockApps.filter(() => Math.random() > 0.25));
  })
  .get("/device/:device/icon/:bundle", async (c) => {
    const iconPath = path.join(import.meta.dirname, "..", "assets", "app.png");
    const stream = fs.createReadStream(iconPath);
    return c.body(Readable.toWeb(stream), 200, {
      "Content-Type": "image/png",
    });
  })
  .get("/device/:device/info", async (c) => {
    return c.json(mockDeviceInfo);
  });

// Set up Hono middleware
app.use(delayMiddleware);
app.use(honoLogger());
app.use("/api/*", prettyJSON());
app.route("/api", api);

const server = http.createServer(toNodeListener(app));
const io = new Server(server);

const devicesNamespace = io.of("/devices");

setInterval(() => {
  devicesNamespace.emit("changed");
}, 2000);

const sessionNamespace = io.of("/session");
sessionNamespace.on("connection", async (socket) => {
  const { device, bundle } = socket.handshake.query;
  console.log(
    `Mock session connected for device ${device} and bundle ${bundle}`,
  );

  socket.disconnect(true);
});

server.listen(env.port, env.host, () => {
  console.log(`Server running at http://${env.host}:${env.port}/`);
});
