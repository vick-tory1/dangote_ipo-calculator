import { NextResponse } from "next/server";
import { publicIpoConfig } from "@/lib/ipo-data";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ ...publicIpoConfig(), snapshotRetrievedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } }); }
