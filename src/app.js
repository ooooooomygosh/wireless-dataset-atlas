const R = ATLAS.resources,
  S = ATLAS.sources,
  T = ATLAS.topics || [],
  U = ATLAS.tutorials || [];
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s ?? "尚未确认").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const arr = (x) => (Array.isArray(x) ? x : x == null ? [] : [x]),
  txt = (x) =>
    typeof x === "object" ? JSON.stringify(x) : String(x ?? "尚未确认");
const fieldNames = {
  csi: "复数 CSI",
  paths: "逐径角度 / 交互记录",
  position: "位置 / 姿态",
  beam: "波束标签 / 功率",
  rgb: "相机图像",
  lidar: "LiDAR",
  radar: "Radar",
  time: "连续时间 / 序列",
  multiuser: "多用户",
  multibs: "多基站",
  crossfreq: "跨频配对",
};
const navs = [
  ["home", "◈", "总览 Overview"],
  ["core", "◎", "四个核心资源怎么选"],
  ["pipelines", "↳", "数据生产工作台"],
  ["browse", "▦", "数据资源浏览器"],
  ["compare", "⇄", "对比实验室"],
  ["wizard", "⌘", "研究任务选型"],
  ["visuals", "⌁", "生态与能力地图"],
  ["topics", "◇", "深度研究专题"],
  ["tutorials", "▤", "教程与复现"],
  ["projects", "⚙", "相关项目与生产工具"],
  ["library", "▣", "论文与官方材料"],
  ["sources", "↗", "资料与证据库"],
  ["coverage", "✓", "覆盖与质量"],
];
let store = {};
try {
  store = JSON.parse(localStorage.getItem("atlas") || "{}");
} catch {}
let favorites = new Set(store.favorites || []),
  selected = new Set(
    ["deepmimo", "sionna-rt", "quadriga", "deepsense-6g"].filter((id) =>
      R.some((r) => r.id === id),
    ),
  ),
  filters = {
    q: "",
    kind: "",
    origin: "",
    field: "",
    task: "",
    fav: false,
    view: "grid",
    sort: "name",
  },
  sourceFilter = { q: "", type: "", resource: "", status: "" };
