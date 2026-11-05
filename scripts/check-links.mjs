// Report HTTP status of every access, code and paper URL. Usage: node scripts/check-links.mjs
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";

const dir = path.resolve(import.meta.dirname, "../data/datasets");
const urls = [];
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".yaml")).sort()) {
  const d = yaml.load(fs.readFileSync(path.join(dir, f), "utf8"));
  urls.push([d.id, "access", d.access.url], ...(d.code ?? []).map((u) => [d.id, "code", u]));
}
async function status(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const r = await fetch(url, { method, redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "User-Agent": "wireless-dataset-atlas link check" } });
      if (r.ok || method === "GET") return r.status;
    } catch (e) { if (method === "GET") return `error ${e.cause?.code ?? e.message}`; }
  }
}
const bad = [];
let i = 0;
async function worker() {
  while (i < urls.length) {
    const [id, kind, url] = urls[i++];
    const s = await status(url);
    if (s !== 200) bad.push(`${id} ${kind} ${s} ${url}`);
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
console.log(`${urls.length} links checked, ${bad.length} not 200`);
if (bad.length) console.log(bad.sort().join("\n"));
