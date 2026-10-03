import { NextResponse } from "next/server";
import { calculateIpo, validateInput } from "@/lib/calculator";
import { InputError } from "@/lib/money";
export async function POST(request: Request) {
  try { const result = calculateIpo(validateInput(await request.json())); return NextResponse.json({ result, calculatedBy: "server" }); }
  catch (error) { if (error instanceof InputError) return NextResponse.json({ error: error.message, code: "INVALID_INPUT" }, { status: 400 }); return NextResponse.json({ error: "The Dangote IPO estimate could not be calculated. Try again shortly." }, { status: 400 }); }
}
