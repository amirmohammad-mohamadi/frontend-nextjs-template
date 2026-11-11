/**
 * Deletes the `example` reference domain once a real domain exists, and
 * leaves the repository green: folders and the example e2e spec are removed,
 * barrel exports and the endpoint entry are stripped, the blocks between
 * `example-domain:start` / `example-domain:end` markers are cut out of the
 * app files that mention the domain, the message namespaces and env defaults
 * are cleaned, then the typecheck runs.
 *
 *   npm run example:remove
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const abs = (p) => resolve(root, p);

const log = (verb, p) => console.log(`${verb.padEnd(8)} ${p}`);

function remove(p) {
  if (!existsSync(abs(p))) return;
  rmSync(abs(p), { recursive: true, force: true });
  log("removed", p);
}

function rewrite(p, transform) {
  if (!existsSync(abs(p))) return;
  const before = readFileSync(abs(p), "utf8");
  const after = transform(before);
  if (after !== before) {
    writeFileSync(abs(p), after);
    log("edited", p);
  }
}

/** Drops every line from a start marker to its end marker, markers included. */
function cutMarkedBlocks(text) {
  const lines = text.split(/\r?\n/);
  const kept = [];
  let cutting = false;
  for (const line of lines) {
    if (line.includes("example-domain:start")) {
      cutting = true;
      continue;
    }
    if (line.includes("example-domain:end")) {
      cutting = false;
      continue;
    }
    if (!cutting) kept.push(line);
  }
  return kept.join("\n");
}

/** Deletes dotted keys from a JSON file, keeping two-space formatting. */
function dropJsonKeys(text, keys) {
  const data = JSON.parse(text);
  for (const key of keys) {
    const path = key.split(".");
    let node = data;
    for (const part of path.slice(0, -1)) node = node?.[part];
    if (node && path.at(-1) in node) delete node[path.at(-1)];
  }
  return `${JSON.stringify(data, null, 2)}\n`;
}

// 1. Folders and files that exist only for the example domain.
for (const p of [
  "src/shared/dtos/example",
  "src/shared/models/example",
  "src/shared/services/example",
  "src/app/[locale]/examples",
  "src/features/examples",
  "e2e/examples.spec.ts",
]) {
  remove(p);
}

// 2. Barrel exports and the endpoint group.
for (const p of [
  "src/shared/dtos/index.ts",
  "src/shared/models/index.ts",
  "src/shared/services/index.ts",
]) {
  rewrite(p, (text) =>
    text
      .split(/\r?\n/)
      .filter((line) => !line.includes("/example"))
      .join("\n")
  );
}
rewrite("src/shared/services/shared/endpoints.ts", (text) =>
  text.replace(/\n {2}example: \{[\s\S]*?\n {2}\},/, "")
);

// 3. Marked blocks in app files.
for (const p of ["src/components/site-header.tsx", "src/app/[locale]/page.tsx"]) {
  rewrite(p, cutMarkedBlocks);
}

// 4. Message namespaces and env defaults.
for (const p of ["messages/en.json", "messages/fa.json"]) {
  rewrite(p, (text) => dropJsonKeys(text, ["examples", "nav.examples", "home.viewExamples"]));
}
for (const p of [".env.example", "src/env.ts"]) {
  rewrite(p, (text) => text.replace(/,\/api\/v1\/examples\b/g, ""));
}

// 5. The gate.
const run = (command) => {
  console.log(`\n$ ${command}`);
  execSync(command, { cwd: root, stdio: "inherit" });
};
run("npx prettier --write messages/en.json messages/fa.json");
run("npm run typecheck");

console.log(
  "\nThe example domain is gone and the repository typechecks. Run `npm run check` and `npm run e2e` before committing."
);
