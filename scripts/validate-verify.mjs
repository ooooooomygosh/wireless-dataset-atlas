// Validate verification fragments. Usage: node scripts/validate-verify.mjs <dir>
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import { verifySchema } from "../src/schema.ts";

const dir = path.resolve(process.argv[2]);
const base = path.resolve(import.meta.dirname, "../data/datasets");
let bad = 0, n = 0;
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".yaml")).sort()) {
  n++;
  const fail = (m) => { bad++; console.error(`${f}: ${m}`); };
  if (!fs.existsSync(path.join(base, f))) { fail("no such dataset id"); continue; }
  let d;
  try { d = yaml.load(fs.readFileSync(path.join(dir, f), "utf8")); } catch (e) { fail(`yaml: ${e.message}`); continue; }
  const r = verifySchema.safeParse(d);
  if (!r.success) { fail(r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")); continue; }
  const own = yaml.load(fs.readFileSync(path.join(base, f), "utf8")).signals ?? [];
  for (const s of r.data.signal_details ?? []) if (!own.includes(s.signal)) fail(`signal_details has ${s.signal} outside the dataset's signals`);
  if (r.data.overview && r.data.overview.en.length < 200) fail("overview shorter than 200 chars");
}
console.log(`${n} fragments checked, ${bad} problems`);
process.exit(bad ? 1 : 0);
