import http from "node:http";
import path from "node:path";

import next from "next";

import conf from "../gui/next.config.ts";
import app from "./app.ts";
import factory from "./io.ts";
import env from "./lib/env.ts";

// todo: wait for next.js issue to be resolved
// https://github.com/vercel/next.js/issues/46078
// @ts-ignore
const nextApp = next({
  dev: env.dev,
  dir: path.join(import.meta.dirname, "..", "gui"),
  distDir: path.join(import.meta.dirname, "..", "gui", ".next"),
  conf,
});

const koaHandler = app.callback();
const handler = nextApp.getRequestHandler();

function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.url?.startsWith("/api")) {
    koaHandler(req, res);
  } else {
    handler(req, res);
  }
}

export default async function serve() {
  await nextApp.prepare();
  const server = http.createServer(handleRequest);
  factory(server);

  server.listen(env.port, () => {
    console.log(`Server is running on http://localhost:${env.port}`);
  });
}

serve();
