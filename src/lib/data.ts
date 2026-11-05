import fs from "node:fs";
import path from "node:path";
import { getCollection } from "astro:content";
import * as yaml from "js-yaml";
import { taskSchema, type Dataset, type Task } from "../schema.ts";
import en from "../i18n/en.json";
import zh from "../i18n/zh.json";
import { ORIGIN, SIGNAL, ENVIRONMENT, ACCESS, BAND, bandClass } from "../i18n/enums.ts";

export type Lang = "en" | "zh";
export const LANGS: Lang[] = ["en", "zh"];
const dict = { en, zh } as Record<Lang, Record<string, string>>;

export const t = (lang: Lang, key: string, vars: Record<string, string | number> = {}) =>
  (dict[lang][key] ?? dict.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

export const label = (map: Record<string, { en: string; zh: string }>, id: string, lang: Lang) => map[id]?.[lang] ?? id;
export const labels = { origin: ORIGIN, signal: SIGNAL, environment: ENVIRONMENT, access: ACCESS, band: BAND };

export interface Paper {
  title: string;
  authors: string[];
  venue: string | null;
  year: number | null;
  cited_by: number;
  url: string;
  doi?: string;
}

const root = process.cwd();
export const papers: Record<string, Paper> = fs.existsSync(path.join(root, "data/papers.json"))
  ? JSON.parse(fs.readFileSync(path.join(root, "data/papers.json"), "utf8"))
  : {};
export const lastUpdated: string = fs.existsSync(path.join(root, "data/papers.json"))
  ? fs.statSync(path.join(root, "data/papers.json")).mtime.toISOString().slice(0, 10)
  : new Date().toISOString().slice(0, 10);

export const tasks: Task[] = (yaml.load(fs.readFileSync(path.join(root, "data/tasks.yaml"), "utf8")) as unknown[]).map((x) =>
  taskSchema.parse(x),
);
type L = { en: string; zh: string };
export interface Tool { id: string; name: string; category: L; repo: string; license: L; role: L; how_to_use: L[]; limitations: L[]; datasets: string[] }
export interface Tutorial { id: string; title: L; file: string; status: L; description: L; environment: L; steps: L[]; code: string }
export const tools: Tool[] = yaml.load(fs.readFileSync(path.join(root, "data/tools.yaml"), "utf8")) as Tool[];
export const tutorials: Tutorial[] = (yaml.load(fs.readFileSync(path.join(root, "data/tutorials.yaml"), "utf8")) as Omit<Tutorial, "code">[]).map((x) => ({
  ...x,
  code: fs.readFileSync(path.join(root, x.file), "utf8"),
}));
export const taskById = (id: string) => tasks.find((x) => x.id === id)!;

export async function allDatasets(): Promise<Dataset[]> {
  const rows = await getCollection("datasets");
  return rows.map((r) => r.data).sort((a, b) => a.name.localeCompare(b.name));
}

export const paperUrl = (id: string) => (id.startsWith("doi:") ? `https://doi.org/${id.slice(4)}` : `https://arxiv.org/abs/${id.slice(6)}`);
export const paperOf = (id: string): Paper =>
  papers[id] ?? { title: id, authors: [], venue: null, year: null, cited_by: 0, url: paperUrl(id) };

export function formatBands(b: number[]): string {
  if (!b.length) return "—";
  const f = (x: number) => String(x);
  return b.length > 3 ? `${f(Math.min(...b))}–${f(Math.max(...b))}` : b.map(f).join(" / ");
}
export const bandClasses = (d: Dataset) => [...new Set(d.bands_ghz.map(bandClass))];
export const authorsShort = (a: string[]) => (a.length > 3 ? `${a.slice(0, 3).join(", ")} et al.` : a.join(", "));
export const toPath = (lang: Lang, p = "") => `/${lang}/${p}`.replace(/\/+$/, "/") ;

export function bibtex(id: string): string {
  const p = paperOf(id);
  const key = (p.authors[0]?.split(" ").pop() ?? "paper").replace(/\W/g, "") + (p.year ?? "");
  return `@article{${key},\n  title = {${p.title}},\n  author = {${p.authors.join(" and ")}},\n  year = {${p.year ?? ""}},\n  journal = {${p.venue ?? ""}},\n  url = {${p.url}}\n}`;
}
