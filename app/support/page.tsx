import { redirect } from "next/navigation";
import { currentActor } from "@/lib/access";
import { SupportHome } from "@/components/support";

export default async function SupportPage() {
  if (!await currentActor()) redirect("/login?callbackUrl=%2Fsupport");
  return <SupportHome />;
}