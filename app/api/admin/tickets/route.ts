import { NextRequest, NextResponse } from "next/server";
import { currentAdmin } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { SUPPORT_CATEGORIES } from "@/lib/support-validation";

const statuses = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"] as const;

export async function GET(request: NextRequest) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const statusParam = request.nextUrl.searchParams.get("status");
  const categoryParam = request.nextUrl.searchParams.get("category");
  const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, 160);
  const status = statuses.find(value => value === statusParam);
  const category = SUPPORT_CATEGORIES.find(value => value === categoryParam);
  const tickets = await prisma.supportTicket.findMany({
    where: { ...(status ? { status } : {}), ...(category ? { category } : {}), ...(query ? { OR: [{ subject: { contains: query, mode: "insensitive" as const } }, { reference: { contains: query, mode: "insensitive" as const } }, { user: { email: { contains: query, mode: "insensitive" as const } } }] } : {}) },
    orderBy: { lastActivityAt: "desc" },
    take: 100,
    select: { id: true, reference: true, category: true, subject: true, status: true, aiEnabled: true, createdAt: true, lastActivityAt: true, escalatedAt: true, user: { select: { id: true, name: true, email: true } }, assignee: { select: { id: true, name: true, email: true } }, _count: { select: { messages: true } } },
  });
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, orderBy: { email: "asc" }, select: { id: true, name: true, email: true } });
  return NextResponse.json({ tickets, admins });
}