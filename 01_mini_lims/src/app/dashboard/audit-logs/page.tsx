"use client";

import { useEffect, useState } from "react";

type AuditLog = {
  id: number;
  action: string;
  changeReason: string;
  oldValue: unknown;
  newValue: unknown;
  createdAt: string;
  user: { name: string; role: string };
  testResult: { id: number; sampleId: string; testName: string };
};

const ACTION_STYLE: Record<string, string> = {
  CREATE: "bg-blue-100 text-blue-800",
  UPDATE: "bg-yellow-100 text-yellow-800",
  DELETE: "bg-gray-100 text-gray-700",
  APPROVE: "bg-green-100 text-green-800",
  REJECT: "bg-red-100 text-red-800",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/audit-logs")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">감사 추적 (Audit Trail)</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          REQ-LIMS-001 — 모든 데이터 변경 이력이 자동으로 기록됩니다
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["시각", "작업", "샘플 ID", "시험 항목", "수행자", "역할", "변경 사유", "상세"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">
                  감사 로그가 없습니다
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <>
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${ACTION_STYLE[log.action] ?? "bg-gray-100 text-gray-700"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    {log.testResult.sampleId}
                  </td>
                  <td className="px-4 py-3 text-gray-800">{log.testResult.testName}</td>
                  <td className="px-4 py-3 text-gray-700">{log.user.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">{log.user.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{log.changeReason}</td>
                  <td className="px-4 py-3">
                    {(log.oldValue || log.newValue) && (
                      <button
                        onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {expanded === log.id ? "접기" : "보기"}
                      </button>
                    )}
                  </td>
                </tr>
                {expanded === log.id && (
                  <tr key={`${log.id}-detail`} className="bg-gray-50">
                    <td colSpan={8} className="px-4 py-3">
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        {log.oldValue && (
                          <div>
                            <p className="text-gray-500 mb-1 font-sans font-medium">변경 전</p>
                            <pre className="bg-red-50 rounded p-2 text-red-800 overflow-auto">
                              {JSON.stringify(log.oldValue, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.newValue && (
                          <div>
                            <p className="text-gray-500 mb-1 font-sans font-medium">변경 후</p>
                            <pre className="bg-green-50 rounded p-2 text-green-800 overflow-auto">
                              {JSON.stringify(log.newValue, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
