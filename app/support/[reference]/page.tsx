import { redirect } from "next/navigation";
import { currentActor } from "@/lib/access";
import { SupportConversation } from "@/components/support";

export default async function SupportTicketPage({ params }: { params: Promise<{ reference: string }> }) {
  if (!await currentActor()) redirect("/login?callbackUrl=%2Fsupport");
  const { reference } = await params;
  return <SupportConversation reference={reference} />;
}