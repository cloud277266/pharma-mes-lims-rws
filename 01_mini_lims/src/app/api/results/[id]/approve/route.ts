import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // [REQ-LIMS-002] CHECKER 권한만 승인 가능
  if (session.role !== "CHECKER" && session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "승인 권한이 없습니다. CHECKER 계정으로 로그인하세요." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const existing = await prisma.testResult.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return NextResponse.json({ error: "데이터를 찾을 수 없습니다" }, { status: 404 });
  }

  // [REQ-LIMS-002] Maker는 자신이 입력한 데이터를 승인할 수 없음
  if (existing.createdById === session.userId) {
    return NextResponse.json(
      { error: "본인이 입력한 데이터는 승인할 수 없습니다 (Maker-Checker 원칙)" },
      { status: 403 }
    );
  }

  if (existing.status === "APPROVED") {
    return NextResponse.json({ error: "이미 승인된 데이터입니다" }, { status: 409 });
  }

  const result = await prisma.$transaction(async (tx: Tx) => {
    const updated = await tx.testResult.update({
      where: { id: Number(id) },
      data: { status: "APPROVED", approvedById: session.userId },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        approvedBy: { select: { id: true, name: true, role: true } },
      },
    });

    await tx.auditLog.create({
      data: {
        testResultId: updated.id,
        action: "APPROVE",
        oldValue: { status: existing.status },
        newValue: { status: "APPROVED" },
        changeReason: "Checker 승인 처리",
        userId: session.userId,
      },
    });

    return updated;
  });

  return NextResponse.json({ result });
}
