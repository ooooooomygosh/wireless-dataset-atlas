import type { APIRoute, GetStaticPaths } from "astro";
import { allDatasets, tasks, papers, paperOf, LANGS, type Lang } from "../../lib/data.ts";
import { tasksText } from "../../lib/view.ts";

export const getStaticPaths: GetStaticPaths = () => LANGS.map((lang) => ({ params: { lang } }));

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as Lang;
  const ds = await allDatasets();
  const out: { k: string; n: string; s: string; u: string; x: string }[] = [];
  for (const d of ds) {
    const tt = tasksText(d, lang).join(", ");
    out.push({ k: "dataset", n: d.name, s: String(d.year), u: `/${lang}/datasets/${d.id}/`, x: [d.name, ...d.aliases, tt, d.summary[lang], d.organization ?? ""].join(" ").toLowerCase() });
  }
  for (const x of tasks) out.push({ k: "task", n: x.name[lang], s: "", u: `/${lang}/tasks/${x.id}/`, x: [x.name.en, x.name.zh].join(" ").toLowerCase() });
  const seen = new Set<string>();
  for (const d of ds) for (const id of [d.paper, ...d.used_in]) {
    if (seen.has(id) || !papers[id]) continue;
    seen.add(id);
    const p = paperOf(id);
    out.push({ k: "paper", n: p.title, s: String(p.year ?? ""), u: `/${lang}/papers/#${encodeURIComponent(id)}`, x: [p.title, ...p.authors].join(" ").toLowerCase() });
  }
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
};
