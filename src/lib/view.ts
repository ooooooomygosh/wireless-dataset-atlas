import type { Dataset } from "../schema.ts";
import { label, labels, formatBands, paperOf, taskById, t, type Lang } from "./data.ts";

export const tasksText = (d: Dataset, lang: Lang) => d.tasks.map((x) => taskById(x).name[lang]);

/** Display strings for every spec row, shared by the detail and compare pages. */
export function specRows(d: Dataset, lang: Lang): [string, string, string][] {
  const none = t(lang, "spec.none");
  const antText = d.antennas ? [d.antennas.tx ? `Tx ${d.antennas.tx}` : "", d.antennas.rx ? `Rx ${d.antennas.rx}` : "", d.antennas.array ? d.antennas.array.toUpperCase() : ""].filter(Boolean).join(", ") : "";
  return [
    ["organization", t(lang, "spec.organization"), d.organization ?? none],
    ["year", t(lang, "spec.year"), String(d.year)],
    ["origin", t(lang, "spec.origin"), label(labels.origin, d.origin, lang)],
    ["signals", t(lang, "spec.signals"), d.signals.map((s) => label(labels.signal, s, lang)).join(", ")],
    ["band", t(lang, "spec.band"), d.bands_ghz.length ? `${formatBands(d.bands_ghz)} ${t(lang, "unit.ghz")}` : none],
    ["bandwidth", t(lang, "spec.bandwidth"), d.bandwidth_mhz ? `${d.bandwidth_mhz} ${t(lang, "unit.mhz")}` : none],
    ["environment", t(lang, "spec.environment"), d.environment.map((s) => label(labels.environment, s, lang)).join(", ") || none],
    ["antennas", t(lang, "spec.antennas"), antText || none],
    ["subcarriers", t(lang, "spec.subcarriers"), d.subcarriers ? String(d.subcarriers) : none],
    ["samples", t(lang, "spec.samples"), d.samples ?? none],
    ["size", t(lang, "spec.size"), d.size_gb ? `${d.size_gb} ${t(lang, "unit.gb")}` : none],
    ["format", t(lang, "spec.format"), d.format ?? none],
    ["mobility", t(lang, "spec.mobility"), d.mobility ?? none],
    ["standard", t(lang, "spec.standard"), d.standard ?? none],
    ["license", t(lang, "spec.license"), d.license],
    ["access", t(lang, "spec.access"), label(labels.access, d.access.type, lang)],
  ];
}

export const citedOf = (d: Dataset) => paperOf(d.paper).cited_by;
