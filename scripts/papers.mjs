// Resolve every paper id referenced by data/datasets/*.yaml into data/papers.json.
// Sources: OpenAlex (DOI and arXiv DOI), then Crossref / DataCite / arXiv as fallback.
// Usage: node scripts/papers.mjs [--check] [--refresh] [--ids file.txt]
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "data/papers.json");
const MAIL = "hongming.yang@student.uts.edu.au";
const args = process.argv.slice(2);
const refresh = args.includes("--refresh"), check = args.includes("--check");
const idsFile = args.includes("--ids") ? args[args.indexOf("--ids") + 1] : null;

const cache = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": `wireless-dataset-atlas (mailto:${MAIL})` }, signal: AbortSignal.timeout(25000) });
      if (r.status === 404) return null;
      if (r.status === 429 || r.status >= 500) { await sleep(1500 * (i + 1)); continue; }
      return r;
    } catch { await sleep(1000 * (i + 1)); }
  }
  return null;
}
const clean = (s) => (s ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function openalex(doi) {
  const r = await get(`https://api.openalex.org/works/doi:${encodeURIComponent(doi)}?mailto=${MAIL}&select=id,title,publication_year,cited_by_count,authorships,primary_location,doi`);
  if (!r) return null;
  const w = await r.json();
  if (!w.title) return null;
  return {
    title: clean(w.title),
    authors: (w.authorships ?? []).map((a) => a.author?.display_name).filter(Boolean),
    venue: w.primary_location?.source?.display_name ?? null,
    year: w.publication_year ?? null,
    cited_by: w.cited_by_count ?? 0,
    oa: w.id?.split("/").pop() ?? null,
  };
}
async function crossref(doi) {
  const r = await get(`https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${MAIL}`);
  if (!r) return null;
  const m = (await r.json()).message;
  const y = m.issued?.["date-parts"]?.[0]?.[0] ?? null;
  return { title: clean(m.title?.[0]), authors: (m.author ?? []).map((a) => [a.given, a.family].filter(Boolean).join(" ")), venue: m["container-title"]?.[0] ?? m.publisher ?? null, year: y, cited_by: m["is-referenced-by-count"] ?? 0 };
}
async function datacite(doi) {
  const r = await get(`https://api.datacite.org/dois/${encodeURIComponent(doi)}`);
  if (!r) return null;
  const a = (await r.json()).data?.attributes;
  if (!a?.titles?.[0]?.title) return null;
  return { title: clean(a.titles[0].title), authors: (a.creators ?? []).map((c) => c.name), venue: a.publisher ?? null, year: a.publicationYear ?? null, cited_by: a.citationCount ?? 0 };
}
async function arxivApi(id) {
  const r = await get(`https://export.arxiv.org/api/query?id_list=${id}`);
  if (!r) return null;
  const x = await r.text();
  const e = x.split("<entry>")[1];
  if (!e || !/<title>/.test(e)) return null;
  const title = clean(e.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
  if (!title || /^error/i.test(title)) return null;
  return { title, authors: [...e.matchAll(/<name>(.*?)<\/name>/g)].map((m) => m[1]), venue: "arXiv", year: Number(e.match(/<published>(\d{4})/)?.[1]) || null, cited_by: 0 };
}

async function subtitle(doi) {
  const r = await get(`https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${MAIL}`);
  if (!r) return "";
  const m = (await r.json()).message;
  return clean(m?.subtitle?.[0] ?? "");
}

export async function resolve(id) {
  let rec = null, url;
  if (id.startsWith("doi:")) {
    const doi = id.slice(4);
    url = `https://doi.org/${doi}`;
    rec = (await openalex(doi)) ?? (/^10\.(21227|5281|17632|4121|48726)\//.test(doi) ? await datacite(doi) : null) ?? (await crossref(doi)) ?? (await datacite(doi));
    if (rec && !/^10\.(21227|5281|17632|4121|48726)\//.test(doi)) {
      const sub = await subtitle(doi);
      if (sub && !rec.title.toLowerCase().includes(sub.toLowerCase().slice(0, 25))) rec.title = `${rec.title}: ${sub}`;
    }
  } else {
    const a = id.slice(6);
    url = `https://arxiv.org/abs/${a}`;
    rec = (await openalex(`10.48550/arXiv.${a}`)) ?? (await arxivApi(a));
    if (rec && rec.venue === null) rec.venue = "arXiv";
  }
  return rec ? { ...rec, url } : null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let ids;
  if (idsFile) ids = fs.readFileSync(idsFile, "utf8").split(/\s+/).filter(Boolean);
  else {
    const dir = path.join(root, "data/datasets");
    ids = fs.readdirSync(dir).filter((f) => f.endsWith(".yaml")).flatMap((f) => {
      const d = yaml.load(fs.readFileSync(path.join(dir, f), "utf8"));
      return [d.paper, ...(d.used_in ?? []), ...(d.citing ?? [])];
    });
  }
  ids = [...new Set(ids.map((i) => i.toLowerCase().startsWith("doi:") ? "doi:" + i.slice(4).toLowerCase() : i.toLowerCase()))];
  const missing = [];
  for (const id of ids) {
    if (cache[id] && !refresh) continue;
    const rec = await resolve(id);
    if (rec) cache[id] = { ...rec, fetched: new Date().toISOString().slice(0, 10) }; else missing.push(id);
    await sleep(120);
  }
  const keep = idsFile ? Object.keys(cache) : ids;
  if (!check) fs.writeFileSync(out, JSON.stringify(Object.fromEntries(Object.entries(cache).filter(([k]) => keep.includes(k)).sort(([a], [b]) => a.localeCompare(b))), null, 1) + "\n");
  console.log(`${ids.length - missing.length}/${ids.length} resolved`);
  if (missing.length) { console.error("UNRESOLVED:\n" + missing.join("\n")); process.exit(1); }
}
