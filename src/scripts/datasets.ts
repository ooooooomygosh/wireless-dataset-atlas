import { getIds, toggle, MAX } from "./compare-store.ts";

const root = document.getElementById("browser")!;
const rows = [...document.querySelectorAll<HTMLElement>("#view-table tbody tr")];
const cardOf = new Map<string, HTMLElement>();
document.querySelectorAll<HTMLElement>("#view-cards .card").forEach((c) => cardOf.set(c.dataset.id!, c));
const KEYS = ["task", "origin", "signal", "band", "environment", "access", "cap", "code"] as const;
type Key = (typeof KEYS)[number];
const facetEl = (k: Key) => root.querySelector<HTMLElement>(`.facet[data-facet="${k}"]`)!;
const qEl = document.getElementById("q") as HTMLInputElement;
const sortEl = document.getElementById("sort") as HTMLSelectElement;
const tbody = document.querySelector("#view-table tbody")!;
const cardsEl = document.getElementById("view-cards")!;

type State = { sel: Record<Key, Set<string>>; q: string; sort: string; view: string };
const state: State = { sel: Object.fromEntries(KEYS.map((k) => [k, new Set<string>()])) as State["sel"], q: "", sort: "name", view: "table" };

function readUrl() {
  const p = new URLSearchParams(location.search);
  for (const k of KEYS) state.sel[k] = new Set((p.get(k) || "").split(",").filter(Boolean));
  state.q = p.get("q") || ""; state.sort = p.get("sort") || "name"; state.view = p.get("view") || "table";
}
function writeUrl() {
  const p = new URLSearchParams();
  for (const k of KEYS) if (state.sel[k].size) p.set(k, [...state.sel[k]].join(","));
  if (state.q) p.set("q", state.q);
  if (state.sort !== "name") p.set("sort", state.sort);
  if (state.view !== "table") p.set("view", state.view);
  const s = p.toString();
  history.replaceState(null, "", location.pathname + (s ? "?" + s : ""));
}
const has = (row: HTMLElement, k: Key, v: string) => (row.dataset[k] || "").split(" ").includes(v);
function passes(row: HTMLElement, skip?: Key) {
  if (state.q && !(row.dataset.name || "").includes(state.q.toLowerCase())) return false;
  for (const k of KEYS) {
    if (k === skip || !state.sel[k].size) continue;
    if (![...state.sel[k]].some((v) => has(row, k, v))) return false;
  }
  return true;
}
function sortRows() {
  const key = state.sort;
  const cmp = (a: HTMLElement, b: HTMLElement) =>
    key === "year" ? Number(b.dataset.year) - Number(a.dataset.year) || (a.dataset.sortname! < b.dataset.sortname! ? -1 : 1)
    : key === "cited" ? Number(b.dataset.cited) - Number(a.dataset.cited) || (a.dataset.sortname! < b.dataset.sortname! ? -1 : 1)
    : a.dataset.sortname! < b.dataset.sortname! ? -1 : 1;
  const sorted = [...rows].sort(cmp);
  sorted.forEach((r) => { tbody.appendChild(r); const c = cardOf.get(r.dataset.id!); if (c) cardsEl.appendChild(c); });
}
function apply() {
  let n = 0;
  for (const r of rows) {
    const ok = passes(r);
    r.hidden = !ok;
    const c = cardOf.get(r.dataset.id!); if (c) c.hidden = !ok;
    if (ok) n++;
  }
  // facet counts: options are counted against all other active facets
  for (const k of KEYS) {
    facetEl(k).querySelectorAll<HTMLLabelElement>("label").forEach((lab) => {
      const input = lab.querySelector("input")!;
      const c = rows.filter((r) => passes(r, k) && has(r, k, input.value)).length;
      lab.querySelector(".c")!.textContent = String(c);
      lab.classList.toggle("zero", c === 0 && !input.checked);
    });
  }
  const tpl = root.dataset.countTpl || "{n} / {total}";
  document.getElementById("count")!.textContent = tpl.replace("{n}", String(n)).replace("{total}", root.dataset.total || "");
  (document.getElementById("empty") as HTMLElement).hidden = n > 0;
  const any = KEYS.some((k) => state.sel[k].size) || !!state.q;
  (document.getElementById("reset") as HTMLElement).hidden = !any;
  writeUrl();
}
function syncControls() {
  for (const k of KEYS) facetEl(k).querySelectorAll<HTMLInputElement>("input").forEach((i) => (i.checked = state.sel[k].has(i.value)));
  qEl.value = state.q; sortEl.value = state.sort; setView(state.view, false);
}
function setView(v: string, write = true) {
  state.view = v;
  (document.getElementById("view-table") as HTMLElement).hidden = v !== "table";
  cardsEl.hidden = v !== "cards";
  document.getElementById("v-table")!.setAttribute("aria-pressed", String(v === "table"));
  document.getElementById("v-cards")!.setAttribute("aria-pressed", String(v === "cards"));
  if (write) writeUrl();
}

root.addEventListener("change", (e) => {
  const i = e.target as HTMLInputElement;
  const f = i.closest<HTMLElement>(".facet");
  if (f && i.type === "checkbox" && f.dataset.facet) {
    const k = f.dataset.facet as Key;
    i.checked ? state.sel[k].add(i.value) : state.sel[k].delete(i.value);
    apply();
  }
});
qEl.addEventListener("input", () => { state.q = qEl.value.trim(); apply(); });
sortEl.addEventListener("change", () => { state.sort = sortEl.value; sortRows(); writeUrl(); });
document.getElementById("v-table")!.addEventListener("click", () => setView("table"));
document.getElementById("v-cards")!.addEventListener("click", () => setView("cards"));
document.getElementById("reset")!.addEventListener("click", () => { for (const k of KEYS) state.sel[k].clear(); state.q = ""; syncControls(); apply(); });

// compare checkboxes
function syncCompare() {
  const ids = getIds();
  document.querySelectorAll<HTMLInputElement>("input[data-compare]").forEach((i) => { i.checked = ids.includes(i.dataset.compare!); });
}
document.addEventListener("change", (e) => {
  const i = e.target as HTMLInputElement;
  if (!i.dataset?.compare) return;
  if (!toggle(i.dataset.compare)) { i.checked = false; alert(document.documentElement.lang.startsWith("zh") ? "最多同时对比四个数据集。" : `Up to ${MAX} datasets can be compared.`); }
  syncCompare();
});
window.addEventListener("compare-change", syncCompare);

readUrl(); syncControls(); sortRows(); apply(); syncCompare();

const ft = document.getElementById("facet-toggle")!;
ft.addEventListener("click", () => {
  const open = document.getElementById("facets")!.classList.toggle("open");
  ft.setAttribute("aria-expanded", String(open));
});
