import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, createdAt: true, calculations: { orderBy: { createdAt: "desc" }, take: 20, select: { id: true, createdAt: true, ipoVersion: true, inputs: true, result: true } }, supportTickets: { orderBy: { lastActivityAt: "desc" }, take: 20, select: { reference: true, subject: true, category: true, status: true, createdAt: true, lastActivityAt: true } } } });
  return user ? NextResponse.json({ user }) : NextResponse.json({ error: "User not found." }, { status: 404 });
}