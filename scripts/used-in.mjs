// Fill `used_in` for each dataset from OpenAlex citations of its dataset paper.
// Rule (see About page): cites the dataset paper, published in a whitelisted venue, ordered by citations.
// used_in: studies naming the dataset in title or abstract (at most 5).
// citing: the most cited non-survey works in the same venues that cite the dataset paper (at most 3).
// Usage: node scripts/used-in.mjs [--dry] [id ...]
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import { resolve } from "./papers.mjs";

const root = path.resolve(import.meta.dirname, "..");
const dir = path.join(root, "data/datasets");
const MAIL = "hongming.yang@student.uts.edu.au";
const dry = process.argv.includes("--dry");
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const papers = JSON.parse(fs.readFileSync(path.join(root, "data/papers.json"), "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const VENUE = new RegExp([
  "selected areas in communications", "transactions on wireless communications", "transactions on communications",
  "transactions on signal processing", "transactions on mobile computing", "transactions on vehicular technology",
  "selected topics in signal processing", "communications surveys", "wireless communications letters", "communications letters",
  "internet of things journal", "cognitive communications and networking", "machine learning in communications and networking",
  "open journal of the communications society", "ieee communications magazine", "ieee wireless communications", "ieee network",
  "proceedings of the ieee", "transactions on information theory", "transactions on antennas and propagation", "transactions on networking",
  "international conference on communications", "global communications conference", "infocom", "mobicom", "sigcomm", "mobisys", "sensys", "nsdi",
  "icassp", "acoustics, speech and signal", "neural information processing", "international conference on machine learning",
  "learning representations", "computer vision and pattern recognition", "interactive, mobile, wearable", "nature communications",
].join("|"), "i");
const norm = (s) => ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
const abstractOf = (inv) => {
  if (!inv) return "";
  const out = [];
  for (const [w, pos] of Object.entries(inv)) for (const p of pos) out[p] = w;
  return out.join(" ");
};

async function citing(oa) {
  const url = `https://api.openalex.org/works?filter=cites:${oa}&sort=cited_by_count:desc&per-page=200&mailto=${MAIL}&select=id,doi,title,cited_by_count,primary_location,abstract_inverted_index`;
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { signal: AbortSignal.timeout(40000) }).catch(() => null);
    if (r?.ok) return (await r.json()).results ?? [];
    await sleep(2000 * (i + 1));
  }
  return null;
}

for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".yaml")).sort()) {
  const id = f.replace(".yaml", "");
  if (only.length && !only.includes(id)) continue;
  const file = path.join(dir, f);
  const text = fs.readFileSync(file, "utf8");
  const d = yaml.load(text);
  const key = d.paper.toLowerCase().startsWith("doi:") ? "doi:" + d.paper.slice(4).toLowerCase() : d.paper.toLowerCase();
  let rec = papers[key];
  if (!rec?.oa) rec = { ...(rec ?? {}), ...((await resolve(d.paper)) ?? {}) };
  if (!rec?.oa) { console.log(`${id}: no OpenAlex id, skipped`); continue; }
  const works = await citing(rec.oa);
  if (!works) { console.log(`${id}: OpenAlex failed`); continue; }
  const head = (rec.title ?? "").split(":")[0];
  const names = [d.name.replace(/\s*\(.*?\)/g, ""), ...(d.aliases ?? []), head.split(/\s+/).length <= 6 ? head : ""].map(norm).filter((n) => n.trim().length >= 4);
  const picked = [], fallback = [];
  const SURVEY = /survey|review|tutorial|overview|roadmap|perspective|challenges|vision|opportunit|white paper|primer/i;
  for (const w of works) {
    if (!w.doi || w.id.endsWith(rec.oa)) continue;
    const venue = w.primary_location?.source?.display_name ?? "";
    if (!VENUE.test(venue)) continue;
    const doi = "doi:" + w.doi.replace("https://doi.org/", "").toLowerCase();
    if (!SURVEY.test(w.title ?? "") && fallback.length < 3) fallback.push(doi);
    const hay = norm(`${w.title ?? ""} ${abstractOf(w.abstract_inverted_index)}`);
    const compact = hay.replace(/ /g, "");
    if (!names.some((n) => hay.includes(n) || (n.replace(/ /g, "").length >= 6 && compact.includes(n.replace(/ /g, ""))))) continue;
    picked.push(doi);
    if (picked.length === 5) break;
  }
  const top = fallback.filter((f) => !picked.includes(f)).slice(0, 3);
  console.log(`${id}: ${works.length} citing -> ${picked.length} used_in, ${top.length} citing`);
  if (!dry) {
    const line = `used_in: ${picked.length ? JSON.stringify(picked) : "[]"}\nciting: ${top.length ? JSON.stringify(top) : "[]"}`;
    const base = text.replace(/^citing:.*\n/m, "");
    const next = /^used_in:.*$/m.test(base) ? base.replace(/^used_in:.*$/m, line) : base.replace(/^summary:/m, `${line}\nsummary:`);
    fs.writeFileSync(file, next);
  }
  await sleep(250);
}
