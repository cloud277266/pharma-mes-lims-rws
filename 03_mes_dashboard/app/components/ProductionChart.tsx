"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ProductionDataPoint } from "../lib/mockData";

interface Props {
  data: ProductionDataPoint[];
}

export default function ProductionChart({ data }: Props) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">시간별 생산 실적</h2>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#9ca3af" }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#9ca3af" }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#ef4444" }} domain={[0, 30]} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar yAxisId="left" dataKey="target" name="목표" fill="#e0e7ff" radius={[3, 3, 0, 0]} />
          <Bar yAxisId="left" dataKey="actual" name="실적" fill="#6366f1" radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="defect" name="불량" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
