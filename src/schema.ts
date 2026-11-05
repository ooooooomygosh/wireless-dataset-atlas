import { z } from "zod";

export const ORIGINS = ["measured", "ray-tracing", "statistical", "simulation", "benchmark"] as const;
export const SIGNALS = [
  "csi", "cir", "paths", "iq", "spectrum", "rssi", "beam-power", "pathloss", "radar",
  "rgb", "depth", "lidar", "thermal", "gps", "imu", "ranging", "traffic", "kpi",
] as const;
export const ENVIRONMENTS = [
  "indoor", "outdoor", "outdoor-urban", "outdoor-suburban", "rural", "vehicular",
  "uav", "industrial", "lab", "satellite",
] as const;
export const ACCESS = ["open", "registration", "request", "restricted"] as const;
export const ARRAYS = ["ula", "upa", "distributed", "single", "other"] as const;

const bilingual = z.object({ en: z.string().min(10), zh: z.string().min(4) });
const paperId = z.string().regex(/^(doi:10\.\S+|arxiv:\d{4}\.\d{4,5}|arxiv:[a-z-]+\/\d{7})$/i, "use doi:10.x/y or arxiv:NNNN.NNNNN");

export const datasetSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  name: z.string(),
  aliases: z.array(z.string()).default([]),
  year: z.number().int().min(1990).max(2030),
  organization: z.string().optional(),
  origin: z.enum(ORIGINS),
  tasks: z.array(z.string()).min(1),
  signals: z.array(z.enum(SIGNALS)).min(1),
  bands_ghz: z.array(z.number().positive()).default([]),
  bandwidth_mhz: z.number().positive().optional(),
  environment: z.array(z.enum(ENVIRONMENTS)).default([]),
  antennas: z
    .object({
      tx: z.number().int().positive().optional(),
      rx: z.number().int().positive().optional(),
      array: z.enum(ARRAYS).optional(),
    })
    .optional(),
  subcarriers: z.number().int().positive().optional(),
  samples: z.string().optional(),
  size_gb: z.number().positive().optional(),
  format: z.string().optional(),
  mobility: z.string().optional(),
  standard: z.string().optional(),
  license: z.string(),
  access: z.object({ url: z.url(), type: z.enum(ACCESS) }),
  code: z.array(z.url()).default([]),
  paper: paperId,
  used_in: z.array(paperId).default([]),
  citing: z.array(paperId).default([]),
  summary: bilingual,
  sources: z.array(z.url()).default([]),
  checked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type Dataset = z.infer<typeof datasetSchema>;

export const taskSchema = z.object({
  id: z.string(),
  name: bilingual,
  definition: bilingual,
  inputs: z.array(z.string()),
  labels: z.array(z.string()),
  metrics: z.array(z.string()),
});
export type Task = z.infer<typeof taskSchema>;
