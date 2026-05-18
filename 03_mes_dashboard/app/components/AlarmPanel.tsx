import { Alarm } from "../lib/mockData";

interface Props {
  alarms: Alarm[];
}

const severityConfig = {
  Critical: { bg: "bg-red-50 border-red-300", badge: "bg-red-600 text-white", icon: "🔴" },
  Warning: { bg: "bg-yellow-50 border-yellow-300", badge: "bg-yellow-500 text-white", icon: "🟡" },
  Info: { bg: "bg-blue-50 border-blue-200", badge: "bg-blue-500 text-white", icon: "🔵" },
};

export default function AlarmPanel({ alarms }: Props) {
  const active = alarms.filter(a => !a.acknowledged);
  const acked = alarms.filter(a => a.acknowledged);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">알람 현황</h2>
        {active.length > 0 && (
          <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white animate-pulse">
            미확인 {active.length}건
          </span>
        )}
      </div>
      <div className="space-y-2">
        {active.length === 0 && acked.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">활성 알람 없음</p>
        )}
        {active.map(alarm => {
          const cfg = severityConfig[alarm.severity];
          return (
            <div key={alarm.id} className={`rounded-lg border p-3 ${cfg.bg}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="text-sm">{cfg.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{alarm.message}</p>
                    <p className="text-xs text-gray-500">{alarm.equipmentName} · {alarm.timestamp}</p>
                  </div>
                </div>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${cfg.badge}`}>
                  {alarm.severity}
                </span>
              </div>
            </div>
          );
        })}
        {acked.length > 0 && (
          <>
            <p className="pt-2 text-xs font-medium text-gray-400">확인된 알람</p>
            {acked.map(alarm => (
              <div key={alarm.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 opacity-60">
                <div className="flex items-start gap-2">
                  <span className="text-sm">✓</span>
                  <div>
                    <p className="text-sm text-gray-600">{alarm.message}</p>
                    <p className="text-xs text-gray-400">{alarm.equipmentName} · {alarm.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
