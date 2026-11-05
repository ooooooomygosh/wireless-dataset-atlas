// Refresh the generated blocks (stats, task table) in both README files.
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";

const root = path.resolve(import.meta.dirname, "..");
const dir = path.join(root, "data/datasets");
const ds = fs.readdirSync(dir).filter((f) => f.endsWith(".yaml")).map((f) => yaml.load(fs.readFileSync(path.join(dir, f), "utf8")));
const tasks = yaml.load(fs.readFileSync(path.join(root, "data/tasks.yaml"), "utf8"));
const papers = new Set(ds.flatMap((d) => [d.paper, ...(d.used_in ?? []), ...(d.citing ?? [])].filter(Boolean))).size;
const site = "https://wireless-dataset-atlas.vercel.app";
const used = tasks.filter((t) => ds.some((d) => d.tasks.includes(t.id)));

const blocks = {
  "README.md": {
    stats: `${ds.length} datasets · ${used.length} tasks · ${papers} papers`,
    tasks: ["| Task | Datasets |", "| --- | ---: |", ...used.map((t) => `| [${t.name.en}](${site}/en/tasks/${t.id}/) | ${ds.filter((d) => d.tasks.includes(t.id)).length} |`)].join("\n"),
  },
  "README.zh-CN.md": {
    stats: `${ds.length} 个数据集 · ${used.length} 类任务 · ${papers} 篇论文`,
    tasks: ["| 任务 | 数据集数 |", "| --- | ---: |", ...used.map((t) => `| [${t.name.zh}](${site}/zh/tasks/${t.id}/) | ${ds.filter((d) => d.tasks.includes(t.id)).length} |`)].join("\n"),
  },
};
for (const [file, b] of Object.entries(blocks)) {
  const p = path.join(root, file);
  let s = fs.readFileSync(p, "utf8");
  for (const k of ["stats", "tasks"]) s = s.replace(new RegExp(`<!-- ${k}:start -->[\\s\\S]*?<!-- ${k}:end -->`), `<!-- ${k}:start -->\n${b[k]}\n<!-- ${k}:end -->`);
  fs.writeFileSync(p, s);
}
console.log("README blocks updated");
