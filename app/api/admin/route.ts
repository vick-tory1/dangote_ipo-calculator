import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });

  const [users, openTickets, inProgressTickets, waitingTickets, resolvedTickets, recentUsers, recentTickets] = await Promise.all([
    prisma.user.count(),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.supportTicket.count({ where: { status: "WAITING_FOR_CUSTOMER" } }),
    prisma.supportTicket.count({ where: { status: "RESOLVED" } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.supportTicket.findMany({ orderBy: { lastActivityAt: "desc" }, take: 8, select: { reference: true, subject: true, status: true, lastActivityAt: true, user: { select: { name: true, email: true } } } }),
  ]);

  return NextResponse.json({ metrics: { users, openTickets, inProgressTickets, waitingTickets, resolvedTickets }, recentUsers, recentTickets });
}