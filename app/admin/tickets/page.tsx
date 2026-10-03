import Link from "next/link";
import { redirect } from "next/navigation";
import { currentActor } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export default async function AdminTicketsPage() {
  const actor = await currentActor();
  if (!actor) redirect("/login?callbackUrl=%2Fadmin%2Ftickets");
  if (actor.role !== "ADMIN") return <main className="admin-page"><h1>Administrator access required</h1><Link href="/support">Return to customer support</Link></main>;
  const tickets = await prisma.supportTicket.findMany({ orderBy: { lastActivityAt: "desc" }, take: 100, select: { reference: true, category: true, subject: true, status: true, aiEnabled: true, createdAt: true, lastActivityAt: true, user: { select: { name: true, email: true } }, assignee: { select: { name: true, email: true } }, _count: { select: { messages: true } } } });
  return <main className="admin-page"><AdminNav /><header className="admin-header"><div><p className="eyebrow">CUSTOMER SUPPORT</p><h1>Support queue</h1><p>Latest customer requests and activity. Internal notes are visible only to administrators.</p></div></header>
    {tickets.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Reference</th><th>Customer</th><th>Category</th><th>Subject</th><th>Status</th><th>Assigned</th><th>Last activity</th></tr></thead><tbody>{tickets.map(ticket => <tr key={ticket.reference}><td><Link href={`/admin/tickets/${encodeURIComponent(ticket.reference)}`}>{ticket.reference}</Link></td><td>{ticket.user.name || ticket.user.email}<small>{ticket.user.email}</small></td><td>{ticket.category.replaceAll("_", " ")}</td><td>{ticket.subject}<small>{ticket._count.messages} messages{ticket.aiEnabled ? " · AI active" : " · human queue"}</small></td><td>{ticket.status.replaceAll("_", " ")}</td><td>{ticket.assignee?.name || ticket.assignee?.email || "Unassigned"}</td><td>{ticket.lastActivityAt.toLocaleString("en-NG")}</td></tr>)}</tbody></table></div> : <p className="empty">No support tickets have been created.</p>}
  </main>;
}

function AdminNav() { return <nav className="admin-nav" aria-label="Admin navigation"><Link href="/admin">Overview</Link><Link href="/admin/tickets">Support queue</Link><Link href="/admin/users">Users</Link><Link href="/admin/ipo">Verified IPO data</Link></nav>; }