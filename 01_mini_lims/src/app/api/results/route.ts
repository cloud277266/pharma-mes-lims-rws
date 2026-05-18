import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const createSchema = z.object({
  sampleId: z.string().min(1, "샘플 ID를 입력하세요"),
  testName: z.string().min(1, "시험 항목을 입력하세요"),
  value: z.number(),
  unit: z.string().min(1, "단위를 입력하세요"),
});

export async function GET() {
  const results = await prisma.testResult.findMany({
    include: {
      createdBy: { select: { id: true, name: true, role: true } },
      approvedBy: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ results });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { sampleId, testName, value, unit } = parsed.data;

  const result = await prisma.testResult.create({
    data: {
      sampleId,
      testName,
      value,
      unit,
      createdById: session.userId,
      auditLogs: {
        create: {
          action: "CREATE",
          newValue: { sampleId, testName, value, unit },
          changeReason: "최초 데이터 입력",
          userId: session.userId,
        },
      },
    },
    include: {
      createdBy: { select: { id: true, name: true, role: true } },
    },
  });

  return NextResponse.json({ result }, { status: 201 });
}
