# Wireless Dataset Atlas

[English](README.md) · [简体中文](README.zh-CN.md) · [网站](https://wireless-dataset-atlas.vercel.app)

[![Check](https://github.com/ooooooomygosh/wireless-dataset-atlas/actions/workflows/check.yml/badge.svg)](https://github.com/ooooooomygosh/wireless-dataset-atlas/actions/workflows/check.yml)
[![License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

面向无线通信机器学习的公开数据集与数据生成器目录。每个条目链接到数据本身、数据集论文、可用的代码，以及使用该数据集的研究。

<!-- stats:start -->
128 个数据集 · 19 类任务 · 391 篇论文
<!-- stats:end -->

## 任务

<!-- tasks:start -->
| 任务 | 数据集数 |
| --- | ---: |
| [信道建模与生成](https://wireless-dataset-atlas.vercel.app/zh/tasks/channel-modeling/) | 26 |
| [波束管理](https://wireless-dataset-atlas.vercel.app/zh/tasks/beam-management/) | 16 |
| [信道估计](https://wireless-dataset-atlas.vercel.app/zh/tasks/channel-estimation/) | 9 |
| [CSI 反馈与压缩](https://wireless-dataset-atlas.vercel.app/zh/tasks/csi-feedback/) | 5 |
| [信道预测](https://wireless-dataset-atlas.vercel.app/zh/tasks/channel-prediction/) | 5 |
| [DoA / AoA 估计](https://wireless-dataset-atlas.vercel.app/zh/tasks/doa-estimation/) | 4 |
| [定位与指纹](https://wireless-dataset-atlas.vercel.app/zh/tasks/localization/) | 23 |
| [无线电地图与路径损耗预测](https://wireless-dataset-atlas.vercel.app/zh/tasks/radio-map/) | 12 |
| [MIMO 检测与预编码](https://wireless-dataset-atlas.vercel.app/zh/tasks/mimo-detection/) | 3 |
| [调制与信号分类](https://wireless-dataset-atlas.vercel.app/zh/tasks/modulation-classification/) | 7 |
| [射频指纹与设备识别](https://wireless-dataset-atlas.vercel.app/zh/tasks/rf-fingerprinting/) | 7 |
| [频谱感知与占用](https://wireless-dataset-atlas.vercel.app/zh/tasks/spectrum-sensing/) | 10 |
| [Wi-Fi / 射频感知](https://wireless-dataset-atlas.vercel.app/zh/tasks/wireless-sensing/) | 19 |
| [通感一体与雷达](https://wireless-dataset-atlas.vercel.app/zh/tasks/isac/) | 6 |
| [多模态感知辅助通信](https://wireless-dataset-atlas.vercel.app/zh/tasks/multimodal-sensing/) | 14 |
| [智能反射面](https://wireless-dataset-atlas.vercel.app/zh/tasks/ris/) | 6 |
| [近场与超大规模 MIMO](https://wireless-dataset-atlas.vercel.app/zh/tasks/near-field/) | 3 |
| [无线基础模型](https://wireless-dataset-atlas.vercel.app/zh/tasks/foundation-model/) | 5 |
| [网络流量与 KPI](https://wireless-dataset-atlas.vercel.app/zh/tasks/network-traffic/) | 13 |
<!-- tasks:end -->

## 条目内容

发布年份、数据来源（实测、射线追踪、统计模型、仿真、基准集合）、任务、信号类型、载波频率、带宽、场景、天线配置、样本规模与数据量、许可、获取方式、官方链接，以及最近一次与来源核对的日期。来源没有给出的值不填写。

论文标题、作者、期刊会议和引用数来自 [OpenAlex](https://openalex.org)，由定时工作流每月更新。列在数据集下的研究引用其数据集论文，并发表在固定的期刊会议清单内。标题或摘要中提到该数据集的研究优先，不足时用引用数最高的非综述研究补足到三篇，规则见网站的[关于页面](https://wireless-dataset-atlas.vercel.app/zh/about/)。

## 仓库结构

```
data/datasets/*.yaml   每个数据集一个文件（数据来源）
data/tasks.yaml        任务定义，中英文
data/papers.json       论文元数据，由 scripts/papers.mjs 生成
src/                   Astro 站点（页面、组件、多语言）
scripts/               校验、论文解析、链接检查
tutorials/             DeepMIMO、Sionna RT、DeepSense 的 Python 示例
```

## 本地开发

需要 Node.js 22 及以上。

```sh
npm ci
npm run dev        # http://localhost:4321
npm test           # 结构校验、论文编号、Python 测试
npm run build      # 静态站点输出到 dist/
```

`npm test` 运行 `scripts/validate.mjs`（结构、任务编号、重复项）和 `scripts/papers.mjs --check`（所有论文编号可解析）。Python 测试需要 NumPy 2.2。

## 参与贡献

见 [CONTRIBUTING.zh-CN.md](CONTRIBUTING.zh-CN.md)。新增数据集时，创建 `data/datasets/<id>.yaml`，运行 `npm run papers` 和 `npm run used-in -- <id>`，并在 Pull Request 中附上来源链接。

## 许可

代码使用 [MIT 许可](LICENSE)，目录数据使用 CC BY 4.0。数据集与论文保留各自所有者的许可。引用方式见 [CITATION.cff](CITATION.cff)。
