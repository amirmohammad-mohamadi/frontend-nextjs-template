/**
 * Starts the mock API and the Next.js dev server together and stops both when
 * either exits or the terminal sends Ctrl+C. `npm run dev:app` starts Next.js
 * alone for development against a real backend.
 *
 *   npm run dev            → mock API :4000, app :3000
 */
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");

const children = [
  spawn(process.execPath, ["tools/mock-api/server.mjs"], { cwd: root, stdio: "inherit" }),
  spawn("npx next dev -p 3000", { cwd: root, stdio: "inherit", shell: true }),
];

let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (child.exitCode === null) child.kill();
  process.exitCode = code;
}

for (const child of children) {
  child.on("exit", (code) => stop(code ?? 0));
}
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
