import { after, before, describe, it } from "node:test";
import assert from "node:assert";
import type { AddressInfo } from "node:net";
import type { ServerType } from "@hono/node-server";

import frida from "frida";
import io from "socket.io-client";
import { serve } from "@hono/node-server";

import app from "../app.ts";
import factory from "../io.ts";

let server: ServerType;

before(async () => {
  server = serve({
    fetch: app.fetch,
    port: 0, // Use random port for testing
  });
  factory(server);
  await new Promise<void>((resolve) => {
    server.on("listening", () => resolve());
  });
});

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe("Server tests", () => {
  function prefix() {
    return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  }

  it("should start http server", async () => {
    assert(server.listening, "Server should be listening");
    const devices = await fetch(`${prefix()}/api/devices`).then((r) =>
      r.json(),
    );
    console.debug("devices", devices);
    assert(Array.isArray(devices), "Devices should be an array");

    const udid = process.env.UDID;
    if (typeof udid === "string") {
      const deviceInfo = (await fetch(
        `${prefix()}/api/device/${udid}/info`,
      ).then((r) => r.json())) as object;
      console.debug("deviceInfo", deviceInfo);
      assert("name" in deviceInfo);
      assert("platform" in deviceInfo);
      assert("arch" in deviceInfo);
    } else {
      console.warn("!! UDID env not set, skipping devices related tests");
    }
  });

  it("should accept socket.io clients", async () => {
    const socket = io(prefix() + "/devices");
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("test timed out")),
        5000,
      );

      socket.on("change", () => {
        clearTimeout(timeout);
        resolve();
        socket.disconnect();
      });

      socket.on("connect", () => {
        assert(socket.connected, "socket client works");
        frida.getDeviceManager().addRemoteDevice("127.0.0.1");
      });

      socket.on("connect_error", (err) => {
        reject(new Error(`Socket connection failed: ${err.message}`));
      });
    });
  });
});
