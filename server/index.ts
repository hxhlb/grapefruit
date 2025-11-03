import { serve } from "@hono/node-server";

import app from "./app.ts";
import factory from "./io.ts";

const httpServer = serve({
  fetch: app.fetch,
  port: 31337,
});

const io = factory(httpServer); // ignore socket.io instance for now
io.write("ok");

export default httpServer;
