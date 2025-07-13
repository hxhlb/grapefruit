import { createServer } from "node:http";
import next from "next";

import createWebsocketServer from "./ws.ts";
import { openBrowser } from "./shell.ts";
import env from "../src/lib/env.ts";

const { dev, host, port } = env;

// @ts-expect-error - next has type issue
const app = next({ dev, hostname: host, port, turbo: true });
const handler = app.getRequestHandler();

export default async function serve() {
  await app.prepare();
  const server = createServer(handler);
  createWebsocketServer(server);

  server
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      const url = `http://${host}:${port}`;
      console.log(`> Ready on ${url}`);
      openBrowser(url);
    });
}

process.on("SIGINT", () => {
  console.log("bye");
  process.exit(0);
});

serve();
