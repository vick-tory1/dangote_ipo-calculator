import Link from "next/link";
import { redirect } from "next/navigation";
import AdminTicketTools from "@/components/admin-ticket-tools";
import { currentActor } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export default async function AdminTicketPage({ params }: { params: Promise<{ reference: string }> }) {
  const actor = await currentActor();
  if (!actor) redirect("/login?callbackUrl=%2Fadmin%2Ftickets");
  if (actor.role !== "ADMIN") return <main className="admin-page"><h1>Administrator access required</h1><Link href="/support">Return to customer support</Link></main>;
  const { reference } = await params;
  const ticket = await prisma.supportTicket.findUnique({ where: { reference }, include: { user: { select: { id: true, email: true, name: true, createdAt: true } }, assignee: { select: { id: true, email: true, name: true } }, messages: { orderBy: { createdAt: "asc" }, include: { authorUser: { select: { id: true, email: true, name: true } } } } } });
  if (!ticket) return <main className="admin-page"><h1>Support ticket not found</h1><Link href="/admin/tickets">Return to support queue</Link></main>;
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, orderBy: { email: "asc" }, select: { id: true, name: true, email: true } });
  return <main className="admin-page"><AdminNav /><header className="admin-header"><div><p className="eyebrow">{ticket.reference} · {ticket.category.replaceAll("_", " ")}</p><h1>{ticket.subject}</h1><p>Customer: {ticket.user.name || ticket.user.email} · {ticket.user.email} · Created {ticket.createdAt.toLocaleString("en-NG")}</p><p>Status: {ticket.status.replaceAll("_", " ")} · Assigned: {ticket.assignee?.name || ticket.assignee?.email || "Unassigned"} · AI {ticket.aiEnabled ? "enabled" : "paused"}</p></div></header>
    {ticket.escalationReason && <p className="admin-escalation">Escalation: {ticket.escalationReason}</p>}
    <section className="card admin-conversation" aria-label="Customer support conversation">{ticket.messages.length ? ticket.messages.map(message => <article className={`conversation-message ${message.author.toLowerCase()}${message.isInternal ? " internal" : ""}`} key={message.id}><header><strong>{message.isInternal ? "Internal note" : message.author === "AI" ? "AI assistant" : message.author === "ADMIN" ? `Support staff${message.authorUser?.name ? ` · ${message.authorUser.name}` : ""}` : `Customer · ${message.authorUser?.name || ticket.user.email}`}</strong><time dateTime={message.createdAt.toISOString()}>{message.createdAt.toLocaleString("en-NG")}</time></header><p>{message.content}</p></article>) : <p className="empty">This support request has no messages.</p>}</section>
    <AdminTicketTools ticket={{ id: ticket.id, reference: ticket.reference, status: ticket.status, aiEnabled: ticket.aiEnabled, assigneeId: ticket.assigneeId }} admins={admins} />
  </main>;
}

function AdminNav() { return <nav className="admin-nav" aria-label="Admin navigation"><Link href="/admin">Overview</Link><Link href="/admin/tickets">Support queue</Link><Link href="/admin/users">Users</Link><Link href="/admin/ipo">Verified IPO data</Link></nav>; }