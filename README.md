# Wireless Dataset Atlas

[在线网站](https://wireless-dataset-atlas.vercel.app) · [数据生产工作台](https://wireless-dataset-atlas.vercel.app/#pipelines) · [对比实验室](https://wireless-dataset-atlas.vercel.app/#compare) · [论文与官方材料](https://wireless-dataset-atlas.vercel.app/#library)

面向波束管理与无线基础模型的在线研究知识库。资源卡将原始观测、数据生产流程、实验控制能力和研究结论连接到官方材料，帮助决定主数据源、验证源和需要补做的工作。

## 从实验问题进入

- **数据怎样生产**：逐步查看输入、操作、输出、配置、复现检查与依据；点击阶段可跳转，流程支持JSON导出。
- **不同资源怎样比较**：切换生产链、参数变更、研究用途和完整字段四个视角。区分改RF载频、改基带采样、改阵列、换码本、Doppler演化与移动遮挡。
- **先用哪个资源**：6条研究路线给出少量主源／补充／验证建议、最小实验和继续／停止条件。
- **读什么、下载什么**：论文卡列出系统、学习对象、最终决策、评估协议及阅读定位；[官方材料目录](materials/README.md)保存可再分发的原文件与许可。

DeepMIMO、Sionna RT、QuaDRiGa和DeepSense的流程与变更规则单独核验。软件支持、具体场景启用的机制、发布文件已有的字段分别记录。资源系列数、派生语料数和独立物理来源数采用各自口径。

## 本地开发与验证

需要Node.js 22+、Python 3.12；科学计算测试使用NumPy，完整结构验证使用jsonschema。前端使用原生HTML/CSS/JavaScript。

```sh
python3 -m pip install numpy==2.2.6 jsonschema==4.25.1
npm test
python3 scripts/validate_schema.py
npm run build
npm run serve
```

预览地址为 `http://localhost:8765`。源文件在 `src/`，`data/atlas.json` 是内容唯一来源；构建生成 `dist/index.html`、根目录HTML、BibTeX来源索引及材料目录。直接修改源文件和结构化数据，再构建。

## 内容与材料维护

1. 阅读官方论文、文档或固定版本源码，记录实际范围与定位。
2. 更新资源的字段、生产步骤、参数变更规则和关联来源；按具体版本／Scenario限定结论。
3. 新增论文时填写输入、预测对象、决策目标、评估协议与尚需验证的研究问题。新增派生数据时说明上游来源和划分，合并预印本与正式版本。
4. 将许可允许再分发的文件放进 `materials/official/<resource>/`，保留完整LICENSE／NOTICE和归属；在 `officialMaterials` 记录原URL、版本、文件路径、许可和阅读范围。其他材料使用官方链接。
5. 运行检查与构建，验证涉及的网页交互，然后提交PR。数据、模型权重和私人阅读缓存使用各自存储入口；`materials/local-reading/` 不提交。

数据结构定义在 [data/schema.json](data/schema.json)。新增资源、来源、论文、材料与项目使用稳定ID关联。来源索引保留阅读层级和访问状态；网页可访问、字段说明核验、实际数据实验采用不同验证状态。

## 教程与验证范围

`tutorials/` 包含DeepMIMO、Sionna RT、DeepSense解析、跨频配对、分组划分、通信基线和几何扫描点云示例。Sionna RT 2.2.0内置街谷的CFR与几何扫描检查已在Apple Silicon Metal后端运行；原始DeepMIMO／DeepSense数据端到端实验未运行。源码核验和未执行的研究建议在页面中分别标明。

完整环境锁文件为 `tutorials/requirements-macos-py312.lock.txt`。DeepMIMO4.0.5要求NumPy<2.3，本项目共用验证环境使用2.2.6。详细检查结果见 [QUALITY.md](QUALITY.md)。

## 发布与协作

Vercel关联本仓库 `main` 分支，推送后运行 `node scripts/build.mjs` 并部署 `dist/`。GitHub Actions检查数据契约、科学计算、JSON Schema与构建。

通过 [Issues](https://github.com/ooooooomygosh/wireless-dataset-atlas/issues) 提交新来源、字段修正或复现问题；欢迎PR补充材料与协议。提交时附原始依据、适用版本和阅读范围。

项目代码与原创内容使用 [MIT](LICENSE)。`materials/official/` 下的第三方文件保留各自许可，见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
