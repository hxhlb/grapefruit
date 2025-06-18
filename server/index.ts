import http from "node:http";

import app from "./app.ts";
import factory from "./io.ts";

const server = http.createServer(app.callback());
const io = factory(server); // ignore socket.io instance for now
io.write("ok");

export default server;
