"use client";

import { useLiveMockData } from "../hooks/useLiveMockData";
import KpiCard from "./KpiCard";
import EquipmentStatus from "./EquipmentStatus";
import WorkOrderTable from "./WorkOrderTable";
import ProductionChart from "./ProductionChart";
import AlarmPanel from "./AlarmPanel";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { equipments, workOrders, alarms, productionChart, kpis } = useLiveMockData(5000);
  const [now, setNow] = useState("");

  useEffect(() => {
    const fmt = () => new Date().toLocaleString("ko-KR", { hour12: false });
    setNow(fmt());
    const id = setInterval(() => setNow(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">MES 생산 현황 대시보드</h1>
            <p className="text-xs text-gray-400">Smart Factory Portfolio · REQ-MES-001~004</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{now}</p>
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              실시간 모니터링 (5초 주기)
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        {/* KPI 카드 */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard
            title="평균 OEE"
            value={kpis.oee}
            unit="%"
            subText={`운전 중 ${kpis.runningCount}대 기준`}
            color="blue"
          />
          <KpiCard
            title="총 생산량"
            value={kpis.totalProduced.toLocaleString()}
            unit="EA"
            subText={`목표 ${kpis.totalTarget.toLocaleString()} EA`}
            color="green"
          />
          <KpiCard
            title="불량률"
            value={kpis.defectRate}
            unit="%"
            subText="누적 생산량 기준"
            color={parseFloat(kpis.defectRate) > 0.5 ? "red" : "green"}
          />
          <KpiCard
            title="설비 알람"
            value={kpis.alarmCount}
            unit="건"
            subText={`정지 ${kpis.stoppedCount}대 포함`}
            color={kpis.alarmCount > 0 ? "red" : "green"}
          />
        </section>

        {/* 설비 현황 */}
        <EquipmentStatus equipments={equipments} />

        {/* 차트 + 알람 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProductionChart data={productionChart} />
          </div>
          <div>
            <AlarmPanel alarms={alarms} />
          </div>
        </div>

        {/* 작업지시 테이블 */}
        <WorkOrderTable workOrders={workOrders} />
      </main>
    </div>
  );
}
