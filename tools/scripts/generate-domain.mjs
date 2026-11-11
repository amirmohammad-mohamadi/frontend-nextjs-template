/**
 * Scaffolds one domain through every layer the architecture defines: DTO
 * schemas, a model, the services folder (api, hooks, query keys), the
 * endpoint entry, the barrel exports and, unless `--page=false`, a localised
 * list page with its feature hook and message namespaces. The output mirrors
 * the `example` domain, so reading that one explains these.
 *
 *   npm run generate:domain -- product
 *   npm run generate:domain -- blog-post --plural=blog-posts --endpoint=/api/v1/posts --page=false
 *
 * Templates live in `tools/generators/domain/files` (`src/` for the layers,
 * `page/` for the list page): `__name__` in a path and `<%= name %>` in a
 * file are replaced with the substitutions below.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const templates = resolve(root, "tools/generators/domain/files");
const abs = (p) => resolve(root, p);

// ── arguments ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const flag = (name) => {
  const hit = args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return undefined;
  return hit.includes("=") ? hit.slice(hit.indexOf("=") + 1) : "true";
};
if (!positional[0]) {
  console.error(
    "Usage: npm run generate:domain -- <name> [--plural=<plural>] [--endpoint=<path>] [--page=false]"
  );
  process.exit(1);
}

// ── naming (same conventions as Nx's `names()`) ──────────────────────────────
const words = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
const names = (value) => {
  const w = words(value);
  const className = w.map((x) => x[0].toUpperCase() + x.slice(1)).join("");
  return {
    fileName: w.join("-"),
    className,
    propertyName: className[0].toLowerCase() + className.slice(1),
  };
};

const n = names(positional[0]);
const p = names(flag("plural") ?? `${n.fileName}s`);
const endpoint = flag("endpoint") ?? `/api/v1/${p.fileName}`;
const withPage = flag("page") !== "false";
const substitutions = {
  fileName: n.fileName,
  className: n.className,
  propertyName: n.propertyName,
  pluralFileName: p.fileName,
  pluralClassName: p.className,
  pluralPropertyName: p.propertyName,
  endpoint,
};

// ── helpers ──────────────────────────────────────────────────────────────────
const written = [];
const log = (verb, path) => console.log(`${verb.padEnd(8)} ${path}`);

function render(text) {
  return text.replace(/<%=\s*(\w+)\s*%>/g, (_, key) => {
    if (!(key in substitutions)) throw new Error(`Unknown template variable "${key}"`);
    return substitutions[key];
  });
}

function renderPath(path) {
  const withoutSuffix = path.replace(/__tmpl__$/, "");
  return render(withoutSuffix.replace(/__(\w+?)__/g, (_, key) => `<%= ${key} %>`));
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

/** Renders every template under `sourceDir`; the target path is the template's path relative to `base`. */
function generateFiles(sourceDir, base) {
  if (!existsSync(sourceDir)) return;
  for (const file of walk(sourceDir)) {
    const target = renderPath(relative(base, file)).replace(/\\/g, "/");
    if (existsSync(abs(target))) {
      log("exists", target);
      continue;
    }
    mkdirSync(dirname(abs(target)), { recursive: true });
    writeFileSync(abs(target), render(readFileSync(file, "utf8")));
    written.push(target);
    log("created", target);
  }
}

function rewrite(path, transform) {
  const before = readFileSync(abs(path), "utf8");
  const after = transform(before);
  if (after !== before) {
    writeFileSync(abs(path), after);
    written.push(path);
    log("edited", path);
  }
}

/** Appends a line to a barrel file once. */
const addExport = (path, line) =>
  rewrite(path, (text) => (text.includes(line) ? text : `${text.trimEnd()}\n${line}\n`));

/** Inserts an endpoint group before the closing of the `endpoints` object. */
function addEndpoints(key, listPath) {
  rewrite("src/shared/services/shared/endpoints.ts", (text) => {
    if (text.includes(`\n  ${key}: {`)) return text;
    const block = `  ${key}: {\n    list: "${listPath}",\n    byId: (id: number | string) => \`${listPath}/\${id}\`,\n  },\n} as const;`;
    return text.replace(/\n\} as const;/, `\n${block}`);
  });
}

/** Adds a message namespace for the list page to one messages file. */
function addMessages(path, key, strings) {
  rewrite(path, (text) => {
    const data = JSON.parse(text);
    if (key in data) return text;
    data[key] = strings;
    return `${JSON.stringify(data, null, 2)}\n`;
  });
}

// ── run ──────────────────────────────────────────────────────────────────────
generateFiles(join(templates, "src"), templates);
if (withPage) generateFiles(join(templates, "page"), join(templates, "page"));

addExport("src/shared/dtos/index.ts", `export * from "./${n.fileName}";`);
addExport("src/shared/models/index.ts", `export * from "./${n.fileName}";`);
addExport("src/shared/services/index.ts", `export * from "./${n.fileName}";`);
addEndpoints(n.propertyName, endpoint);

if (withPage) {
  const title = p.className.replace(/([a-z])([A-Z])/g, "$1 $2");
  addMessages("messages/en.json", p.propertyName, {
    title,
    subtitle: `Every ${title.toLowerCase()} the API returns.`,
    searchPlaceholder: `Search ${title.toLowerCase()}`,
    empty: `No ${title.toLowerCase()} match.`,
    loadError: `The ${title.toLowerCase()} could not be loaded.`,
    created: "Created",
    pageOf: "Page {page} of {total}",
    previous: "Previous",
    next: "Next",
  });
  // Placeholder Persian strings around the untranslated domain name; translate them with the real copy.
  addMessages("messages/fa.json", p.propertyName, {
    title,
    subtitle: `همهٴ موارد ${title} که API برمی‌گرداند.`,
    searchPlaceholder: `جستجوی ${title}`,
    empty: "موردی مطابق پیدا نشد.",
    loadError: "فهرست بارگذاری نشد.",
    created: "ایجاد",
    pageOf: "صفحهٴ {page} از {total}",
    previous: "قبلی",
    next: "بعدی",
  });
}

if (written.length) {
  execSync(`npx prettier --write ${written.map((f) => JSON.stringify(f)).join(" ")}`, {
    cwd: root,
    stdio: "ignore",
  });
}

console.log(`\nDomain "${n.fileName}" scaffolded. Next:`);
console.log(
  `  - fill in the fields in src/shared/dtos/${n.fileName}/${n.fileName}.dto.ts and the model`
);
if (withPage) {
  console.log(`  - add a link to /${p.fileName} in src/components/site-header.tsx`);
  console.log(`  - translate the "${p.propertyName}" namespace in messages/fa.json`);
}
console.log("  - npm run typecheck");
