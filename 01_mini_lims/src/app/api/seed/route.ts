import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST() {
  const count = await prisma.user.count();
  if (count > 0) {
    return NextResponse.json({ message: "이미 초기 데이터가 존재합니다" });
  }

  const hashed = (pw: string) => bcrypt.hash(pw, 10);

  const [maker, checker, admin] = await Promise.all([
    prisma.user.create({
      data: {
        username: "maker01",
        password: await hashed("maker1234"),
        name: "김시험 (Maker)",
        role: "MAKER",
      },
    }),
    prisma.user.create({
      data: {
        username: "checker01",
        password: await hashed("checker1234"),
        name: "이승인 (Checker)",
        role: "CHECKER",
      },
    }),
    prisma.user.create({
      data: {
        username: "admin",
        password: await hashed("admin1234"),
        name: "관리자",
        role: "ADMIN",
      },
    }),
  ]);

  return NextResponse.json({
    message: "초기 계정 생성 완료",
    users: [maker, checker, admin].map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
    })),
  });
}
