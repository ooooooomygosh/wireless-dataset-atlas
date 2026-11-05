/* Shared acquisition semantics: a supported capability may need generation. */
function supportsField(status, readyOnly = false) {
  return (
    readyOnly ? ["直接提供"] : ["直接提供", "可计算", "需额外仿真"]
  ).includes(status);
}
function missingObservations(resource, needs, readyOnly = false) {
  return needs.filter(
    (key) =>
      !supportsField(resource.fields?.[key], readyOnly) ||
      (key === "crossfreq" &&
        !(
          resource.pairing?.type === "simultaneous_measured" &&
          resource.pairing?.confirmed === true
        )),
  );
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { supportsField, missingObservations };
}

function isMeasuredSource(resource) {
  const origin = resource.origin || "";
  return (
    /真实|实测|测量/.test(origin) && !/统计|随机|射线|信道仿真/.test(origin)
  );
}
function researchMissing(resource, constraints = {}, goal = "") {
  const missing = missingObservations(
    resource,
    constraints.needs || [],
    !!constraints.readyOnly,
  ).map((key) => ({
    key,
    reason: `${key}：${resource.fields?.[key] || "未知"}`,
  }));
  if (constraints.measured && !isMeasuredSource(resource))
    missing.push({
      key: "measured",
      reason: "要求真实测量；该资源的物理来源不满足。",
    });
  if (
    constraints.exact &&
    !(
      resource.pairing?.type === "simultaneous_measured" &&
      resource.pairing?.confirmed === true &&
      resource.pairing?.frequenciesGHz?.includes(3.5) &&
      resource.pairing?.frequenciesGHz?.includes(28)
    )
  )
    missing.push({
      key: "exact",
      reason: "没有完整核验的真实同步3.5→28 GHz配对协议。",
    });
  if (goal === "foundation-pretrain" && resource.id === "cfm-bench")
    missing.push({
      key: "protocol",
      reason: "CFM-Bench官方协议禁止将其所有splits用于基础模型预训练。",
    });
  return missing;
}
function selectResearchPlan(resources, playbook, constraints = {}) {
  const byId = new Map(resources.map((r) => [r.id, r]));
  const evaluated = (playbook.candidates || []).map((candidate) => {
    const resource = byId.get(candidate.resourceId || candidate.id);
    const effectiveFields = {
      ...resource?.fields,
      ...candidate.fieldOverrides,
    };
    const scopedResource = resource
      ? { ...resource, fields: effectiveFields }
      : null;
    const missing = scopedResource
      ? researchMissing(scopedResource, constraints, playbook.id)
      : [{ key: "resource", reason: "资源记录缺失" }];
    for (const item of missing)
      if (candidate.constraintNotes?.[item.key])
        item.reason = candidate.constraintNotes[item.key];
    return { candidate, resource, effectiveFields, missing };
  });
  const eligible = evaluated.filter((x) => !x.missing.length);
  const primary = eligible.find((x) => x.candidate.canStart !== false) || null;
  const recommended = (
    primary ? [primary, ...eligible.filter((x) => x !== primary)] : eligible
  ).slice(0, 3);
  const knownIds = new Set(evaluated.map((x) => x.resource?.id));
  const others = resources.filter(
    (r) =>
      !knownIds.has(r.id) &&
      !researchMissing(r, constraints, playbook.id).length,
  );
  return {
    goal: playbook.id,
    primary,
    recommended,
    moreEligible: eligible.filter((x) => !recommended.includes(x)),
    excluded: evaluated.filter((x) => x.missing.length),
    others,
    constraints,
  };
}
if (typeof module !== "undefined" && module.exports)
  Object.assign(module.exports, {
    isMeasuredSource,
    researchMissing,
    selectResearchPlan,
  });
