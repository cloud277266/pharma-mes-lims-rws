import { WorkOrder } from "../lib/mockData";

interface Props {
  workOrders: WorkOrder[];
}

const statusStyle: Record<WorkOrder["status"], string> = {
  "진행중": "bg-blue-100 text-blue-800",
  "완료": "bg-green-100 text-green-800",
  "대기": "bg-gray-100 text-gray-600",
};

export default function WorkOrderTable({ workOrders }: Props) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">작업지시 현황</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
              <th className="pb-2 font-medium">작업지시 번호</th>
              <th className="pb-2 font-medium">제품명</th>
              <th className="pb-2 font-medium">라인</th>
              <th className="pb-2 font-medium">시작</th>
              <th className="pb-2 font-medium text-right">목표</th>
              <th className="pb-2 font-medium text-right">생산</th>
              <th className="pb-2 font-medium text-right">불량</th>
              <th className="pb-2 font-medium text-center">진행률</th>
              <th className="pb-2 font-medium text-center">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {workOrders.map(wo => {
              const progress = wo.targetQty > 0 ? (wo.producedQty / wo.targetQty) * 100 : 0;
              const defectRate = wo.producedQty > 0 ? ((wo.defectQty / wo.producedQty) * 100).toFixed(1) : "0.0";
              return (
                <tr key={wo.id} className="text-gray-700 hover:bg-gray-50">
                  <td className="py-2.5 font-mono text-xs text-gray-500">{wo.id}</td>
                  <td className="py-2.5 font-medium">{wo.product}</td>
                  <td className="py-2.5 text-gray-500">{wo.line}</td>
                  <td className="py-2.5 text-gray-500">{wo.startTime}</td>
                  <td className="py-2.5 text-right">{wo.targetQty.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-medium">{wo.producedQty.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-red-600">{wo.defectQty} <span className="text-xs text-gray-400">({defectRate}%)</span></td>
                  <td className="py-2.5">
                    <div className="mx-auto w-24">
                      <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100">
                        <div
                          className={`h-1.5 rounded-full ${progress >= 100 ? "bg-green-500" : "bg-blue-500"}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[wo.status]}`}>
                      {wo.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
