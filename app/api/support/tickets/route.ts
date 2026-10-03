import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { currentActor } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { parseNewTicket } from "@/lib/support-validation";

export async function GET() {
  const actor = await currentActor();
  if (!actor) return NextResponse.json({ error: "Sign in to view your support requests." }, { status: 401 });
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: actor.id },
    orderBy: { lastActivityAt: "desc" },
    take: 50,
    select: { id: true, reference: true, category: true, subject: true, status: true, createdAt: true, lastActivityAt: true },
  });
  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  const actor = await currentActor();
  if (!actor) return NextResponse.json({ error: "Sign in to start a support request." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Enter a valid support request." }, { status: 400 }); }
  const input = parseNewTicket(body);
  if (!input) return NextResponse.json({ error: "Choose a category, enter a subject of 5–160 characters, and describe the issue in 20–5,000 characters." }, { status: 400 });

  const reference = `DIP-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const ticket = await prisma.supportTicket.create({
    data: {
      reference,
      userId: actor.id,
      category: input.category,
      subject: input.subject,
      messages: { create: { author: "CUSTOMER", authorId: actor.id, content: input.description } },
    },
    select: { id: true, reference: true, category: true, subject: true, status: true, createdAt: true },
  });
  return NextResponse.json({ ticket }, { status: 201 });
}