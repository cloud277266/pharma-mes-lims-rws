import { Equipment } from "../lib/mockData";

interface Props {
  equipments: Equipment[];
}

const statusConfig = {
  Running: { label: "Running", dot: "bg-green-500", badge: "bg-green-100 text-green-800", ring: "ring-green-200" },
  Stopped: { label: "Stopped", dot: "bg-gray-400", badge: "bg-gray-100 text-gray-700", ring: "ring-gray-200" },
  Alarm: { label: "Alarm", dot: "bg-red-500 animate-pulse", badge: "bg-red-100 text-red-800", ring: "ring-red-300" },
};

export default function EquipmentStatus({ equipments }: Props) {
  const lines = Array.from(new Set(equipments.map(e => e.line))).sort();

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">설비 현황</h2>
      <div className="space-y-5">
        {lines.map(line => (
          <div key={line}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{line}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {equipments.filter(e => e.line === line).map(eq => {
                const cfg = statusConfig[eq.status];
                return (
                  <div key={eq.id} className={`rounded-lg border p-3 ring-2 ${cfg.ring}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{eq.name}</span>
                      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="mt-2">
                      {eq.status !== "Stopped" && eq.status !== "Alarm" ? (
                        <>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>OEE</span>
                            <span className="font-semibold text-gray-700">{eq.oee}%</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                            <div
                              className="h-1.5 rounded-full bg-green-500"
                              style={{ width: `${eq.oee}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-gray-400">
                          {eq.status === "Alarm" ? "⚠ 알람 발생 — 운전 중단" : "— 가동 중지 —"}
                        </p>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{eq.id}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
