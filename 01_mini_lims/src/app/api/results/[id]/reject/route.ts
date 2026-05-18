import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const schema = z.object({
  changeReason: z.string().min(1, "반려 사유를 입력하세요"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "CHECKER" && session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "반려 권한이 없습니다. CHECKER 계정으로 로그인하세요." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값 오류" },
      { status: 400 }
    );
  }

  const existing = await prisma.testResult.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return NextResponse.json({ error: "데이터를 찾을 수 없습니다" }, { status: 404 });
  }

  if (existing.createdById === session.userId) {
    return NextResponse.json(
      { error: "본인이 입력한 데이터는 반려할 수 없습니다 (Maker-Checker 원칙)" },
      { status: 403 }
    );
  }

  const result = await prisma.$transaction(async (tx: Tx) => {
    const updated = await tx.testResult.update({
      where: { id: Number(id) },
      data: { status: "REJECTED", approvedById: session.userId },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        approvedBy: { select: { id: true, name: true, role: true } },
      },
    });

    await tx.auditLog.create({
      data: {
        testResultId: updated.id,
        action: "REJECT",
        oldValue: { status: existing.status },
        newValue: { status: "REJECTED" },
        changeReason: parsed.data.changeReason,
        userId: session.userId,
      },
    });

    return updated;
  });

  return NextResponse.json({ result });
}
