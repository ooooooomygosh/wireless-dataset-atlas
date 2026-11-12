// Validate complete new dataset records in a staging directory. Usage: node scripts/validate-new.mjs <dir>
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import { datasetSchema, CAPABILITIES } from "../src/schema.ts";

const dir = path.resolve(process.argv[2]);
const base = path.resolve(import.meta.dirname, "../data/datasets");
let bad = 0, n = 0;
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".yaml")).sort()) {
  n++;
  const fail = (m) => { bad++; console.error(`${f}: ${m}`); };
  let d;
  try { d = yaml.load(fs.readFileSync(path.join(dir, f), "utf8")); } catch (e) { fail(`yaml: ${e.message}`); continue; }
  if (d.id !== f.replace(".yaml", "")) fail("id must equal the file name");
  if (fs.existsSync(path.join(base, f))) fail("id already exists in the catalog");
  const r = datasetSchema.safeParse(d);
  if (!r.success) { fail(r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")); continue; }
  const keys = r.data.capabilities.map((c) => c.key);
  const missing = CAPABILITIES.filter((k) => !keys.includes(k));
  if (missing.length) fail(`missing capability keys: ${missing.join(", ")}`);
  if (!r.data.tasks.includes("radio-map")) fail("tasks must include radio-map");
  if (!r.data.overview || r.data.overview.en.length < 200) fail("overview too short (<200 chars)");
}
console.log(`${n} records checked, ${bad} problems`);
process.exit(bad ? 1 : 0);
