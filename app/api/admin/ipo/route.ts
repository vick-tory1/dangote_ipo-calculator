import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/access";
import { publicIpoConfig } from "@/lib/ipo-data";

export async function GET() {
  if (!await currentAdmin()) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  return NextResponse.json({ data: publicIpoConfig(), editable: false, note: "Verified IPO facts are read-only here. Update the versioned source through a reviewed code change and migration/deployment process." });
}