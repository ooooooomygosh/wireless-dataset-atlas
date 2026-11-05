// Validate dataset YAML files against src/schema.ts. Usage: node scripts/validate.mjs [dir]
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import { datasetSchema, taskSchema } from "../src/schema.ts";

const root = path.resolve(import.meta.dirname, "..");
const dir = path.resolve(process.argv[2] ?? path.join(root, "data/datasets"));
const tasks = yaml.load(fs.readFileSync(path.join(root, "data/tasks.yaml"), "utf8"));
const taskIds = new Set(tasks.map((t) => taskSchema.parse(t).id));
let bad = 0;
const ids = new Set(), papers = new Map();
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".yaml")).sort()) {
  const fail = (m) => { bad++; console.error(`${f}: ${m}`); };
  let d;
  try { d = yaml.load(fs.readFileSync(path.join(dir, f), "utf8")); } catch (e) { fail(`yaml: ${e.message}`); continue; }
  const r = datasetSchema.safeParse(d);
  if (!r.success) { fail(r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")); continue; }
  const x = r.data;
  if (f !== `${x.id}.yaml`) fail("file name must equal id");
  if (ids.has(x.id)) fail("duplicate id"); ids.add(x.id);
  for (const t of x.tasks) if (!taskIds.has(t)) fail(`unknown task ${t}`);
  if (papers.has(x.paper) && papers.get(x.paper) !== x.id) console.warn(`${f}: paper shared with ${papers.get(x.paper)}`);
  papers.set(x.paper, x.id);
}
console.log(`${ids.size} datasets checked, ${bad} problems`);
process.exit(bad ? 1 : 0);
