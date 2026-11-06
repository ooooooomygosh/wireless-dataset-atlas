import type { Dataset } from "../schema.ts";

// A coarse `signals` entry counts as direct provision for the capability it names.
const FROM_SIGNAL: Record<string, string> = {
  csi: "csi", cir: "cir", paths: "paths", iq: "iq", radar: "radar", rgb: "rgb", depth: "depth", lidar: "lidar", imu: "imu",
  gps: "position", rssi: "power", "beam-power": "power", pathloss: "power",
};

export const status = (d: Dataset, key: string) => d.capabilities.find((c) => c.key === key)?.status;

/** Delivered with the release (capability matrix or signal list). */
export const provided = (d: Dataset, key: string) =>
  status(d, key) === "provided" || d.signals.some((s) => FROM_SIGNAL[s] === key);

/** Provided, computable from what is provided, or produced by re-running the generator or an added simulation module. */
export const obtainable = (d: Dataset, key: string) =>
  provided(d, key) || status(d, key) === "derivable" || status(d, key) === "simulate";

export const hasSignal = (d: Dataset, s: string) => d.signals.includes(s as never);
