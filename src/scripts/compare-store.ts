const KEY = "atlas-compare";
export const MAX = 4;
export function getIds(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function setIds(ids: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX))); } catch {}
  window.dispatchEvent(new CustomEvent("compare-change"));
}
export function toggle(id: string): boolean {
  const ids = getIds();
  const i = ids.indexOf(id);
  if (i >= 0) { ids.splice(i, 1); setIds(ids); return true; }
  if (ids.length >= MAX) return false;
  ids.push(id); setIds(ids); return true;
}
