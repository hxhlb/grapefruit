import type { Server as HttpServer } from "node:http";
import frida from "frida";
import { Server } from "socket.io";

export default function createWebsocketServer(server: HttpServer) {
  const io = new Server(server);
  const manager = frida.getDeviceManager();

  function onDeviceUpdate() {
    io.of("/devices").emit("change");
  }

  io.of("/devices").on("connection", (socket) => {
    manager.changed.connect(onDeviceUpdate);
    socket.on("disconnect", () => {
      console.log("Device connection closed:", socket.id);
    });
  });

  server.on("close", () => {
    manager.changed.disconnect(onDeviceUpdate);
  });

  return io;
}
