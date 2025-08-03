import path from "node:path";
import fs from "node:fs";

const __file = new URL(import.meta.url).pathname;
const relative = __dirname
  .replace(/^\[project\]/, "")
  .replace(/ \[app-route\] \(ecmascript\)$/, "");

const project = __file.substring(__file.indexOf(relative) + relative.length);

async function getVersion(module: string) {
  const jsonFile = path.join(module, "package.json");
  const content = await fs.promises.readFile(jsonFile, "utf-8");
  const info = JSON.parse(content) as { version: string };
  return info.version;
}

export async function GET() {
  return Response.json({
    frida: await getVersion(path.join(project, "node_modules", "frida")),
    self: await getVersion(path.join(project)),
  });
}