function persist() {
  try {
    localStorage.setItem(
      "atlas",
      JSON.stringify({
        favorites: [...favorites],
        dark: document.body.classList.contains("dark"),
      }),
    );
  } catch {}
}
if (store.dark) document.body.classList.add("dark");
function toast(t) {
  $("#toast").textContent = t;
  $("#toast").style.display = "block";
  setTimeout(() => ($("#toast").style.display = "none"), 2400);
}
function tag(t, c = "") {
  return `<span class="tag ${c}">${esc(t)}</span>`;
}
function statusClass(s) {
  return /直接|已确认|已读/.test(s)
    ? "state-direct"
    : /条件|计算|额外/.test(s)
      ? "state-conditional"
      : /不支持/.test(s)
        ? "state-no"
        : "state-unknown";
}
function sourceIds(r) {
  return arr(r.sourceIds);
}
function refs(ids) {
  return arr(ids)
    .map((id) => {
      let s = S.find((s) => s.id === id);
      return s
        ? `<a href="#sources/${s.id}" class="tag neutral">↗ ${esc(s.title)}</a>`
        : "";
    })
    .join("");
}
function title(ey, h, desc) {
  return `<div class="eyebrow">${ey}</div><h1>${h}</h1><p class="lead">${desc}</p>`;
}
function panel(h, body) {
  return `<section class="panel section"><h2>${h}</h2>${body}</section>`;
}
function kv(k, v) {
  return `<div class="kv"><span>${k}</span><div>${esc(txt(v))}</div></div>`;
}
function list(items) {
  return `<ul>${arr(items)
    .map((s) => `<li>${esc(txt(s))}</li>`)
    .join("")}</ul>`;
}
function flow(nodes) {
  return `<div class="flow">${arr(nodes)
    .map(
      (n, i) =>
        `${i ? '<span class="flow-arrow">→</span>' : ""}<div class="flow-node">${esc(txt(n))}</div>`,
    )
    .join("")}</div>`;
}
function resourceCard(r) {
  return `<article class="card ${selected.has(r.id) ? "selected" : ""}"><div class="row between">${tag(r.kind)}<button class="small" data-fav="${r.id}" aria-label="收藏 ${esc(r.name)}">${favorites.has(r.id) ? "★" : "☆"}</button></div><h3><a href="#resource/${r.id}">${esc(r.name)}</a></h3><p class="summary">${esc(r.summary)}</p><div>${tag(r.origin, "neutral")}${tag(txt(r.frequency), "neutral")}</div><div class="card-bottom"><a class="small" href="#resource/${r.id}">查看资料卡 ↗</a><button class="small" data-select="${r.id}">${selected.has(r.id) ? "✓ 已加入" : "＋ 对比"}</button></div></article>`;
}
function home() {
  let origins = {};
  R.forEach((r) => {
    let o = r.origin;
    let k = /混合|真实.*仿真|仿真.*真实/.test(o)
      ? "混合来源"
      : /实测参数|统计|随机|规范/.test(o)
        ? "统计模型与派生"
        : /射线|WinProp|PyLayers|交通|动态环境/.test(o)
          ? "RT 与场景仿真"
          : /真实|测量|实测/.test(o)
            ? "真实测量与实验"
            : /网络|离散事件|链路/.test(o)
              ? "网络与链路仿真"
              : "其他来源";
    origins[k] = (origins[k] || 0) + 1;
  });
  return `<section class="hero"><div class="eyebrow">WIRELESS RESEARCH · EVIDENCE FIRST</div><h1>从研究问题出发，<br>找到可信的数据。</h1><p class="lead">了解无线数据从哪里来、包含什么、能验证什么。把传播机制、观测条件和实验边界，放在模型选择之前。</p><div class="row"><a class="task-tile" href="#core">先分清四个核心资源 →</a><a class="task-tile" href="#pipelines">看数据怎样生产 →</a><a class="task-tile" href="#wizard">按研究任务选型 ↗</a><a class="task-tile" href="https://github.com/ooooooomygosh/wireless-dataset-atlas" target="_blank" rel="noreferrer">GitHub · 查看源码 / 参与维护 ↗</a></div></section><div class="stats">${[
    [R.length, "资源系列", "场景与版本单独列为子项"],
    [S.length, "来源索引", "阅读范围与访问状态逐条记录"],
    [
      Object.keys(fieldNames).length,
      "观测能力维度",
      "字段可得性与证据等级分开",
    ],
    [5, "深度研究专题", "物理机制 · 公平性 · 泛化"],
  ]
    .map(
      ([n, l, m]) =>
        `<div class="stat"><div class="label">${l}</div><div class="number">${n}</div><div class="note">${m}</div></div>`,
    )
    .join(
      "",
    )}</div><div class="section-title"><h2>你正在研究什么？</h2><a href="#wizard" class="small">打开选型向导 →</a></div><div class="grid">${[
    ["beam-baseline", "波束管理基线", "先比较oracle与强简单方法"],
    ["future-beam", "未来波束与遮挡", "时序、事件与净通信收益"],
    [
      "multimodal-nearfield",
      "多模态 / 近场波束",
      "CSI、RGB、扫描点云的具体作用",
    ],
    ["cross-frequency", "跨频辅助波束", "配对协议、同步与真实验证"],
    ["foundation-pretrain", "基础模型预训练", "先验证表示是否值得复用"],
    ["foundation-ood", "基础模型跨域评估", "测试暴露审计与跨源协议"],
  ]
    .map(
      ([t, h, d]) =>
        `<a class="task-tile" href="#wizard/${encodeURIComponent(t)}">${h}<span>${d}</span></a>`,
    )
    .join(
      "",
    )}</div><div class="two section"><section class="panel"><div class="section-title"><h2>优先深入的资源</h2><a href="#browse">全部 →</a></div>${R.filter(
    (r) => /deepmimo|sionna|deepsense|quadriga/i.test(r.id),
  )
    .slice(0, 4)
    .map(
      (r) =>
        `<div class="source"><h3><a href="#resource/${r.id}">${esc(r.name)}</a></h3><p>${esc(r.summary)}</p></div>`,
    )
    .join(
      "",
    )}</section><section class="panel"><h2>资源来源分布</h2>${Object.entries(
    origins,
  )
    .map(
      ([k, v]) =>
        `<div class="bar-row"><span>${esc(k)}</span><div class="bar"><i style="width:${(v / R.length) * 100}%"></i></div><b>${v}</b></div>`,
    )
    .join(
      "",
    )}<p class="legend">分母为收录资源系列，包含工具与平台；此图不代表数据样本比例或独立物理来源数量。</p><div class="callout">引擎能力、场景实际配置与已公开字段分别核验。相同上游数据不自动构成独立跨域验证。</div><a href="#coverage">查看覆盖边界与核验方法 →</a></section></div>`;
}
function filtered() {
  return R.filter(
    (r) =>
      (!filters.q ||
        JSON.stringify(r).toLowerCase().includes(filters.q.toLowerCase())) &&
      (!filters.kind || r.kind === filters.kind) &&
      (!filters.origin || r.origin === filters.origin) &&
      (!filters.field || supportsField(r.fields?.[filters.field])) &&
      (!filters.task ||
        arr(r.tasks).some((t) =>
          txt(t.name).toLowerCase().includes(filters.task.toLowerCase()),
        )) &&
      (!filters.fav || favorites.has(r.id)),
  ).sort((a, b) =>
    filters.sort === "year"
      ? Number(b.year) - Number(a.year)
      : a.name.localeCompare(b.name),
  );
}
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
function options(values, current) {
  return values
    .map(
      (v) =>
        `<option ${v === current ? "selected" : ""} value="${esc(v)}">${esc(v)}</option>`,
    )
    .join("");
}
function tray() {
  return `<div class="compare-tray"><span>${selected.size} / 4 个资源已选 · ${[...selected].map((id) => R.find((r) => r.id === id)?.name).join("、")}</span><a class="task-tile" href="#compare">并排对比 →</a></div>`;
}
function browse() {
  let f = filtered();
  return (
    title(
      "RESOURCE EXPLORER",
      "数据资源浏览器",
      "按观测条件与任务需求筛选。筛选中的“支持”包括直接提供、可计算和需额外仿真，具体配置要求请查看资料卡。",
    ) +
    `<div class="filters"><div class="row"><input id="browse-q" aria-label="搜索资源" placeholder="搜索名称、传播机制、场景或关键词…" value="${esc(filters.q)}"><select data-filter="kind" aria-label="资源类型"><option value="">所有资源类型</option>${options([...new Set(R.map((r) => r.kind))], filters.kind)}</select><select data-filter="origin" aria-label="来源类型"><option value="">所有数据来源</option>${options([...new Set(R.map((r) => r.origin))], filters.origin)}</select></div><div class="row filter-line"><select data-filter="field" aria-label="观测能力"><option value="">所需字段 / 能力</option>${Object.entries(
      fieldNames,
    )
      .map(
        ([k, v]) =>
          `<option value="${k}" ${filters.field === k ? "selected" : ""}>${v}</option>`,
      )
      .join(
        "",
      )}</select><input id="task-q" aria-label="任务关键词" placeholder="任务关键词，例如 Beam" value="${esc(filters.task)}"><select data-filter="sort" aria-label="排序"><option value="name">名称排序</option><option value="year" ${filters.sort === "year" ? "selected" : ""}>提出年份：新到旧</option></select><label><input id="favorites-only" type="checkbox" ${filters.fav ? "checked" : ""}> 仅收藏</label><button id="view">${filters.view === "grid" ? "切换列表" : "切换卡片"}</button><button id="reset">清除筛选</button></div></div><p class="count">找到 ${f.length} / ${R.length} 个资源系列</p><div class="grid ${filters.view === "list" ? "list-view" : ""}" id="results">${f.map(resourceCard).join("") || '<div class="empty">没有匹配资源。试着减少条件，未知能力不会自动视为已具备。</div>'}</div>${tray()}`
  );
}
function detail(id) {
  let r = R.find((r) => r.id === id);
  if (!r) return '<div class="empty">未找到资源</div>';
  return `<div class="detail-head"><a href="#browse" class="small">← 返回浏览器</a><div class="row between"><div><h1>${esc(r.name)}</h1>${tag(r.kind)}${tag(r.origin, "neutral")}${tag(r.evidenceLevel || "来源范围见下方", "neutral")}</div><button data-select="${r.id}">＋ 加入对比</button></div><p class="lead">${esc(r.summary)}</p>${refs(sourceIds(r))}</div><div class="tabs">${[
    ["identity", "身份与版本"],
    ["provenance", "数据生产"],
    ["fields", "字段矩阵"],
    ["tasks", "任务边界"],
    ["physics", "物理真实性"],
    ["papers", "文献与教程"],
    ["evidence", "来源核验"],
  ]
    .map(([i, t]) => `<a href="#resource/${id}/${i}">${t}</a>`)
    .join(
      "",
    )}</div><div id="identity" class="two"><section class="panel"><h2>基本身份与访问</h2>${[
    ["首次提出", r.year],
    ["作者 / 机构", r.authors || r.organization],
    ["最新可核实版本", r.version],
    ["频率", r.frequency],
    ["规模 / 统计单位", r.scale],
    ["数据格式", r.format],
    ["下载与访问", r.access],
    ["许可证", r.license],
    ["维护状态", r.maintenance],
  ]
    .map(([k, v]) => kv(k, v))
    .join(
      "",
    )}</section><section class="panel"><h2>版本与发布历史</h2><div class="timeline">${
    arr(r.history)
      .map((h) => `<div class="event">${esc(txt(h))}</div>`)
      .join("") || '<p class="muted">尚未建立可核实的完整版本时间线。</p>'
  }</div><h3>兼容性与搭配</h3>${list(r.compatibility || r.risks?.slice(0, 2))}</section></div>${
    r.variants?.length
      ? panel(
          "场景与观测差异",
          r.variants
            .map(
              (v) =>
                `<details><summary>${esc(v.name)}</summary><div>${Object.entries(
                  v,
                )
                  .filter(([k]) => k !== "name")
                  .map(([k, v]) => kv(k, v))
                  .join("")}</div></details>`,
            )
            .join(""),
        )
      : ""
  }${panel("数据生产：从原始输入到研究标签", productionMarkup(r)+relatedLiterature(r))}${panel(
    "公开字段与可得性",
    `<p class="callout">字段作用域：${esc(r.fieldScope || "资源系列摘要，具体场景与配置可能不同")}</p><div id="fields" class="table-wrap"><table><thead><tr><th>字段</th><th>可得性</th><th>适用范围与证据</th></tr></thead><tbody>${Object.entries(
      fieldNames,
    )
      .map(
        ([k, n]) =>
          `<tr><td>${n}</td><td class="${statusClass(r.fields?.[k] || "未知")}">${esc(r.fields?.[k] || "未知")}</td><td>${esc(r.fieldNotes?.[k] || "系列级摘要；详细条件见物理机制、任务解释与原始资料。")}${refs(sourceIds(r).slice(0, 1))}</td></tr>`,
      )
      .join("")}</tbody></table></div>`,
  )}${panel(
    "任务能力与可证明的范围",
    `<div id="tasks">${
      arr(r.tasks)
        .map(
          (t) =>
            `<details><summary>${esc(t.name)} ${tag(t.status || "条件支持")}</summary><div>${esc(t.reason)}</div></details>`,
        )
        .join("") || "<p>尚未建立具体任务协议。</p>"
    }<div class="callout">只有静态位置快照时，沿网格抽取样本不能直接证明真实移动预测能力。任务外推需单独验证。</div></div>`,
  )}${panel("物理真实性与实验陷阱", `<div id="physics">${list(r.physics)}<h3>使用前检查</h3>${list(r.risks)}</div>`)}${panel(
    "代表性文献与使用路线",
    `<div id="papers">${
      arr(r.papers)
        .map(
          (p) =>
            `<div class="source"><a href="${esc(p.url)}" target="_blank" rel="noreferrer">${esc(p.title)}</a><p>${esc(p.year)} · ${esc(p.venue || "发表渠道见原文")} ${p.doi ? ` · <a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noreferrer">DOI ${esc(p.doi)}</a>` : ""} · ${esc(p.use || p.summary)} · ${esc(p.locator || "定位见来源阅读范围")}</p></div>`,
        )
        .join("") ||
      '<p class="muted">本轮尚未收录满足实验级核验条件的近期使用论文；不据此判断研究热度。</p>'
    }<h3>使用路线</h3>${list(r.tutorial)}<a href="#tutorials">打开代码与通用实验流程 →</a></div>`,
  )}${panel(
    "资料索引与阅读范围",
    `<div id="evidence">${S.filter((s) => sourceIds(r).includes(s.id))
      .map(sourceCard)
      .join("")}</div>`,
  )}`;
}
function sourceCard(s) {
  return `<article class="source" id="${s.id}"><div>${tag(s.type || "资料", "neutral")}${tag(s.status || "阅读范围见记录", "neutral")}${tag(s.official === false ? "独立研究" : "官方 / 作者来源", "neutral")}</div><h3><a href="${esc(s.url)}" target="_blank" rel="noreferrer">${esc(s.title)} ↗</a></h3><p>实际阅读范围：${esc(txt(s.readScope))}</p><p>核验日期：${esc(s.checkedAt || "2026-11-05")} · ${esc(s.access || "网页访问；未验证原始数据下载")} · ${esc(s.linkCheck || "链接状态见实际阅读记录")}</p><div class="tiny source-url">${esc(s.url)}</div><p>${arr(
    s.resourceIds,
  )
    .map(
      (id) =>
        `<a href="#resource/${id}">${esc(R.find((r) => r.id === id)?.name || id)}</a>`,
    )
    .join(" · ")}</p></article>`;
}
function sources(id) {
  let listS = S.filter(
    (s) =>
      (!sourceFilter.q ||
        JSON.stringify(s)
          .toLowerCase()
          .includes(sourceFilter.q.toLowerCase())) &&
      (!sourceFilter.type || s.type === sourceFilter.type) &&
      (!sourceFilter.resource ||
        arr(s.resourceIds).includes(sourceFilter.resource)) &&
      (!sourceFilter.status || s.status === sourceFilter.status),
  );
  return (
    title(
      "SOURCE LIBRARY",
      "资料与证据库",
      "官方介绍、论文、文档、仓库和对比材料的统一入口。阅读状态只覆盖标注的页面、章节或文件，无法访问的材料保留核验边界。",
    ) +
    `<div class="filters row"><input id="source-q" placeholder="搜索来源、文件路径或证据…" value="${esc(sourceFilter.q)}"><select id="source-type"><option value="">所有材料类型</option>${options([...new Set(S.map((s) => s.type))], sourceFilter.type)}</select><select id="source-resource"><option value="">所有资源</option>${R.map((r) => `<option value="${r.id}" ${sourceFilter.resource === r.id ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</select><select id="source-status"><option value="">所有阅读状态</option>${options([...new Set(S.map((s) => s.status))], sourceFilter.status)}</select><button data-export="sources">导出来源 JSON</button></div><p class="count">${listS.length} 条索引 · ${S.filter((s) => /待|未知|无法|部分/.test(s.status || "")).length} 条需继续核验或仅部分阅读</p><section class="panel">${
      id
        ? S.filter((s) => s.id === id)
            .map(sourceCard)
            .join("")
        : listS.map(sourceCard).join("")
    }</section>`
  );
}
const coreIds = ["deepmimo", "sionna-rt", "quadriga", "deepsense-6g"];
let activeGoal = "beam-baseline",
  lastPlan = null;
function playbooks() {
  return ATLAS.researchPlaybooks || [];
}
function selectedBook(id = activeGoal) {
  return playbooks().find((p) => p.id === id) || playbooks()[0];
}
function goalRoute(value) {
  const legacy = {
    "Beam Selection": "beam-baseline",
    "Channel Prediction": "future-beam",
    "Cross-Frequency": "cross-frequency",
    Multimodal: "multimodal-nearfield",
    "Foundation Model": "foundation-pretrain",
    Sim2Real: "foundation-ood",
  };
  return legacy[safeDecode(value || "")] || value || activeGoal;
}
function goalOptions(id) {
  return playbooks()
    .map(
      (p) =>
        `<option value="${esc(p.id)}" ${p.id === id ? "selected" : ""}>${esc(p.title)}</option>`,
    )
    .join("");
}
function explain(value) {
  if (value == null) return "";
  if (Array.isArray(value)) return list(value);
  if (typeof value === "object")
    return Object.entries(value)
      .map(([k, v]) => kv(k, v))
      .join("");
  return `<p>${esc(value)}</p>`;
}
function coreGuide(id) {
  return ATLAS.coreGuides?.[id];
}
function coreChoices() {
  return (
    title(
      "START WITH THE EXPERIMENT",
      "四个核心资源，应该用哪一个？",
      "围绕波束管理与无线基础模型，先选你需要的实验控制与验证证据，再看数据字段。",
    ) +
    `<div class="callout"><strong>起步建议：</strong>现成路径上的波束/空间CSI基线从DeepMIMO开始；大规模时序/统计条件变化看QuaDRiGa；需要新几何、遮挡与同场景传感观测用Sionna RT；真实感知辅助波束验证选具体DeepSense Scenario。先完成一个基线，再按证据缺口加入第二来源。</div><div class="core-grid">${coreIds
      .map((id) => {
        const r = R.find((r) => r.id === id),
          g = coreGuide(id);
        return `<article class="panel core-card"><div class="eyebrow">${esc(g.entity)}</div><h2>${esc(r.name)}</h2><p class="core-promise">${esc(g.short)}</p><h3>优先选它的情况</h3><p>${esc(g.start)}</p><h3>你实际要做的工作</h3><p>${esc(g.work)}</p><h3>对波束管理</h3><p>${esc(g.beam)}</p><h3>对无线基础模型</h3><p>${esc(g.foundation)}</p><div class="callout warning">${esc(g.cannot)}</div><div class="row"><a href="#resource/${id}">详细证据 →</a><button data-select="${id}">${selected.has(id) ? "✓ 已加入对比" : "加入对比"}</button></div></article>`;
      })
      .join(
        "",
      )}</div>${panel("它们还可以构成同一条工作流", flow(["DeepMIMO已有场景 → 快速建立oracle与基线", "暴露具体几何/遮挡缺口 → Sionna受控补采", "需要覆盖速度/时空频分布 → QuaDRiGa", "需要真实观测证据 → DeepSense特定场景"]) + '<p>DeepMIMO场景也可能来自Sionna等引擎。把Sionna结果转成DeepMIMO格式只是统一接口；独立跨引擎验证要核查实际路径来源。QuaDRiGa与DeepMIMO可分别覆盖统计时序与站点空间结构，混合预训练仍要审计来源重叠和表示差异。</p><button class="primary" data-core-compare>并排比较这四个资源</button> <a class="task-tile" href="#wizard">按当前研究目标生成起步方案 →</a>')}`
  );
}
function decisionComparison(rs, book) {
  const rows = [
    ["资源的本质", "entity"],
    ["最适合先做什么", "start"],
    ["输入与输出控制", "control"],
    ["传播机制来自哪里", "physics"],
    ["做未来波束时要检查", "temporal"],
    ["RGB / LiDAR怎么来", "sensing"],
    ["对波束管理的用途", "beam"],
    ["对基础模型的用途", "foundation"],
    ["当前结果能证明到哪里", "cannot"],
    ["你要补做的工作", "work"],
  ];
  return `<div class="table-wrap"><table class="comparison decision-table"><thead><tr><th>会改变研究决策的差异</th>${rs.map((r) => `<th><a href="#resource/${r.id}">${esc(r.name)}</a></th>`).join("")}</tr></thead><tbody>${rows
    .map(
      ([label, key]) =>
        `<tr><td>${label}</td>${rs
          .map((r) => {
            const g = coreGuide(r.id),
              c = book?.candidates?.find(
                (c) => (c.resourceId || c.id) === r.id,
              );
            let value = g?.[key];
            if (!value)
              value =
                key === "entity"
                  ? r.kind
                  : key === "start"
                    ? c?.why
                    : key === "cannot"
                      ? c?.whatCannotProve
                      : key === "work"
                        ? c?.extraWork
                        : key === "beam" || key === "foundation"
                          ? c?.whatCanProve
                          : key === "physics"
                            ? r.physics
                            : key === "temporal"
                              ? r.fieldNotes?.time
                              : key === "sensing"
                                ? r.fieldNotes?.lidar
                                : key === "control"
                                  ? r.provenance
                                  : null;
            return `<td>${value ? explain(value) : '<span class="muted">该维度需按具体发布物与任务协议审查；不由字段数量推断。</span>'}</td>`;
          })
          .join("")}</tr>`,
    )
    .join(
      "",
    )}<tr><td>原始依据</td>${rs.map((r) => `<td>${refs(sourceIds(r).slice(0, 2))}</td>`).join("")}</tr></tbody></table></div>`;
}
function compare() {
  const rs = [...selected].map(id=>R.find(r=>r.id===id)).filter(Boolean), book=selectedBook();
  const technicalRows=[
    ["类型",r=>r.kind],["来源",r=>r.origin],["字段作用域",r=>r.fieldScope||"系列级摘要；见场景条件"],
    ["版本",r=>r.version],["频率",r=>r.frequency],["规模",r=>r.scale],["访问",r=>r.access],["许可",r=>r.license],
    ...Object.entries(fieldNames).map(([k,v])=>[v,r=>r.fields?.[k]||"未知"])
  ];
  const technical=`<div class="table-wrap"><table class="comparison"><thead><tr><th>技术维度</th>${rs.map(r=>`<th>${esc(r.name)}</th>`).join("")}</tr></thead><tbody>${technicalRows.map(([label,fn])=>`<tr><th scope="row">${label}</th>${rs.map(r=>`<td>${esc(txt(fn(r)))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const view = comparisonLens==='decision'?decisionComparison(rs,book):comparisonLens==='technical'?technical:productionComparison(rs,comparisonLens);
  return title("RESEARCH COMPARISON","同一个实验，用不同资源要做哪些工作？","从生产链、参数变更、研究用途和具体字段四个视角比较；每个结论连到流程与原始依据。")+
    `<div class="filters row"><label>研究目标 <select id="compare-goal">${goalOptions(activeGoal)}</select></label><select id="compare-add"><option value="">添加资源（最多4个）</option>${R.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join("")}</select><button data-export="compare-json">JSON</button><button data-export="compare-csv">CSV</button><button id="print">打印 / 保存PDF</button></div>${comparisonToolbar()}<div class="row selected-resources">${rs.map(r=>`<button data-select="${r.id}" aria-label="从对比移除${esc(r.name)}">${esc(r.name)} ×</button>`).join("")}</div>${rs.length<2?'<div class="empty">请选择2–4个资源，或点击上面的常用组合。</div>':view}${book?`<section class="panel section"><div class="eyebrow">当前研究目标 · ${esc(book.title)}</div><h2>${esc(book.question||book.summary)}</h2>${explain(book.firstExperiment)}<a href="#wizard/${book.id}">查看角色分工、最小实验和继续／停止条件 →</a></section>`:""}`;
}
function wizard(route = "") {
  activeGoal = goalRoute(route);
  let book = selectedBook(activeGoal);
  if (book) activeGoal = book.id;
  return (
    title(
      "RESEARCH DECISION DESK",
      "从一个可执行的实验开始",
      "面向波束管理与无线基础模型。先给起步主源，再说明何时值得加入第二个来源；推荐顺序是可追溯的研究设计建议。",
    ) +
    `<div class="two research-layout"><section class="panel wizard"><h2>你要验证什么？</h2><label>实验路线<select id="w-task">${goalOptions(activeGoal)}</select></label><div id="w-context"></div><details><summary>进一步限制观测与来源</summary><div><label>物理来源<select id="w-origin"><option value="">允许测量与生成</option><option value="measured">必须真实测量</option></select></label>${[
      ["csi", "必须支持复数CSI（含计算/仿真）"],
      ["crossfreq", "必须有已确认同步跨频配对"],
      ["time", "必须有时间/序列"],
      ["multibs", "必须支持多基站"],
      ["rgb", "必须支持RGB"],
      ["lidar", "必须支持LiDAR/几何扫描点云"],
    ]
      .map(
        ([key, label]) =>
          `<label><input type="checkbox" data-w="${key}"> ${label}</label>`,
      )
      .join(
        "",
      )}<label><input type="checkbox" id="w-ready"> 仅接受直接提供的字段</label><label><input type="checkbox" id="w-exact"> 真实同步3.5 → 28 GHz配对</label><p class="tiny muted">可计算与需额外仿真都是支持，但会增加构建步骤；同步配对与真实测量分别审查。</p></div></details><button id="w-run" class="primary">更新研究方案 →</button><a class="task-tile section" href="#core">还分不清DeepMIMO / Sionna / QuaDRiGa / DeepSense？先看四者怎么选 →</a></section><div id="wizard-results"></div></div>`
  );
}
function candidateCard(item, index) {
  const { candidate: c, resource: r } = item;
  const fields = item.effectiveFields || r.fields;
  return `<article class="panel section recommendation ${lastPlan.primary?.resource.id === r.id ? "primary-recommendation" : ""}"><div class="eyebrow">${lastPlan.primary?.resource.id === r.id ? "起步主源" : esc(c.role || "后续验证 / 补充")} · ${index + 1}</div><h2><a href="#resource/${r.id}">${esc(r.name)}</a></h2><p class="recommendation-why">${esc(c.why)}</p><div class="research-facts"><div><h3>它能帮你证明什么</h3>${explain(c.whatCanProve)}</div><div><h3>结论的适用边界</h3>${explain(c.whatCannotProve)}</div></div><h3>要补做的工作</h3>${explain(c.extraWork)}<p class="tiny muted">适用范围：${esc(txt(c.scope || r.fieldScope || "见具体场景"))}</p><div>${(lastPlan.constraints.needs || []).map((key) => tag(`${fieldNames[key]} · ${fields?.[key] || "未知"}`, "neutral")).join("")}</div><details><summary>查看推荐依据</summary><div>${refs(c.sourceIds || r.sourceIds)}</div></details></article>`;
}
function runWizard() {
  const book = selectedBook($("#w-task").value);
  if (!book) return;
  activeGoal = book.id;
  const constraints = {
    needs: [...document.querySelectorAll("[data-w]:checked")].map(
      (e) => e.dataset.w,
    ),
    measured: !!$("#w-origin").value,
    readyOnly: $("#w-ready").checked,
    exact: $("#w-exact").checked,
  };
  const experiment = book.id === "cross-frequency" && (constraints.measured || constraints.exact) ? book.realExperimentContract : book.experimentContract;
  const experimentSummary = experiment ? experiment.title + "。" + (experiment.primaryMetric || "") : book.firstExperiment;
  lastPlan = selectResearchPlan(R, book, constraints);
  lastPlan.experiment = experiment;
  $("#w-context").innerHTML =
    `<p class="small">${esc(book.question || book.summary || "")}</p><p class="tiny muted">这条路线先审查${book.candidates.length}个核心候选，最多推荐3个。其他资源留在扩展检索中。</p>`;
  let plan = lastPlan;
  $("#wizard-results").innerHTML =
    `<section class="panel"><div class="eyebrow">${esc(book.title)}</div><h2>${plan.primary ? "先用 " + esc(plan.primary.resource.name) + "，再按缺口补证据" : "这组硬条件下，没有已核验的起步主源"}</h2>${plan.primary ? `<p>${esc(plan.primary.candidate.why)}</p>` : "<p>现有候选可能仍可用于局部检验或后续验证，但尚不能替代本路线所需主源。不会自动放宽真实测量、同步或字段约束。</p>"}<h3>第一个最小实验</h3>${plan.primary ? (plan.primary.resource.id === book.defaultStartId ? explain(experimentSummary) : `<p>当前改用${esc(plan.primary.resource.name)}作为主源。先核验它的观测接口、样本分组和目标标签，再计算同任务oracle与简单基线；下方默认实验绑定原主源，需要替换场景与观测约定。</p>`) : "<p>先取得满足主线条件的数据或调整明确的研究结论；下方协议暂作为待执行参考。</p>"}<details><summary>展开实验步骤与继续 / 停止条件（待执行）</summary><div>${list(experiment?.steps || book.experimentSteps)}${book.successGate ? "<h3>继续条件</h3>" + explain(experiment?.successGate || book.successGate) : ""}${book.killCondition ? "<h3>停止条件</h3>" + explain(experiment?.killCondition || book.killCondition) : ""}</div></details>${plan.recommended.length >= 2 ? "<button data-plan-compare>比较本次推荐的研究角色 →</button>" : ""} <button data-export="research-plan">导出研究方案JSON</button><p class="tiny muted">研究建议基于资料特性与任务协议；没有无依据的综合分或性能排名。</p></section>${plan.recommended.map(candidateCard).join("")}${plan.moreEligible.length ? `<details><summary>这条路线的其他候选（${plan.moreEligible.length}）</summary><div>${plan.moreEligible.map((item) => candidateCard(item, 3)).join("")}</div></details>` : ""}${plan.excluded.length ? `<details class="section" open><summary>为什么这些候选没有入选？</summary><div>${plan.excluded.map((x) => `<div class="source"><h3>${esc(x.resource?.name || x.candidate.resourceId)}</h3>${list(x.missing.map((m) => (fieldNames[m.key] ? `${fieldNames[m.key]}：${m.reason.includes("：") ? m.reason.split("：").slice(1).join("：") : m.reason}` : m.reason)))}${explain(x.candidate.whatCannotProve)}</div>`).join("")}</div></details>` : ""}<details class="section"><summary>其他字段匹配资源（${plan.others.length}，尚未按本路线完成任务审查）</summary><div><p class="small muted">字段满足只是扩展检索入口；先完成上方最小实验，再决定是否值得扩大数据来源。</p>${plan.others.map((r) => `<a class="tag neutral" href="#resource/${r.id}">${esc(r.name)} ↗</a>`).join("")}</div></details>`;
}

function matrix(rs = R) {
  return `<div class="table-wrap matrix"><table><thead><tr><th>资源 / 公开观测</th>${Object.values(
    fieldNames,
  )
    .map((v) => `<th>${v}</th>`)
    .join("")}</tr></thead><tbody>${rs
    .map(
      (r) =>
        `<tr><td><a href="#resource/${r.id}">${esc(r.name)}</a></td>${Object.keys(
          fieldNames,
        )
          .map(
            (k) =>
              `<td><button class="${statusClass(r.fields?.[k] || "未知")}" data-cell="${r.id}|${k}">${esc(r.fields?.[k] || "未知")}</button></td>`,
          )
          .join("")}</tr>`,
    )
    .join("")}</tbody></table></div>`;
}
function taskMatrix() {
  let canonical =
    R.find((r) => r.tasks?.length >= 22)?.tasks.map((t) => t.name) || [];
  return `<div class="table-wrap matrix"><table><thead><tr><th>资源 / 研究任务</th>${canonical.map((t) => `<th>${esc(t)}</th>`).join("")}</tr></thead><tbody>${R.map(
    (r) =>
      `<tr><td><a href="#resource/${r.id}">${esc(r.name)}</a></td>${canonical
        .map((name) => {
          let task = r.tasks.find((t) => t.name === name);
          return `<td><button data-taskcell="${r.id}|${encodeURIComponent(name)}" class="${statusClass(task?.status || "未知")}">${esc(task?.status || "未建立协议")}</button></td>`;
        })
        .join("")}</tr>`,
  ).join("")}</tbody></table></div>`;
}
function ecology() {
  let nodes = [
    ["统计模型", 70, 50],
    ["RT 引擎", 310, 50],
    ["真实测量", 550, 50],
    ["QuaDRiGa / 38.901", 70, 150],
    ["Sionna / InSite", 310, 150],
    ["DeepSense / DICHASUS", 550, 150],
    ["DeepMIMO 场景生态", 310, 250],
    ["基础模型语料 / Benchmark", 310, 350],
  ];
  return `<svg class="diagram" viewBox="0 0 760 410" role="img" aria-label="数据来源与派生生态示意"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="#708a98"/></marker></defs>${[
    [0, 3],
    [1, 4],
    [2, 5],
    [4, 6],
    [3, 7],
    [5, 7],
    [6, 7],
  ]
    .map(
      ([a, b]) =>
        `<path class="edge" marker-end="url(#arrow)" d="M${nodes[a][1] + 80},${nodes[a][2] + 36} L${nodes[b][1] + 80},${nodes[b][2]}"><title>来源或生成关系；不代表独立物理来源</title></path>`,
    )
    .join(
      "",
    )}${nodes.map(([t, x, y]) => `<g tabindex="0"><rect class="node" x="${x}" y="${y}" width="185" height="38" rx="6"/><text x="${x + 92}" y="${y + 24}" text-anchor="middle" font-size="11">${t}</text><title>${t}：查看资源详情和来源，确认具体数据血缘。</title></g>`).join("")}</svg>`;
}
function visuals() {
  return (
    title(
      "EVIDENCE MAPS",
      "生态、能力与迁移",
      "图表用于检查研究条件。点击矩阵状态可查看解释；来源关系不等于已经完成跨数据集迁移。",
    ) +
    `<div class="two"><section class="panel"><h2>数据集生态地图</h2>${ecology()}<a href="#sources">关系来源与阅读记录 →</a></section><section class="panel"><h2>物理真实性：增加了什么观测？</h2>${[
      ["统计生成", "可控分布与大规模采样；站点几何和硬件偏差通常不直接观测。"],
      ["地图级 RT", "明确几何与路径；材料、截断和传播机制取决于配置。"],
      ["测量校准数字孪生", "用现场观测约束部分误差；校准范围外仍须验证。"],
      [
        "真实 OTA 测量",
        "包含真实传播和硬件；覆盖有限，未测动作的反事实收益通常缺失。",
      ],
    ]
      .map(([h, p]) => `<div class="source"><h3>${h}</h3><p>${p}</p></div>`)
      .join(
        "",
      )}<p class="legend">这是观测与建模关系，不是所有任务通用的单一真实性排名。</p></section></div>${panel("资源观测能力矩阵", `<p class="legend">直接提供 / 可计算 / 需额外仿真 / 不支持 / 未知。系列级摘要须结合场景条件使用。</p>${matrix()}`)}${panel("研究任务能力矩阵", taskMatrix())}${panel(
      "版本时间线",
      R.filter((r) => r.history?.length)
        .map(
          (r) =>
            `<details><summary>${esc(r.name)}</summary><div class="timeline">${r.history.map((h) => `<div class="event">${esc(txt(h))}</div>`).join("")}</div>${refs(sourceIds(r))}</details>`,
        )
        .join(""),
    )}${panel(
      "论文使用样本趋势",
      `<p class="legend">仅统计全文已读且明确实际使用数据的收录记录，按论文记录年份展示，不是全领域总量或引用次数。同一论文优先按DOI去重，缺少DOI时按URL。</p>${[
        2024, 2025, 2026,
      ]
        .map((y) => {
          let ps = [
            ...new Map(
              R.flatMap((r) => arr(r.papers))
                .filter(
                  (p) => Number(p.year) === y && p.usedForUsageTrend === true,
                )
                .map((p) => [p.doi || p.url, p]),
            ).values(),
          ];
          return `<details><summary>${y} · ${ps.length} 条已收录记录</summary><div>${ps.map((p) => `<p><a href="${esc(p.url)}">${esc(p.title)}</a> · ${esc(p.use || "用途见资源卡")}</p>`).join("") || "未完成该年度的实验级使用记录核验。"}</div></details>`;
        })
        .join("")}`,
    )}${panel("迁移兼容性检查地图", flow(["来源与场景血缘", "频率 / 带宽 / 阵列", "幅相与归一化", "输入模态与标签", "独立测试 / 部署验证"]) + '<p>共享 DeepMIMO 上游的两个数据包属于同源派生。RT 场景转为统一格式后，格式独立性不等于传播引擎独立性。跨源实验应逐项报告上述条件。</p><a href="#compare">使用并排对比检查具体候选 →</a>')}${panel("传播机制示意", `<svg class="diagram" viewBox="0 0 780 230" role="img" aria-label="直达反射绕射与散射示意"><rect x="290" y="50" width="160" height="120" class="node"/><text x="330" y="115" font-size="15">建筑</text><circle cx="80" cy="170" r="12" fill="#167d89"/><text x="55" y="205">BS</text><circle cx="690" cy="170" r="12" fill="#4463aa"/><text x="678" y="205">UE</text><path d="M90 170 L370 20 L680 170" fill="none" stroke="#167d89" stroke-width="2"/><text x="420" y="32" font-size="12">反射 / 路径几何示意</text><path d="M90 170 L290 50 L450 50 L680 170" fill="none" stroke="#a66a1d" stroke-dasharray="5"/><text x="100" y="75" font-size="12">边缘绕射取决于引擎与配置</text><path d="M90 170 L680 170" fill="none" stroke="#657688" stroke-dasharray="3"/><text x="475" y="155" font-size="12">遮挡的直达路径</text></svg><p class="legend">自绘示意，不是真实场景或 RT 输出；材料频散、透射、散射不能由这张示意图判断。</p>`)}`
  );
}
function topics() {
  return (
    title(
      "RESEARCH DOSSIERS",
      "深度研究专题",
      "围绕物理机制、信息可用性和研究结论组织证据。",
    ) +
    T.map(
      (t, i) =>
        `<section class="panel section topic"><div class="eyebrow">DOSSIER ${String.fromCharCode(65 + i)}</div><h2>${esc(t.title)}</h2>${arr(
          t.paragraphs,
        )
          .map((p) => `<p>${esc(txt(p))}</p>`)
          .join(
            "",
          )}${t.checklist ? `<div class="checklist">${t.checklist.map((x) => `<label><input type="checkbox"> ${esc(x)}</label>`).join("")}</div>` : ""}${refs(t.sourceIds || [])}${arr(
          t.sources,
        )
          .map((s) =>
            typeof s === "string"
              ? `<a class="tag neutral" href="${esc(s)}">原始资料 ↗</a>`
              : s?.url
                ? `<a class="tag neutral" href="${esc(s.url)}">${esc(s.title || "原始资料")} ↗</a>`
                : "",
          )
          .join("")}</section>`,
    ).join("")
  );
}
function tutorials() {
  return (
    title(
      "REPRODUCIBILITY CENTER",
      "教程与实验复现",
      "固定接口、检查单位、保留划分边界。没有下载原始数据；真实数据教程的本机端到端状态明确标注。",
    ) +
    U.map(
      (t, i) =>
        `<section class="panel section"><div class="eyebrow">WORKFLOW ${i + 1} · ${esc(t.status)}</div><h2>${esc(t.title)}</h2><p>${esc(t.description)}</p><div class="callout">${esc(t.environment)}</div>${list(t.steps)}<div class="row between"><span class="small muted">${esc(t.file)}</span><button data-copy="${t.id}">复制代码</button><button data-download-code="${t.id}">下载 Python</button></div><pre><code>${esc(t.code)}</code></pre>${refs(t.sourceIds || [])}</section>`,
    ).join("")
  );
}
function coverage() {
  return (
    title(
      "COVERAGE & QUALITY",
      "研究覆盖与质量检查",
      "公开核验范围与重要缺口，方便判断哪些结论可直接用于研究设计。",
    ) +
    panel(
      "覆盖说明",
      `<p>已收录 ${R.length} 个资源系列、${S.length} 条来源。软件、规范、模型、派生语料与测量数据分别标明；资源系列数不能等同于独立物理数据来源数。</p><p>当前内容基于官方网页、论文及仓库的实际阅读范围。完整仓库审计、全部历史文档、所有视频和全部近三年使用论文不在已完成核验范围内；各资源的未确认项保留为未知。</p><p>原始数据下载：0。实际数据文件可用性、体积与完整性未逐文件验证；访问成功只表示对应网页可访问。</p><p>重点遗漏：完整场景级配置审计、天气/季节长期测量、多站点同步多模态数据及严格同步 3.5→28 GHz 完整 CSI 配对仍需继续补充。</p>`,
    ) +
    panel(
      "验收结果",
      `<div id="qa">${arr(ATLAS.qa)
        .map(
          (q) =>
            `<div class="source"><h3 class="${q.status === "通过" ? "qa-pass" : "qa-limit"}">${esc(q.status)} · ${esc(q.name)}</h3><p>${esc(q.detail)}</p></div>`,
        )
        .join("")}</div>`,
    ) +
    panel(
      "研究协议检查清单",
      `<div class="checklist">${["先计算 perfect-information oracle，与强简单基线比较 headroom", "训练/测试以站点、轨迹、场景和时间分组；隔离邻近样本", "归一化仅拟合训练集；同源派生语料检查交叉污染", "当前未获取模态不进入 policy；上次特征携带 age", "统一功率、码本、观测预算；报告通信收益与开销", "真实多用户视觉必须来自共享场景；独立轨迹只能做明确的信道层拼接", "软件当前能力不追溯赋予旧数据；跨频配对核对每个频段观测", "更新资料时重新阅读来源并记录适用范围和日期"].map((x) => `<label><input type="checkbox"> ${x}</label>`).join("")}</div>`,
    ) +
    panel(
      "检索方法与查询记录",
      `<p>采用官方文档/源码、测量协议与跨频证据、基础模型语料三条独立检索线，并追踪原始论文与官方关联资源。下列是已保存的最后一轮补核验查询，初期检索未形成完整逐条日志，不能用作全领域论文数量统计。</p>${(ATLAS.searchRecords || []).map((q) => `<details><summary>${esc(q.query)}</summary><div>${esc(q.queriedAt)} · ${esc(q.method)}</div></details>`).join("")}`,
    ) +
    panel(
      "更新与分发",
      `<p>修改 data 中的结构化文件，执行 <code>npm test</code> 和 <code>npm run build</code>。静态构建嵌入数据与代码，无需后端或在线模型。</p><button data-export="all">导出知识库 JSON</button> <button data-export="sources">导出来源索引</button>`,
    )
  );
}
function download(name, data, type = "application/json") {
  let a = document.createElement("a"),
    u = URL.createObjectURL(new Blob([data], { type }));
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
function exportData(kind) {
  if (kind === "research-plan" && lastPlan) {
    const book = selectedBook(lastPlan.goal);
    download(
      "atlas-research-plan.json",
      JSON.stringify(
        {
          goal: book.title,
          question: book.question,
          constraints: lastPlan.constraints,
          firstExperiment: lastPlan.experiment || book.experimentContract,
          recommended: lastPlan.recommended.map((x) => ({
            resourceId: x.resource.id,
            ...x.candidate,
          })),
          excluded: lastPlan.excluded.map((x) => ({
            resourceId: x.resource?.id,
            missing: x.missing,
          })),
          checkedAt: ATLAS.meta.checkedAt,
        },
        null,
        2,
      ),
    );
    return;
  }
  if (kind === "sources")
    download("atlas-sources.json", JSON.stringify(S, null, 2));
  else if (kind === "all")
    download("wireless-atlas.json", JSON.stringify(ATLAS, null, 2));
  else {
    let rs = [...selected]
      .map((id) => R.find((r) => r.id === id))
      .filter(Boolean);
    if (kind.endsWith("csv")) {
      let keys = [
        "name",
        "kind",
        "origin",
        "version",
        "frequency",
        "scale",
        "license",
        ...Object.keys(fieldNames),
        ...productionDimensions.map(([key])=>key),
      ];
      let cell = (x) => '"' + txt(x).replace(/"/g, '""') + '"';
      download(
        "atlas-comparison.csv",
        "\ufeff" +
          [
            keys.map(cell).join(","),
            ...rs.map((r) =>
              keys.map((k) => cell(r.fields?.[k] ?? r[k] ?? productionValue(r,k) ?? "见具体流程")).join(","),
            ),
          ].join("\r\n"),
        "text/csv;charset=utf-8",
      );
    } else download("atlas-comparison.json", JSON.stringify(rs, null, 2));
  }
}
function render() {
  let [page, id, anchor] = location.hash.slice(1).split("/");
  page = page || "home";
  $("#nav").innerHTML = navs
    .map(
      ([k, i, t]) =>
        `<a href="#${k}" class="${page === k || (page === "resource" && k === "browse") ? "active" : ""}"><span>${i}</span>${t}</a>`,
    )
    .join("");
  $("#breadcrumb").textContent =
    "Workspace / " +
    (navs.find((n) => n[0] === page)?.[2] || "Resource detail");
  $("#app").innerHTML = (
    {
      home,
      browse,
      compare,
      core: coreChoices,
      wizard: () => wizard(id),
      resource: () => detail(id),
      sources: () => sources(id),
      visuals,
      topics,
      tutorials,
      projects: () => relatedProjectsPage(id),
      pipelines: () => pipelinesPage(id),
      library: () => libraryPage(id),
      coverage,
    }[page] || home
  )();
  if (page === "wizard") runWizard();
  $(".sidebar").classList.remove("open");
  if (anchor)
    setTimeout(() => document.getElementById(anchor)?.scrollIntoView(), 30);
  else window.scrollTo(0, 0);
}
document.addEventListener("click", async (e) => {
  let b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.fav) {
    let id = b.dataset.fav;
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    persist();
    b.textContent = favorites.has(id) ? "★" : "☆";
  }
  if (b.dataset.select) {
    let id = b.dataset.select;
    if (selected.has(id)) selected.delete(id);
    else if (selected.size < 4) selected.add(id);
    else return toast("最多同时对比 4 个资源");
    render();
  }
  if (b.dataset.export) exportData(b.dataset.export);
  if (b.dataset.comparisonLens) { comparisonLens=b.dataset.comparisonLens; render(); }
  if (b.dataset.comparePreset) {
    const preset=comparePresets.find(p=>p.id===b.dataset.comparePreset);
    selected=new Set(preset.ids.filter(id=>R.some(r=>r.id===id)));
    comparisonLens="production";
    render();
  }
  if (b.id === "print") window.print();
  if (b.id === "reset") {
    clearTimeout(debounce);
    filters = {
      q: "",
      kind: "",
      origin: "",
      field: "",
      task: "",
      fav: false,
      view: "grid",
      sort: "name",
    };
    render();
  }
  if (b.id === "view") {
    filters.view = filters.view === "grid" ? "list" : "grid";
    render();
  }
  if (b.id === "clear-compare") {
    selected.clear();
    render();
  }
  if(b.dataset.stageOpen){const [id,step]=b.dataset.stageOpen.split('|');const stage=document.getElementById('stage-'+id+'-'+step);if(stage){stage.open=true;stage.scrollIntoView({behavior:'smooth',block:'start'});}}
  if(b.dataset.pipelineExpand)document.querySelectorAll('#pipeline-'+b.dataset.pipelineExpand+' .pipeline-stage').forEach(d=>d.open=true);
  if(b.dataset.pipelineCollapse)document.querySelectorAll('#pipeline-'+b.dataset.pipelineCollapse+' .pipeline-stage').forEach(d=>d.open=false);
  if(b.dataset.pipelineExport){const r=R.find(r=>r.id===b.dataset.pipelineExport);download(r.id+'-production-pipeline.json',JSON.stringify({resourceId:r.id,name:r.name,pipeline:r.productionPipeline,sources:S.filter(x=>r.productionPipeline.stages.some(s=>s.sourceIds.includes(x.id)))},null,2));}
  if (b.id === "w-run") runWizard();
  if (b.hasAttribute("data-core-compare")) {
    selected = new Set(coreIds);
    if (location.hash === "#compare") render();
    else location.hash = "compare";
  }
  if (b.hasAttribute("data-plan-compare") && lastPlan) {
    selected = new Set(lastPlan.recommended.map((x) => x.resource.id));
    location.hash = "compare";
  }
  if (b.dataset.taskcell) {
    let [id, n] = b.dataset.taskcell.split("|"),
      r = R.find((r) => r.id === id),
      task = r.tasks.find((t) => t.name === safeDecode(n));
    $("#modal-body").innerHTML =
      `<h2>${esc(r.name)}</h2><h3>${esc(safeDecode(n))}</h3>${tag(task?.status || "未建立协议")}<p>${esc(task?.reason || "尚未完成此任务的观测与评估协议核验；不能据此判断支持或不支持。")}</p>${refs(sourceIds(r))}`;
    $("#modal").showModal();
  }
  if (b.dataset.cell) {
    let [id, k] = b.dataset.cell.split("|"),
      r = R.find((r) => r.id === id);
    $("#modal-body").innerHTML =
      `<h2>${esc(r.name)} · ${fieldNames[k]}</h2>${tag(r.fields?.[k] || "未知")}<p>${esc(r.fieldNotes?.[k] || r.fieldNotes?.general || "能力为系列级摘要；需核对具体场景与配置。")}</p>${list(r.physics)}${refs(sourceIds(r))}`;
    $("#modal").showModal();
  }
  if (b.id === "close-modal") $("#modal").close();
  if (b.dataset.copy) {
    let t = U.find((t) => t.id === b.dataset.copy);
    try {
      await navigator.clipboard.writeText(t.code);
      toast("代码已复制");
    } catch {
      toast("请在代码框中选择并复制");
    }
  }
  if (b.dataset.downloadCode) {
    let t = U.find((t) => t.id === b.dataset.downloadCode);
    download(t.file.split("/").pop(), t.code, "text/x-python");
  }
  if (b.id === "theme") {
    document.body.classList.toggle("dark");
    persist();
  }
  if (b.id === "menu") $(".sidebar").classList.toggle("open");
});
document.addEventListener("change", (e) => {
  let t = e.target;
  if(t.id==='pipeline-resource')location.hash='pipelines/'+t.value;
  if(t.id==='library-resource'){libraryFilter.resource=t.value;$('#library-results').innerHTML=libraryResults();}
  if(t.id==='library-kind'){libraryFilter.kind=t.value;$('#library-results').innerHTML=libraryResults();}
  if (
    t.id === "w-task" ||
    t.id === "w-origin" ||
    t.id === "w-ready" ||
    t.id === "w-exact" ||
    t.hasAttribute("data-w")
  )
    runWizard();
  if (t.id === "compare-goal") {
    activeGoal = t.value;
    render();
  }
  if (t.dataset.filter) {
    filters[t.dataset.filter] = t.value;
    render();
  }
  if (t.id === "favorites-only") {
    filters.fav = t.checked;
    render();
  }
  if (t.id === "compare-add" && t.value) {
    if (selected.size < 4) selected.add(t.value);
    else toast("最多 4 个资源");
    render();
  }
  if (t.id === "source-status") {
    sourceFilter.status = t.value;
    render();
  }
  if (t.id === "source-type") {
    sourceFilter.type = t.value;
    render();
  }
  if (t.id === "source-resource") {
    sourceFilter.resource = t.value;
    render();
  }
});
let debounce;
document.addEventListener("input", (e) => {
  let t = e.target;
  if(t.id==='library-search'){libraryFilter.query=t.value;$('#library-results').innerHTML=libraryResults();return;}
  if (!["browse-q", "task-q", "source-q"].includes(t.id)) return;
  clearTimeout(debounce);
  let pos = t.selectionStart;
  debounce = setTimeout(() => {
    if (t.id === "source-q") sourceFilter.q = t.value;
    else filters[t.id === "task-q" ? "task" : "q"] = t.value;
    let id = t.id;
    render();
    let n = document.getElementById(id);
    n?.focus();
    n?.setSelectionRange(pos, pos);
  }, 180);
});
window.addEventListener("hashchange", render);
render();

if (ATLAS.meta?.checkedAt)
  document.querySelector(".side-footer small").textContent =
    "资料核验 · " + ATLAS.meta.checkedAt.replaceAll("-", ".");
