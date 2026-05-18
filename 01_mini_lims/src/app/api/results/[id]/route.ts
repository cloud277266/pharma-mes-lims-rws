import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const updateSchema = z.object({
  value: z.number().optional(),
  unit: z.string().min(1).optional(),
  testName: z.string().min(1).optional(),
  changeReason: z.string().min(1).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  // [REQ-LIMS-001] changeReason 필수 검증 — 누락 시 즉시 400 반환
  if (!body.changeReason || String(body.changeReason).trim() === "") {
    return NextResponse.json(
      { error: "변경 사유(changeReason)가 누락되었습니다" },
      { status: 400 }
    );
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { changeReason, ...updateFields } = parsed.data;

  const existing = await prisma.testResult.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return NextResponse.json({ error: "데이터를 찾을 수 없습니다" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx: Tx) => {
    const result = await tx.testResult.update({
      where: { id: Number(id) },
      data: {
        ...updateFields,
        status: "PENDING",
        approvedById: null,
      },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
      },
    });

    await tx.auditLog.create({
      data: {
        testResultId: result.id,
        action: "UPDATE",
        oldValue: { value: existing.value, unit: existing.unit, testName: existing.testName },
        newValue: updateFields,
        changeReason,
        userId: session.userId,
      },
    });

    return result;
  });

  return NextResponse.json({ result: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const changeReason = body?.changeReason?.trim();

  // [REQ-LIMS-001] 삭제도 changeReason 필수
  if (!changeReason) {
    return NextResponse.json(
      { error: "변경 사유(changeReason)가 누락되었습니다" },
      { status: 400 }
    );
  }

  const existing = await prisma.testResult.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return NextResponse.json({ error: "데이터를 찾을 수 없습니다" }, { status: 404 });
  }

  await prisma.$transaction(async (tx: Tx) => {
    await tx.auditLog.create({
      data: {
        testResultId: existing.id,
        action: "DELETE",
        oldValue: { sampleId: existing.sampleId, testName: existing.testName, value: existing.value },
        changeReason,
        userId: session.userId,
      },
    });
    await tx.testResult.delete({ where: { id: Number(id) } });
  });

  return NextResponse.json({ ok: true });
}
