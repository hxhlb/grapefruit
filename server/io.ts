import http from "node:http";

import frida from "frida";
import { Server, Socket } from "socket.io";

import env from "./lib/env.ts";
import { ispawn, agent as readAgent } from "./lib/utils.ts";
import { type ServerType } from "@hono/node-server";

const manager = frida.getDeviceManager();

interface RPCParam {
  method: string;
  args: any[];
}

interface DownloadRequest {
  path: string;
}

interface UploadRequest {
  destination: string;
  size: number;
}

async function onConnection(socket: Socket) {
  const { device, bundle } = socket.handshake.query;
  if (typeof device !== "string" || typeof bundle !== "string") {
    console.warn(
      `Invalid handshake query parameters: ${JSON.stringify(socket.handshake.query)}`,
    );
    socket.disconnect(true);
    return;
  }

  const deviceInstance = await manager.getDeviceById(device, env.timeout);
  if (!deviceInstance) {
    console.warn(`Device not found: ${device}`);
    socket.disconnect(true);
    return;
  }

  try {
    await ispawn(deviceInstance, bundle);
  } catch (error) {
    console.error(
      `Failed to spawn application ${bundle} on device ${device}:`,
      error,
    );
    socket.disconnect(true);
    return;
  }

  const apps = await deviceInstance.enumerateApplications({
    identifiers: [bundle],
    scope: frida.Scope.Full,
  });

  if (apps.length === 0) {
    console.warn(`No application found for bundle: ${bundle}`);
    socket.disconnect(true);
    return;
  }

  const { pid } = apps.at(0) as frida.Application;
  const session = await deviceInstance.attach(pid);
  const script = await session.createScript(await readAgent("fruity"));

  socket
    .on("download", async (param: DownloadRequest) => {
      // todo:
    })
    .on("rpc", async (param: RPCParam) => {
      // todo:
    })
    .on("disconnect", async () => {
      await script.unload();
      await session.detach();
    });

  await script.load();
  socket.emit("ready");
}

const io = new Server();

function onDeviceChange() {
  console.log("Device manager changed, notifying clients");
  io.of("/devices").emit("change");
}

io.of("/devices").on("connection", (socket: Socket) => {});
io.of("/session").on("connection", onConnection);

export default function factory(server: ServerType) {
  server
    .on("listening", () => manager.changed.connect(onDeviceChange))
    .on("close", () => manager.changed.disconnect(onDeviceChange));

  io.attach(server);
  return io;
}
