type L = { en: string; zh: string };

export const ORIGIN: Record<string, L> = {
  measured: { en: "Measured", zh: "实测" },
  "ray-tracing": { en: "Ray tracing", zh: "射线追踪" },
  statistical: { en: "Statistical model", zh: "统计模型" },
  simulation: { en: "Simulation", zh: "仿真" },
  benchmark: { en: "Benchmark suite", zh: "基准集合" },
};
export const SIGNAL: Record<string, L> = {
  csi: { en: "CSI", zh: "CSI" },
  cir: { en: "CIR", zh: "CIR" },
  paths: { en: "Multipath parameters", zh: "多径参数" },
  iq: { en: "I/Q samples", zh: "I/Q 样本" },
  spectrum: { en: "Spectrum / PSD", zh: "频谱 / PSD" },
  rssi: { en: "RSSI", zh: "RSSI" },
  "beam-power": { en: "Beam power", zh: "波束功率" },
  pathloss: { en: "Path loss", zh: "路径损耗" },
  radar: { en: "Radar", zh: "雷达" },
  rgb: { en: "RGB", zh: "RGB" },
  depth: { en: "Depth", zh: "深度" },
  lidar: { en: "LiDAR", zh: "LiDAR" },
  thermal: { en: "Thermal", zh: "热成像" },
  gps: { en: "GPS", zh: "GPS" },
  ranging: { en: "Ranging (ToA/TDoA)", zh: "测距（ToA/TDoA）" },
  imu: { en: "IMU", zh: "IMU" },
  traffic: { en: "Traffic", zh: "流量" },
  kpi: { en: "Network KPI", zh: "网络 KPI" },
};
export const ENVIRONMENT: Record<string, L> = {
  indoor: { en: "Indoor", zh: "室内" },
  outdoor: { en: "Outdoor", zh: "室外" },
  "outdoor-urban": { en: "Urban outdoor", zh: "城市室外" },
  "outdoor-suburban": { en: "Suburban outdoor", zh: "郊区室外" },
  rural: { en: "Rural", zh: "乡村" },
  vehicular: { en: "Vehicular", zh: "车载" },
  uav: { en: "UAV", zh: "无人机" },
  industrial: { en: "Industrial", zh: "工业" },
  lab: { en: "Laboratory", zh: "实验室" },
  satellite: { en: "Satellite", zh: "卫星" },
};
export const ACCESS: Record<string, L> = {
  open: { en: "Open", zh: "公开下载" },
  registration: { en: "Registration", zh: "注册后下载" },
  request: { en: "On request", zh: "申请获取" },
  restricted: { en: "Restricted", zh: "受限" },
};
export const ARRAY: Record<string, L> = {
  ula: { en: "ULA", zh: "ULA" },
  upa: { en: "UPA", zh: "UPA" },
  distributed: { en: "Distributed", zh: "分布式" },
  single: { en: "Single antenna", zh: "单天线" },
  other: { en: "Other", zh: "其他" },
};
export const BAND: Record<string, L> = {
  sub7: { en: "Below 7.125 GHz", zh: "7.125 GHz 以下" },
  mid: { en: "7.125–24 GHz", zh: "7.125–24 GHz" },
  mmwave: { en: "mmWave, 24–100 GHz", zh: "毫米波，24–100 GHz" },
  subthz: { en: "Above 100 GHz", zh: "100 GHz 以上" },
};

export function bandClass(ghz: number): string {
  if (ghz < 7.125) return "sub7";
  if (ghz < 24) return "mid";
  if (ghz <= 100) return "mmwave";
  return "subthz";
}
