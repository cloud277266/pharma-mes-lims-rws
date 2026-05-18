export type EquipmentStatus = "Running" | "Stopped" | "Alarm";

export interface Equipment {
  id: string;
  name: string;
  line: string;
  status: EquipmentStatus;
  oee: number;
  runningMinutes: number;
  totalMinutes: number;
}

export interface WorkOrder {
  id: string;
  product: string;
  targetQty: number;
  producedQty: number;
  defectQty: number;
  status: "진행중" | "완료" | "대기";
  startTime: string;
  line: string;
}

export interface Alarm {
  id: string;
  equipmentId: string;
  equipmentName: string;
  message: string;
  severity: "Critical" | "Warning" | "Info";
  timestamp: string;
  acknowledged: boolean;
}

export interface ProductionDataPoint {
  hour: string;
  target: number;
  actual: number;
  defect: number;
}

export function generateMockData() {
  const equipments: Equipment[] = [
    { id: "EQ-001", name: "정제 압축기 #1", line: "LINE-A", status: "Running", oee: 87.3, runningMinutes: 480, totalMinutes: 540 },
    { id: "EQ-002", name: "정제 압축기 #2", line: "LINE-A", status: "Alarm", oee: 0, runningMinutes: 0, totalMinutes: 540 },
    { id: "EQ-003", name: "코팅기 #1", line: "LINE-B", status: "Running", oee: 91.2, runningMinutes: 510, totalMinutes: 540 },
    { id: "EQ-004", name: "블리스터 포장기", line: "LINE-B", status: "Running", oee: 83.5, runningMinutes: 470, totalMinutes: 540 },
    { id: "EQ-005", name: "충진기 #1", line: "LINE-C", status: "Stopped", oee: 0, runningMinutes: 0, totalMinutes: 540 },
    { id: "EQ-006", name: "라벨러 #1", line: "LINE-C", status: "Running", oee: 78.9, runningMinutes: 430, totalMinutes: 540 },
  ];

  const workOrders: WorkOrder[] = [
    { id: "WO-2026-001", product: "아스피린 100mg", targetQty: 10000, producedQty: 8750, defectQty: 42, status: "진행중", startTime: "08:00", line: "LINE-A" },
    { id: "WO-2026-002", product: "비타민C 500mg", targetQty: 5000, producedQty: 5000, defectQty: 18, status: "완료", startTime: "06:00", line: "LINE-B" },
    { id: "WO-2026-003", product: "오메가3 1000mg", targetQty: 8000, producedQty: 3200, defectQty: 29, status: "진행중", startTime: "10:00", line: "LINE-C" },
    { id: "WO-2026-004", product: "칼슘 250mg", targetQty: 12000, producedQty: 0, defectQty: 0, status: "대기", startTime: "14:00", line: "LINE-A" },
    { id: "WO-2026-005", product: "마그네슘 400mg", targetQty: 6000, producedQty: 0, defectQty: 0, status: "대기", startTime: "16:00", line: "LINE-B" },
  ];

  const alarms: Alarm[] = [
    { id: "ALM-001", equipmentId: "EQ-002", equipmentName: "정제 압축기 #2", message: "과전류 감지 - 즉시 점검 요망", severity: "Critical", timestamp: "10:42:15", acknowledged: false },
    { id: "ALM-002", equipmentId: "EQ-004", equipmentName: "블리스터 포장기", message: "포장재 잔량 부족 (15% 미만)", severity: "Warning", timestamp: "10:38:02", acknowledged: false },
    { id: "ALM-003", equipmentId: "EQ-006", equipmentName: "라벨러 #1", message: "라벨 인쇄 품질 저하 감지", severity: "Warning", timestamp: "10:15:44", acknowledged: true },
    { id: "ALM-004", equipmentId: "EQ-003", equipmentName: "코팅기 #1", message: "코팅 온도 정상 범위 복귀", severity: "Info", timestamp: "09:52:30", acknowledged: true },
  ];

  const productionChart: ProductionDataPoint[] = [
    { hour: "06시", target: 1000, actual: 980, defect: 5 },
    { hour: "07시", target: 1000, actual: 1020, defect: 8 },
    { hour: "08시", target: 1000, actual: 950, defect: 12 },
    { hour: "09시", target: 1000, actual: 1050, defect: 6 },
    { hour: "10시", target: 1000, actual: 890, defect: 15 },
    { hour: "11시", target: 1000, actual: 1010, defect: 7 },
    { hour: "12시", target: 1000, actual: 870, defect: 9 },
    { hour: "13시", target: 1000, actual: 1030, defect: 4 },
  ];

  return { equipments, workOrders, alarms, productionChart };
}

export function calcKpis(data: ReturnType<typeof generateMockData>) {
  const { equipments, workOrders } = data;

  const runningEqs = equipments.filter(e => e.status === "Running");
  const oee = runningEqs.length > 0
    ? runningEqs.reduce((sum, e) => sum + e.oee, 0) / runningEqs.length
    : 0;

  const totalProduced = workOrders.reduce((sum, w) => sum + w.producedQty, 0);
  const totalTarget = workOrders.reduce((sum, w) => sum + w.targetQty, 0);
  const totalDefect = workOrders.reduce((sum, w) => sum + w.defectQty, 0);
  const defectRate = totalProduced > 0 ? (totalDefect / totalProduced) * 100 : 0;

  return {
    oee: oee.toFixed(1),
    totalProduced,
    totalTarget,
    defectRate: defectRate.toFixed(2),
    runningCount: equipments.filter(e => e.status === "Running").length,
    alarmCount: equipments.filter(e => e.status === "Alarm").length,
    stoppedCount: equipments.filter(e => e.status === "Stopped").length,
  };
}
