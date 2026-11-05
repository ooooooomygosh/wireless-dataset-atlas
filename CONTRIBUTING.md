# Contributing

[简体中文](CONTRIBUTING.zh-CN.md)

## Add or fix a dataset

1. Create or edit `data/datasets/<id>.yaml`. The id is lowercase letters, digits and hyphens, and matches the file name. An existing file is the best template; the schema is in `src/schema.ts`.
2. Take every value from a source you read: the official data page, the dataset paper, or the repository. List those URLs under `sources`. Leave out optional fields that the sources do not state.
3. `paper` is the paper that introduces the dataset, as `doi:10.xxxx/yyyy` or `arxiv:NNNN.NNNNN`.
4. Write the summary in English and Chinese: one or two factual sentences about what the data contains.
5. Run:

   ```sh
   npm run papers            # resolve paper metadata
   npm run used-in -- <id>   # list studies that use the dataset
   npm test
   npm run build
   ```

6. Open a pull request and fill in the template.

## Fields

| Field | Meaning |
| --- | --- |
| `origin` | `measured`, `ray-tracing`, `statistical`, `simulation`, `benchmark` |
| `tasks` | One to three ids from `data/tasks.yaml` |
| `signals` | `csi`, `cir`, `paths`, `iq`, `spectrum`, `rssi`, `beam-power`, `pathloss`, `radar`, `rgb`, `depth`, `lidar`, `thermal`, `gps`, `imu`, `ranging`, `traffic`, `kpi` |
| `bands_ghz` | Carrier frequencies in GHz; empty when not applicable |
| `access.type` | `open` (direct download), `registration` (free account or form), `request` (contact the owners), `restricted` (paid or subscription) |

## Papers

`data/papers.json` is generated. Do not edit it by hand. To list a study that the automatic rule misses, add its DOI to `used_in` and keep it only if the study uses the dataset.

## Tasks

New tasks go in `data/tasks.yaml` with English and Chinese names and definitions.
