# 参与贡献

[English](CONTRIBUTING.md)

## 新增或修正数据集

1. 创建或编辑 `data/datasets/<id>.yaml`。id 由小写字母、数字和连字符组成，与文件名一致。可参考已有文件，结构定义见 `src/schema.ts`。
2. 每个取值都来自你读过的来源：官方数据页面、数据集论文或代码仓库，并把这些链接写入 `sources`。来源没有给出的可选字段不要填写。
3. `paper` 填写介绍该数据集的论文，格式为 `doi:10.xxxx/yyyy` 或 `arxiv:NNNN.NNNNN`。
4. 用中英文各写一段摘要：一到两句话，只描述数据内容。
5. 运行：

   ```sh
   npm run papers            # 解析论文元数据
   npm run used-in -- <id>   # 列出使用该数据集的研究
   npm test
   npm run build
   ```

6. 提交 Pull Request 并按模板填写。

## 详细字段

除必填字段外，记录还可以包含 `overview`（详细简介）、`signal_details`（各信号的采集方式）、`pipeline`（从来源到标签的有序阶段，每阶段含输入、输出和检查项）、`facts`、`variants`、`limitations`、`history` 和 `usage`。每段文字都是 `en` 与 `zh` 一对，每条陈述都必须有来源。来源没有说明的字段不要填写。

## 字段

| 字段 | 含义 |
| --- | --- |
| `origin` | `measured`、`ray-tracing`、`statistical`、`simulation`、`benchmark` |
| `tasks` | 取自 `data/tasks.yaml` 的一到三个 id |
| `signals` | `csi`、`cir`、`paths`、`iq`、`spectrum`、`rssi`、`beam-power`、`pathloss`、`radar`、`rgb`、`depth`、`lidar`、`thermal`、`gps`、`imu`、`ranging`、`traffic`、`kpi` |
| `bands_ghz` | 载波频率（GHz）；不适用时留空 |
| `access.type` | `open`（直接下载）、`registration`（免费账号或表单）、`request`（联系所有者）、`restricted`（付费或订阅） |

## 论文

`data/papers.json` 由脚本生成，请勿手动编辑。自动规则漏掉的研究，可把 DOI 加入 `used_in`，前提是该研究确实使用了该数据集。

## 任务

新增任务写入 `data/tasks.yaml`，同时提供中英文名称和定义。
