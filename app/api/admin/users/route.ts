import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!await currentAdmin()) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, email: true, name: true, role: true, createdAt: true, _count: { select: { calculations: true, supportTickets: true } } } });
  return NextResponse.json({ users });
}