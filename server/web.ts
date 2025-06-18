import http from "node:http";
import path from "node:path";

import next from "next";

import app from "./app.ts";
import factory from "./io.ts";
import env from "./lib/env.ts";

const dir = path.join(import.meta.dirname, "..", "gui");
const distDir = path.join(dir, ".next");

const opt = {
  turbo: true,
  dev: env.dev,
  dir,
  distDir,
};

const koaHandler = app.callback();

export default async function serve() {
  // use ts-ignore for a workaround for this issue:
  // https://github.com/vercel/next.js/issues/46078

  if (env.dev) {
    // @ts-ignore
    opt.conf = await import("../gui/next.config.ts");
  }

  // @ts-ignore
  const nextApp = next(opt);
  const handler = nextApp.getRequestHandler();

  function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    if (req.url?.startsWith("/api")) {
      koaHandler(req, res);
    } else {
      handler(req, res);
    }
  }

  await nextApp.prepare();
  const server = http.createServer(handleRequest);
  factory(server);

  server.listen(env.port, () => {
    console.log(`Server is running on http://localhost:${env.port}`);
  });
}

serve();
