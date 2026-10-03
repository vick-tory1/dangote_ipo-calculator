import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { calculateIpo, validateInput } from "@/lib/calculator";
import { DANGOTE_IPO, publicIpoConfig } from "@/lib/ipo-data";
import { prisma } from "@/lib/prisma";
import { InputError } from "@/lib/money";

async function userId() { const session = await auth(); return session?.user?.id ?? null; }
export async function GET() { const id = await userId(); if (!id) return NextResponse.json({ error: "Your session is not signed in. Sign in to view your saved Dangote IPO scenarios." }, { status: 401 }); const rows = await prisma.ipoCalculation.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, select: { id: true, createdAt: true, ipoVersion: true, inputs: true, result: true, ipoSnapshot: true } }); return NextResponse.json({ calculations: rows }); }
export async function POST(request: Request) {
  const id = await userId(); if (!id) return NextResponse.json({ error: "Your session is not signed in. Sign in to save this Dangote IPO estimate." }, { status: 401 });
  try { const inputs = validateInput(await request.json()); const result = calculateIpo(inputs); const saved = await prisma.ipoCalculation.create({ data: { userId: id, ipoVersion: DANGOTE_IPO.version, ipoSnapshot: JSON.parse(JSON.stringify(publicIpoConfig())), inputs: JSON.parse(JSON.stringify(inputs)), result: JSON.parse(JSON.stringify(result)) }, select: { id: true, createdAt: true } }); return NextResponse.json({ saved }, { status: 201 }); }
  catch (error) { if (error instanceof InputError) return NextResponse.json({ error: error.message, code: "INVALID_INPUT" }, { status: 400 }); return NextResponse.json({ error: "This Dangote IPO estimate could not be saved. Try again shortly." }, { status: 400 }); }
}
