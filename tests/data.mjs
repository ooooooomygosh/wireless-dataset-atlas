import fs from "node:fs";
import assert from "node:assert/strict";
const data = JSON.parse(
  fs.readFileSync(new URL("../data/atlas.json", import.meta.url)),
);
assert(data.resources.length >= 30);
for (const k of ["resources", "sources"])
  assert.equal(
    new Set(data[k].map((x) => x.id)).size,
    data[k].length,
    "duplicate IDs",
  );
const sources = new Set(data.sources.map((x) => x.id));
const values = new Set(["直接提供", "可计算", "需额外仿真", "不支持", "未知"]);
for (const r of data.resources) {
  for (const k of [
    "id",
    "name",
    "kind",
    "origin",
    "summary",
    "sourceIds",
    "fields",
    "tasks",
    "provenance",
    "physics",
    "risks",
  ])
    assert(r[k] != null, `${r.id}: missing ${k}`);
  assert(r.sourceIds.length > 0, `${r.id}: missing evidence`);
  r.sourceIds.forEach((s) => assert(sources.has(s), `${r.id}: dangling ${s}`));
  Object.values(r.fields).forEach((s) =>
    assert(values.has(s), `${r.id}: status ${s}`),
  );
}
for (const s of data.sources) {
  assert(/^https?:\/\//.test(s.url));
  assert(s.readScope);
  assert(s.checkedAt);
  assert(
    !(/搜索.*摘录|摘要/.test(s.readScope) && s.status === "全文已读"),
    "excerpt cannot be full read",
  );
}
assert(data.tutorials.length >= 6);
assert.equal(data.topics.length, 5);
console.log(
  "Data contracts: resource count, IDs, sources, field states, tutorial and topic counts passed",
);
const js = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
const css = fs.readFileSync(
  new URL("../src/style.css", import.meta.url),
  "utf8",
);
const shell = fs.readFileSync(
  new URL("../src/index.html", import.meta.url),
  "utf8",
);
assert(
  !/\bfetch\s*\(|\bXMLHttpRequest\b|\bimport\s*\(/.test(js),
  "offline app must not fetch runtime resources",
);
assert(
  !/@import|url\s*\(\s*["']?https?:/i.test(css),
  "no remote CSS dependency",
);
assert(
  !/<script[^>]+src=|<link[^>]+href=/i.test(shell),
  "no external runtime assets",
);
console.log(
  "Offline contract: no fetch, imports, remote CSS or script dependencies",
);
for (const r of data.resources) {
  for (const p of r.papers || []) {
    assert(/^https?:\/\//.test(p.url), `${r.id}: invalid paper URL`);
    assert(p.locator, `${r.id}: paper has no reading locator`);
  }
}

const { createRequire } = await import("node:module");
const require = createRequire(import.meta.url);
const { supportsField, missingObservations } = require("../src/selection.js");
for (const state of ["直接提供", "可计算", "需额外仿真"])
  assert(supportsField(state));
for (const state of ["不支持", "未知", undefined])
  assert(!supportsField(state));
assert(supportsField("直接提供", true));
assert(!supportsField("可计算", true));
assert(!supportsField("需额外仿真", true));
for (const id of ["deepmimo", "sionna-rt"]) {
  const r = data.resources.find((r) => r.id === id);
  assert.deepEqual(
    missingObservations(r, ["csi"]),
    [],
    `${id}: CSI generation must qualify`,
  );
  assert.deepEqual(missingObservations(r, ["csi"], true), ["csi"]);
}
assert.deepEqual(
  missingObservations({ fields: { crossfreq: "需额外仿真" } }, ["crossfreq"]),
  ["crossfreq"],
  "simulation does not establish synchronous measured pairs",
);
assert.deepEqual(
  missingObservations(
    {
      fields: { crossfreq: "直接提供" },
      pairing: { type: "simultaneous_measured", confirmed: true },
    },
    ["crossfreq"],
  ),
  [],
);
console.log(
  "Selection regression: generated CSI qualifies, ready-only opt-in and paired-measurement constraints preserved",
);

const { selectResearchPlan, isMeasuredSource } = require("../src/selection.js");
assert.equal(data.researchPlaybooks.length, 6);
const book = (id) => data.researchPlaybooks.find((p) => p.id === id);
for (const p of data.researchPlaybooks) {
  for (const c of p.candidates) {
    assert(data.resources.some((r) => r.id === c.resourceId));
    assert(c.why && c.whatCanProve && c.whatCannotProve && c.extraWork);
    c.sourceIds.forEach((id) => assert(sources.has(id)));
  }
  assert(selectResearchPlan(data.resources, p).recommended.length <= 3);
}
assert.equal(
  selectResearchPlan(data.resources, book("beam-baseline")).primary.resource.id,
  "deepmimo",
);
assert.equal(
  selectResearchPlan(data.resources, book("foundation-pretrain")).primary
    .resource.id,
  "contrawimae",
);
const multimodal = selectResearchPlan(
  data.resources,
  book("multimodal-nearfield"),
  { needs: ["csi", "lidar"] },
);
assert(
  multimodal.recommended.some((x) => x.resource.id === "sionna-rt"),
  "same-scene simulated point cloud is supported",
);
assert(
  !selectResearchPlan(data.resources, book("multimodal-nearfield"), {
    needs: ["csi", "lidar"],
    readyOnly: true,
  }).recommended.some((x) => x.resource.id === "sionna-rt"),
);
assert.equal(
  selectResearchPlan(data.resources, book("cross-frequency"), { exact: true })
    .primary,
  null,
  "never relax exact measured pairing",
);
assert(
  !selectResearchPlan(data.resources, book("foundation-pretrain")).others.some(
    (r) => r.id === "cfm-bench",
  ),
  "benchmark pretraining embargo remains enforced",
);
assert(!isMeasuredSource({ origin: "实测参数化的统计模型" }));
for (const id of ["deepmimo", "sionna-rt", "quadriga", "deepsense-6g"])
  assert(data.coreGuides[id]?.work);
console.log(
  "Research decisions: curated first steps, at most three recommendations, LiDAR generation, measured origin and benchmark protocol guards passed",
);
const scoped = selectResearchPlan(
  data.resources,
  book("multimodal-nearfield"),
  { needs: ["csi", "lidar"] },
);
assert(
  scoped.excluded.some(
    (x) =>
      x.resource.id === "deepsense-6g" &&
      x.missing.some((m) => m.key === "csi"),
  ),
  "never combine capabilities from unrelated DeepSense scenarios",
);
assert.equal(
  selectResearchPlan(data.resources, book("cross-frequency"), {
    measured: true,
  }).primary,
  null,
  "partial real RF checks cannot replace a cross-band beam main source",
);
assert.equal(
  selectResearchPlan(data.resources, book("foundation-pretrain"), {
    measured: true,
  }).primary,
  null,
  "external validation role must not silently become pretraining main source",
);
