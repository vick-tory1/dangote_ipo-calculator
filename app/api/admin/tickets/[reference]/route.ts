import { NextRequest, NextResponse } from "next/server";
import { currentAdmin } from "@/lib/access";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ reference: string }> };
const statuses = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"] as const;

export async function GET(_request: NextRequest, { params }: Context) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const { reference } = await params;
  const ticket = await prisma.supportTicket.findUnique({ where: { reference }, include: { user: { select: { id: true, name: true, email: true, createdAt: true } }, assignee: { select: { id: true, name: true, email: true } }, messages: { orderBy: { createdAt: "asc" }, include: { authorUser: { select: { id: true, name: true, email: true } } } } } });
  return ticket ? NextResponse.json({ ticket }) : NextResponse.json({ error: "Support ticket not found." }, { status: 404 });
}

export async function POST(request: NextRequest, { params }: Context) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const { reference } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Enter a valid support reply." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Enter a valid support reply." }, { status: 400 });
  const input = body as Record<string, unknown>;
  if (typeof input.content !== "string" || input.content.trim().length < 1 || input.content.trim().length > 5000 || (input.internal !== undefined && typeof input.internal !== "boolean")) return NextResponse.json({ error: "A support reply or internal note must contain 1–5,000 characters." }, { status: 400 });
  const ticket = await prisma.supportTicket.findUnique({ where: { reference }, select: { id: true, status: true } });
  if (!ticket) return NextResponse.json({ error: "Support ticket not found." }, { status: 404 });
  const content = input.content.trim();
  const internal = input.internal === true;
  const now = new Date();
  await prisma.$transaction([
    prisma.supportMessage.create({ data: { ticketId: ticket.id, authorId: admin.id, author: "ADMIN", content, isInternal: internal } }),
    prisma.supportTicket.update({ where: { id: ticket.id }, data: { lastActivityAt: now, ...(!internal && ticket.status === "OPEN" ? { status: "IN_PROGRESS" } : {}) } }),
    prisma.auditLog.create({ data: { actorId: admin.id, action: internal ? "SUPPORT_INTERNAL_NOTE_ADDED" : "SUPPORT_ADMIN_REPLY_SENT", entityType: "SupportTicket", entityId: ticket.id, newValue: { contentLength: content.length } } }),
  ]);
  return NextResponse.json({ sent: true, internal });
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const { reference } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Enter valid ticket changes." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Enter valid ticket changes." }, { status: 400 });
  const input = body as Record<string, unknown>;
  if (input.status !== undefined && (typeof input.status !== "string" || !statuses.includes(input.status as typeof statuses[number]))) return NextResponse.json({ error: "Choose a valid support status." }, { status: 400 });
  if (input.assigneeId !== undefined && input.assigneeId !== null && (typeof input.assigneeId !== "string" || input.assigneeId.length > 64)) return NextResponse.json({ error: "Choose a valid administrator assignment." }, { status: 400 });
  if (input.aiEnabled !== undefined && typeof input.aiEnabled !== "boolean") return NextResponse.json({ error: "The AI setting must be on or off." }, { status: 400 });

  const existing = await prisma.supportTicket.findUnique({ where: { reference }, select: { id: true, status: true, assigneeId: true, aiEnabled: true, escalatedAt: true } });
  if (!existing) return NextResponse.json({ error: "Support ticket not found." }, { status: 404 });
  if (typeof input.assigneeId === "string") {
    const assignee = await prisma.user.findUnique({ where: { id: input.assigneeId }, select: { role: true } });
    if (assignee?.role !== "ADMIN") return NextResponse.json({ error: "Tickets can only be assigned to an administrator." }, { status: 400 });
  }

  const data = {
    ...(input.status !== undefined ? { status: input.status as typeof statuses[number] } : {}),
    ...(input.assigneeId !== undefined ? { assigneeId: input.assigneeId as string | null } : {}),
    ...(input.aiEnabled !== undefined ? { aiEnabled: input.aiEnabled as boolean, ...(!input.aiEnabled ? { escalatedAt: existing.escalatedAt ?? new Date() } : { escalatedAt: null, escalationReason: null }) } : {}),
    lastActivityAt: new Date(),
  };
  const ticket = await prisma.$transaction(async transaction => {
    const updated = await transaction.supportTicket.update({ where: { id: existing.id }, data, select: { reference: true, status: true, assigneeId: true, aiEnabled: true, escalatedAt: true } });
    await transaction.auditLog.create({ data: { actorId: admin.id, action: "SUPPORT_TICKET_UPDATED", entityType: "SupportTicket", entityId: existing.id, previousValue: { status: existing.status, assigneeId: existing.assigneeId, aiEnabled: existing.aiEnabled }, newValue: { status: updated.status, assigneeId: updated.assigneeId, aiEnabled: updated.aiEnabled } } });
    return updated;
  });
  return NextResponse.json({ ticket });
}