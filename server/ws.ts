import type { Server as HttpServer } from "node:http";
import frida from "frida";
import { Server } from "socket.io";

interface RPCParam {
  method: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[];
}

export default function createWebsocketServer(server: HttpServer) {
  const io = new Server(server);
  const manager = frida.getDeviceManager();

  function onDeviceUpdate() {
    io.of("/devices").emit("change");
  }

  io.of("/devices").on("connection", (socket) => {
    manager.changed.connect(onDeviceUpdate);
    console.debug("New connection:", socket.id);
    socket.on("disconnect", () => {
      console.debug("Connection closed:", socket.id);
    });
  });

  io.of('/session').on('connection', (socket) => {
    const { device, bundle } = socket.handshake.query;
    if (typeof device !== 'string' || typeof bundle !== 'string') {
      console.error("Invalid device or bundle in handshake query");
      socket.disconnect();
      return;
    }

    console.debug(`establishing session for device: ${device}, bundle: ${bundle}`);

    io.on('rpc', (params: RPCParam) => {
      console.debug(`RPC call: ${params.method} with args: ${JSON.stringify(params.args)}`);
    })
  });

  server.on("close", () => {
    manager.changed.disconnect(onDeviceUpdate);
  });

  return io;
}
