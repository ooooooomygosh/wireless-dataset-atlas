import { getIds, setIds } from "./compare-store.ts";

const lang = document.body.dataset.lang || "en";

// theme
document.getElementById("theme")?.addEventListener("click", () => {
  const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("atlas-theme", next); } catch {}
});

// keep query string when switching language
const sw = document.getElementById("lang-switch") as HTMLAnchorElement | null;
sw?.addEventListener("click", () => { sw.href = sw.pathname + location.search + location.hash; });

// compare tray
const tray = document.getElementById("tray")!;
function renderTray() {
  const n = getIds().length;
  tray.hidden = n === 0 || location.pathname.includes("/compare/");
  document.getElementById("tray-count")!.textContent = (tray.dataset.label || "").replace("{n}", String(n));
  const open = document.getElementById("tray-open") as HTMLAnchorElement;
  open.href = `/${lang}/compare/?ids=${getIds().join(",")}`;
}
document.getElementById("tray-clear")?.addEventListener("click", () => setIds([]));
window.addEventListener("compare-change", renderTray);
window.addEventListener("storage", renderTray);
renderTray();

// search
type Hit = { k: string; n: string; s: string; u: string; x: string };
let index: Hit[] | null = null;
const dlg = document.getElementById("search") as HTMLDialogElement;
const input = document.getElementById("search-input") as HTMLInputElement;
const list = document.getElementById("search-results")!;
let sel = 0;
const kinds: Record<string, Record<string, string>> = {
  en: { dataset: "Dataset", task: "Task", paper: "Paper" },
  zh: { dataset: "数据集", task: "任务", paper: "论文" },
};
const emptyText = lang === "zh" ? "没有匹配项" : "No matches";

async function load() {
  if (index) return index;
  index = await (await fetch(`/${lang}/search.json`)).json();
  return index!;
}
function score(h: Hit, q: string[]): number {
  const name = h.n.toLowerCase(), all = h.x;
  let s = 0;
  for (const w of q) {
    if (!all.includes(w)) return 0;
    s += name === w ? 100 : name.startsWith(w) ? 40 : name.includes(w) ? 20 : 5;
  }
  return s + (h.k === "dataset" ? 3 : h.k === "task" ? 2 : 0);
}
async function run() {
  const data = await load();
  const q = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hits = (q.length ? data.map((h) => [h, score(h, q)] as const).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).map(([h]) => h) : data.filter((h) => h.k === "dataset")).slice(0, 12);
  sel = 0;
  list.innerHTML = hits.length
    ? hits.map((h, i) => `<li><a href="${h.u}" role="option" aria-selected="${i === 0}"><span>${esc(h.n)}${h.s ? ` <span class="faint">${esc(h.s)}</span>` : ""}</span><span class="kind">${kinds[lang][h.k]}</span></a></li>`).join("")
    : `<li class="empty">${emptyText}</li>`;
}
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
function openSearch() { dlg.showModal(); input.value = ""; run(); input.focus(); }
document.getElementById("search-open")?.addEventListener("click", openSearch);
addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); dlg.open ? dlg.close() : openSearch(); }
  else if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName) && !dlg.open) { e.preventDefault(); openSearch(); }
});
input.addEventListener("input", run);
input.addEventListener("keydown", (e) => {
  const items = [...list.querySelectorAll<HTMLAnchorElement>("a")];
  if (!items.length) return;
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items.forEach((a, i) => { a.setAttribute("aria-selected", String(i === sel)); if (i === sel) a.scrollIntoView({ block: "nearest" }); });
  } else if (e.key === "Enter") { e.preventDefault(); items[sel].click(); }
});
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
