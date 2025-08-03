import { spawn } from "child_process";
import { platform } from "os";

export function openBrowser(url: string): void {
  const mapping: { [key: string]: string } = {
    win32: "explorer.exe",
    darwin: "open",
    linux: "xdg-open",
  };

  const command = mapping[platform()];
  if (!command) {
    console.error("Unsupported platform:", platform());
    return;
  }

  spawn(command, [url], {
    detached: true,
    stdio: "ignore",
  }).unref();
}
