"use client";

import { useEffect, useState } from "react";
import { generateMockData, calcKpis } from "../lib/mockData";

function jitter(base: number, maxDelta: number) {
  return +(base + (Math.random() * 2 - 1) * maxDelta).toFixed(1);
}

export function useLiveMockData(intervalMs = 5000) {
  const [data, setData] = useState(() => {
    const raw = generateMockData();
    return { ...raw, kpis: calcKpis(raw) };
  });

  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => {
        const equipments = prev.equipments.map(eq => ({
          ...eq,
          oee: eq.status === "Running" ? Math.min(99, Math.max(60, jitter(eq.oee, 1.5))) : eq.oee,
        }));

        const productionChart = prev.productionChart.map(pt => ({
          ...pt,
          actual: Math.max(800, Math.min(1100, jitter(pt.actual, 30))),
          defect: Math.max(0, Math.min(25, jitter(pt.defect, 3))),
        }));

        const workOrders = prev.workOrders.map(wo => {
          if (wo.status !== "진행중") return wo;
          const increment = Math.floor(Math.random() * 30 + 10);
          const producedQty = Math.min(wo.targetQty, wo.producedQty + increment);
          return {
            ...wo,
            producedQty,
            status: (producedQty >= wo.targetQty ? "완료" : "진행중") as typeof wo.status,
          };
        });

        const next = { equipments, workOrders, alarms: prev.alarms, productionChart };
        return { ...next, kpis: calcKpis(next) };
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);

  return data;
}
