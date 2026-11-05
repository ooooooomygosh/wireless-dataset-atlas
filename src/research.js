/* Online research workbench: production comparisons, papers and official files. */
const productionDimensions = [
  ["entryInput", "起点：你先要准备什么"],
  ["physicalModel", "传播／采集模型来自哪里"],
  ["channelFormation", "怎样形成信道或测量记录"],
  ["artifacts", "实际得到哪些文件"],
  ["frequencyChange", "改载频：什么需要重做"],
  ["arrayChange", "改阵列／码本：什么可复用"],
  ["timeMeaning", "时间序列是怎样产生的"],
  ["blockageChange", "加入新遮挡：怎样获得证据"],
  ["costDrivers", "工作量主要花在哪里"],
  ["commonMistake", "最容易影响结论的混淆"],
];
let comparisonLens = "production";
const comparePresets = [
  {id:"core",label:"四个核心资源",ids:["deepmimo","sionna-rt","quadriga","deepsense-6g"]},
  {id:"multimodal",label:"多模态与近场",ids:["sionna-rt","multimodal-nf","raymobtime","deepsense-6g"]},
  {id:"foundation",label:"基础模型语料",ids:["lwm-corpus","wifo-corpus","contrawimae","lh-csi"]},
  {id:"evaluation",label:"基础模型评估",ids:["wavesfm-suite","cfm-bench","deepbeam","dichasus"]},
];
function productionValue(r,key) {
  if (r.productionFacts?.[key]) return r.productionFacts[key];
  const p=r.productionPipeline;
  return ({entryInput:p?.stages?.[0]?.inputs,physicalModel:r.physics,channelFormation:p?.summary,
    artifacts:p?.nativeOutputs,costDrivers:p?.reproductionNotes,commonMistake:r.risks})[key];
}
function productionComparison(rs,lens="production") {
  const keys = lens==="changes"
    ? ["frequencyChange","arrayChange","timeMeaning","blockageChange","costDrivers","commonMistake"]
    : ["entryInput","physicalModel","channelFormation","artifacts"];
  return `<div class="table-wrap"><table class="comparison decision-table production-table"><thead><tr><th>生产环节</th>${rs.map(r=>`<th><a href="#resource/${r.id}/provenance">${esc(r.name)}</a></th>`).join("")}</tr></thead><tbody>${productionDimensions.filter(([key])=>keys.includes(key)).map(([key,label])=>`<tr><th scope="row">${esc(label)}</th>${rs.map(r=>`<td>${productionValue(r,key)?explain(productionValue(r,key)):`<p class="muted">这项变更需以具体发布物的配置和重新生成协议核对。</p><a href="#resource/${r.id}/provenance">查看该资源的逐步流程 →</a>`}</td>`).join("")}</tr>`).join("")}<tr><th scope="row">流程与依据</th>${rs.map(r=>`<td><a class="task-tile" href="#resource/${r.id}/provenance">查看 ${r.productionPipeline.stages.length} 个生产步骤 →</a><details><summary>查看核验依据</summary><div>${refs(r.productionFacts?.sourceIds||r.sourceIds)}</div></details></td>`).join("")}</tr></tbody></table></div>`;
}
function comparisonToolbar() {
  return `<div class="comparison-presets"><span class="tiny muted">常用组合</span>${comparePresets.map(p=>`<button data-compare-preset="${p.id}">${esc(p.label)}</button>`).join("")}</div><div class="comparison-tabs" role="group" aria-label="对比视角">${[["production","数据怎样生产"],["changes","改参数要重做什么"],["decision","研究用途与边界"],["technical","完整技术字段"]].map(([id,label])=>`<button data-comparison-lens="${id}" aria-pressed="${comparisonLens===id}" class="${comparisonLens===id?'primary':''}">${label}</button>`).join("")}</div>`;
}
function pipelinesPage(id="deepmimo") {
  const r=R.find(r=>r.id===id)||R.find(r=>r.id==='deepmimo');
  return title("DATA PRODUCTION DESK","从原始输入到通信决策，数据怎样生产？","先确定你需要控制哪一层，再决定复用已有记录、重算信道，还是重新采集或追踪传播。")+
    `<div class="production-families">${[
      ["路径库 → 配置信道","DeepMIMO","已有路径可复用；阵列与OFDM配置形成CSI，码本和调度标签在下游计算。","deepmimo"],
      ["几何 → 传播 → 信道","Sionna RT","自行定义几何、材料和收发端；路径、阵列近似与传播机制共同决定输出。","sionna-rt"],
      ["统计场景 → 时变系数","QuaDRiGa","场景统计参数与轨迹生成空间一致的信道；适合受控统计条件变化。","quadriga"],
      ["硬件采集 → 对齐 → 样本","DeepSense","硬件和采集协议确定观测范围，CSV/序列索引连接实测功率和传感记录。","deepsense-6g"]
    ].map(([name,resource,desc,rid])=>`<a class="panel production-family ${r.id===rid?'active':''}" href="#pipelines/${rid}"><span class="eyebrow">${esc(resource)}</span><h2>${esc(name)}</h2><p>${esc(desc)}</p></a>`).join("")}</div>
    <div class="pipeline-picker"><label for="pipeline-resource">查看具体资源的完整生产链</label><select id="pipeline-resource">${R.map(x=>`<option value="${x.id}" ${x.id===r.id?'selected':''}>${esc(x.name)} · ${esc(x.origin)}</option>`).join("")}</select><a href="#compare">并排比较生产流程 →</a></div>
    <section class="panel section"><div class="row"><h2>${esc(r.name)}</h2><a href="#resource/${r.id}">资源完整资料卡 →</a></div>${productionMarkup(r)}</section>
    ${r.productionFacts?panel("修改实验条件时，哪些结果可以复用？",productionComparison([r],"changes")):""}`;
}
let libraryFilter={query:"",resource:"",kind:"all"};
function libraryPage(id) {
  libraryFilter.resource=R.some(r=>r.id===id)?id:"";
  libraryFilter.query="";
  return title("PAPERS & OFFICIAL MATERIALS","论文、官方文件与可复用材料","把来源、文件、研究用途和数据生产步骤连接起来。可直接收录的官方文件保留上游许可与署名。")+
    `<div class="filters library-filters"><label>搜索标题、内容或实验协议<input id="library-search" type="search" value="${esc(libraryFilter.query)}" placeholder="例如：码本、场景、benchmark、时序"></label><label>关联资源<select id="library-resource"><option value="">全部资源</option>${R.map(r=>`<option value="${r.id}" ${libraryFilter.resource===r.id?'selected':''}>${esc(r.name)}</option>`).join("")}</select></label><label>材料类型<select id="library-kind">${[["all","全部"],["files","仓库内官方文件"],["papers","论文与实验协议"]].map(([v,t])=>`<option value="${v}" ${libraryFilter.kind===v?'selected':''}>${t}</option>`).join("")}</select></label></div><div id="library-results">${libraryResults()}</div>`;
}
function matchesLibrary(x) {
  return (!libraryFilter.resource||x.resourceIds?.includes(libraryFilter.resource))&&
    (!libraryFilter.query||JSON.stringify(x).toLowerCase().includes(libraryFilter.query.toLowerCase()));
}
function libraryResults() {
  const materials=(ATLAS.officialMaterials||[]).filter(matchesLibrary),papers=(ATLAS.researchPapers||[]).filter(matchesLibrary).sort((a,b)=>b.year-a.year);
  const repo=ATLAS.meta.repository;
  return `<div class="row library-counts">${tag(`${materials.length} 个仓库文件`)}${tag(`${papers.length} 篇研究论文`)}<a href="${esc(repo)}/tree/main/materials" target="_blank" rel="noreferrer">GitHub 资料目录 ↗</a><a href="#sources">全部来源与阅读范围 →</a></div>`+
    (libraryFilter.kind!=="papers"?`<section class="section"><h2>官方文件：直接在仓库查阅和下载</h2><p class="muted small">每份文件标明上游版本、许可、原始地址和阅读范围。原始数据、模型权重和需要单独授权的材料通过官方入口获取。</p><div class="library-grid">${materials.length?materials.map(m=>`<article class="panel material-card"><div>${tag(m.kind)}${tag(m.license,'neutral')}</div><h3>${esc(m.title)}</h3><p>${esc(m.description||m.readScope)}</p><dl class="compact-facts"><dt>上游版本</dt><dd>${esc(m.upstreamRef)}</dd><dt>归属</dt><dd>${esc(m.attribution)}</dd></dl><div class="row"><a class="task-tile" href="${esc(repo)}/blob/main/${esc(m.filePath)}" target="_blank" rel="noreferrer">打开仓库文件 ↗</a><a href="https://raw.githubusercontent.com/ooooooomygosh/wireless-dataset-atlas/main/${esc(m.filePath)}" target="_blank" rel="noreferrer">原文件 / 下载 ↗</a></div><p class="small"><a href="${esc(m.sourceUrl)}" target="_blank" rel="noreferrer">上游原始地址 ↗</a> · <a href="${esc(m.licenseUrl)}" target="_blank" rel="noreferrer">许可依据 ↗</a></p>${resourceLinks(m.resourceIds)}<details><summary>阅读范围与收录依据</summary><div><p>${esc(m.readScope)}</p>${refs(m.sourceIds||[])}</div></details></article>`).join(""):'<div class="empty">当前条件没有匹配的仓库文件。</div>'}</div></section>`:"")+
    (libraryFilter.kind!=="files"?`<section class="section"><h2>论文：读它解决哪个实验问题</h2><div class="paper-list">${papers.length?papers.map(p=>`<article class="panel paper-card" id="paper-${p.id}"><div class="row">${tag(p.year)}${tag(p.venue,'neutral')}</div><h3><a href="${esc(p.url)}" target="_blank" rel="noreferrer">${esc(p.title)} ↗</a></h3><dl class="paper-facts">${[["system","系统与数据"],["predictionTarget","学习／预测对象"],["decisionTarget","最终决策或任务"],["protocol","构建与评估协议"],["keyFinding","已读材料提供的证据"],["remainingGap","用于你的研究时还缺什么"]].map(([key,label])=>`<dt>${label}</dt><dd>${explain(p[key])}</dd>`).join("")}</dl><div class="row"><a href="${esc(p.url)}" target="_blank" rel="noreferrer">论文原文 ↗</a>${p.codeUrl?`<a href="${esc(p.codeUrl)}" target="_blank" rel="noreferrer">官方代码 / 数据 ↗</a>`:""}</div>${resourceLinks(p.resourceIds)}<details><summary>实际阅读范围与出处</summary><div><p>${esc(p.readScope)}</p>${refs(p.sourceIds||[])}</div></details></article>`).join(""):'<div class="empty">当前条件没有匹配的论文。</div>'}</div></section>`:"");
}
function resourceLinks(ids=[]) {
  return `<p class="resource-links">${ids.map(id=>`<a href="#resource/${id}/provenance">${esc(R.find(r=>r.id===id)?.name||id)} · 生产流程 →</a>`).join(" ")}</p>`;
}
function relatedLiterature(resource) {
  const papers=(ATLAS.researchPapers||[]).filter(p=>p.resourceIds?.includes(resource.id));
  const materials=(ATLAS.officialMaterials||[]).filter(p=>p.resourceIds?.includes(resource.id));
  if(!papers.length&&!materials.length)return "";
  return `<div class="section"><h3>关联论文与仓库内官方材料</h3>${papers.map(p=>`<p><a href="#library/${resource.id}/paper-${p.id}">${esc(p.title)} →</a></p>`).join("")}${materials.map(m=>`<p><a href="${esc(ATLAS.meta.repository)}/blob/main/${esc(m.filePath)}" target="_blank" rel="noreferrer">${esc(m.title)} ↗</a><span class="tiny muted"> · ${esc(m.license)}</span></p>`).join("")}<a href="#library/${resource.id}">按此资源浏览论文和官方文件 →</a></div>`;
}
