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

export const CAPABILITY: Record<string, L & { group: "data" | "scenario" | "propagation" }> = {
  csi: { en: "CSI", zh: "CSI", group: "data" },
  cir: { en: "Impulse response / PDP", zh: "冲激响应 / PDP", group: "data" },
  paths: { en: "Multipath parameters", zh: "多径参数", group: "data" },
  interaction: { en: "Path interaction info", zh: "路径交互信息", group: "data" },
  power: { en: "Received power / path loss", zh: "接收功率 / 路径损耗", group: "data" },
  iq: { en: "Raw I/Q", zh: "原始 I/Q", group: "data" },
  beam_labels: { en: "Beam labels", zh: "波束标签", group: "data" },
  position: { en: "Position / GPS", zh: "位置 / GPS", group: "data" },
  geometry: { en: "3D scene geometry", zh: "三维场景几何", group: "data" },
  materials: { en: "Material parameters", zh: "材料参数", group: "data" },
  rgb: { en: "RGB images", zh: "RGB 图像", group: "data" },
  depth: { en: "Depth", zh: "深度", group: "data" },
  lidar: { en: "LiDAR", zh: "LiDAR", group: "data" },
  radar: { en: "Radar", zh: "雷达", group: "data" },
  imu: { en: "IMU", zh: "IMU", group: "data" },
  time_series: { en: "Time series", zh: "时间序列", group: "data" },
  multiuser: { en: "Multi-user", zh: "多用户", group: "data" },
  multibs: { en: "Multi-BS", zh: "多基站", group: "data" },
  crossfreq: { en: "Paired multi-band", zh: "跨频配对", group: "data" },
  near_field: { en: "Near-field", zh: "近场", group: "scenario" },
  high_mobility: { en: "High mobility", zh: "高速移动", group: "scenario" },
  dynamic_blockage: { en: "Dynamic blockage", zh: "动态遮挡", group: "scenario" },
  reflection: { en: "Specular reflection", zh: "镜面反射", group: "propagation" },
  diffraction: { en: "Diffraction", zh: "绕射", group: "propagation" },
  scattering: { en: "Diffuse scattering", zh: "漫散射", group: "propagation" },
  transmission: { en: "Transmission / refraction", zh: "透射 / 折射", group: "propagation" },
  polarization: { en: "Polarization", zh: "极化", group: "propagation" },
  em_field: { en: "Electromagnetic field", zh: "电磁场", group: "propagation" },
};
export const SUPPORT: Record<string, L> = {
  provided: { en: "Provided", zh: "直接提供" },
  derivable: { en: "Derivable", zh: "可计算" },
  simulate: { en: "Needs extra simulation", zh: "需额外仿真" },
  none: { en: "Not supported", zh: "不支持" },
  unknown: { en: "Not stated", zh: "未说明" },
};
export const CAP_GROUP: Record<string, L> = {
  data: { en: "Data and modalities", zh: "数据与模态" },
  scenario: { en: "Scenario", zh: "场景" },
  propagation: { en: "Propagation mechanisms", zh: "传播机制" },
};
