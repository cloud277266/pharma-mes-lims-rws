"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

type User = { name: string; role: string };

export default function Navbar({ user }: { user: User }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const roleBadge: Record<string, string> = {
    MAKER: "bg-blue-100 text-blue-800",
    CHECKER: "bg-green-100 text-green-800",
    ADMIN: "bg-purple-100 text-purple-800",
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-gray-900 text-lg">Mini LIMS</span>
        <Link
          href="/dashboard"
          className={`text-sm ${pathname === "/dashboard" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
        >
          시험 결과
        </Link>
        <Link
          href="/dashboard/audit-logs"
          className={`text-sm ${pathname === "/dashboard/audit-logs" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
        >
          감사 추적
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleBadge[user.role] ?? "bg-gray-100 text-gray-700"}`}>
          {user.role}
        </span>
        <span className="text-sm text-gray-700">{user.name}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </nav>
  );
}
