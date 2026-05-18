"use client";

import { useEffect, useState, useCallback } from "react";

type User = { id: number; name: string; role: string };
type TestResult = {
  id: number;
  sampleId: string;
  testName: string;
  value: number;
  unit: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  createdBy: User;
  approvedBy: User | null;
};
type Me = { id: number; name: string; role: string };

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
};

export default function DashboardPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sampleId: "", testName: "", value: "", unit: "" });
  const [editTarget, setEditTarget] = useState<TestResult | null>(null);
  const [editForm, setEditForm] = useState({ value: "", changeReason: "" });
  const [rejectTarget, setRejectTarget] = useState<TestResult | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    const [resR, resMe] = await Promise.all([
      fetch("/api/results"),
      fetch("/api/auth/me"),
    ]);
    const { results } = await resR.json();
    const { user } = await resMe.json();
    setResults(results);
    setMe(user);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, value: Number(form.value) }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setForm({ sampleId: "", testName: "", value: "", unit: "" });
    setShowForm(false);
    setLoading(false);
    fetchData();
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setError(""); setLoading(true);
    const res = await fetch(`/api/results/${editTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: Number(editForm.value), changeReason: editForm.changeReason }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setEditTarget(null);
    setLoading(false);
    fetchData();
  }

  async function handleApprove(id: number) {
    setError("");
    const res = await fetch(`/api/results/${id}/approve`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    fetchData();
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectTarget) return;
    setError(""); setLoading(true);
    const res = await fetch(`/api/results/${rejectTarget.id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changeReason: rejectReason }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setRejectTarget(null);
    setRejectReason("");
    setLoading(false);
    fetchData();
  }

  const isChecker = me?.role === "CHECKER" || me?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">시험 결과 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">REQ-LIMS-001 Audit Trail · REQ-LIMS-002 Maker-Checker</p>
        </div>
        {!isChecker && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            + 결과 입력
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* 결과 입력 폼 */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">신규 시험 결과 입력</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">샘플 ID</label>
              <input required value={form.sampleId} onChange={e => setForm({ ...form, sampleId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예) SAMPLE-001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">시험 항목</label>
              <input required value={form.testName} onChange={e => setForm({ ...form, testName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예) pH 측정" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">측정값</label>
              <input required type="number" step="any" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예) 7.2" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">단위</label>
              <input required value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예) pH" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2">취소</button>
            <button type="submit" disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50">
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      )}

      {/* 결과 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["샘플 ID", "시험 항목", "측정값", "상태", "입력자", "승인자", "입력일시", "작업"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">데이터가 없습니다</td></tr>
            )}
            {results.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.sampleId}</td>
                <td className="px-4 py-3 text-gray-800">{r.testName}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{r.value} <span className="text-gray-400 font-normal">{r.unit}</span></td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLE[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.createdBy.name}</td>
                <td className="px-4 py-3 text-gray-600">{r.approvedBy?.name ?? "-"}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.createdAt).toLocaleString("ko-KR")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {/* Maker: 본인 데이터 수정 (PENDING만) */}
                    {!isChecker && r.createdBy.id === me?.id && r.status === "PENDING" && (
                      <button onClick={() => { setEditTarget(r); setEditForm({ value: String(r.value), changeReason: "" }); }}
                        className="text-xs text-blue-600 hover:underline">수정</button>
                    )}
                    {/* Checker: 타인 데이터 승인/반려 (PENDING만) */}
                    {isChecker && r.createdBy.id !== me?.id && r.status === "PENDING" && (
                      <>
                        <button onClick={() => handleApprove(r.id)}
                          className="text-xs text-green-600 hover:underline">승인</button>
                        <button onClick={() => setRejectTarget(r)}
                          className="text-xs text-red-600 hover:underline">반려</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 수정 모달 */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleUpdate} className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="font-semibold text-gray-900">시험 결과 수정</h2>
            <p className="text-sm text-gray-500">{editTarget.sampleId} — {editTarget.testName}</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">새 측정값 ({editTarget.unit})</label>
              <input required type="number" step="any" value={editForm.value}
                onChange={e => setEditForm({ ...editForm, value: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                변경 사유 <span className="text-red-500">* (필수 — REQ-LIMS-001)</span>
              </label>
              <textarea required value={editForm.changeReason}
                onChange={e => setEditForm({ ...editForm, changeReason: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="변경 사유를 반드시 입력하세요" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditTarget(null)}
                className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2">취소</button>
              <button type="submit" disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50">
                {loading ? "저장 중..." : "저장"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 반려 모달 */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleReject} className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="font-semibold text-gray-900">반려 처리</h2>
            <p className="text-sm text-gray-500">{rejectTarget.sampleId} — {rejectTarget.testName}</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                반려 사유 <span className="text-red-500">* (필수)</span>
              </label>
              <textarea required value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="반려 사유를 입력하세요" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setRejectTarget(null)}
                className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2">취소</button>
              <button type="submit" disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50">
                {loading ? "처리 중..." : "반려"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
