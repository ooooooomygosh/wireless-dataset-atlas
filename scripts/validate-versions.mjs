// Validate version-history fragments. Usage: node scripts/validate-versions.mjs <dir>
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import { versionsSchema } from "../src/schema.ts";

const dir = path.resolve(process.argv[2]);
const base = path.resolve(import.meta.dirname, "../data/datasets");
let bad = 0, n = 0;
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".yaml")).sort()) {
  n++;
  const fail = (m) => { bad++; console.error(`${f}: ${m}`); };
  if (!fs.existsSync(path.join(base, f))) { fail("no such dataset id"); continue; }
  let d;
  try { d = yaml.load(fs.readFileSync(path.join(dir, f), "utf8")); } catch (e) { fail(`yaml: ${e.message}`); continue; }
  const r = versionsSchema.safeParse(d);
  if (!r.success) { fail(r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")); continue; }
  const dates = r.data.versions.map((v) => v.date).filter(Boolean);
  if (dates.some((x, i) => i && x > dates[i - 1])) fail("versions must be sorted newest first");
}
console.log(`${n} fragments checked, ${bad} problems`);
process.exit(bad ? 1 : 0);
