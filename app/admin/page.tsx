import Link from "next/link";
import { redirect } from "next/navigation";
import { currentActor } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const actor = await currentActor();
  if (!actor) redirect("/login?callbackUrl=%2Fadmin");
  if (actor.role !== "ADMIN") return <main className="admin-page"><h1>Administrator access required</h1><p>This account cannot open the support administration area.</p><Link href="/support">Return to customer support</Link></main>;

  const [totalUsers, openTickets, inProgress, waiting, resolved, recentUsers, recentTickets] = await Promise.all([
    prisma.user.count(),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.supportTicket.count({ where: { status: "WAITING_FOR_CUSTOMER" } }),
    prisma.supportTicket.count({ where: { status: "RESOLVED" } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, name: true, email: true, createdAt: true } }),
    prisma.supportTicket.findMany({ orderBy: { lastActivityAt: "desc" }, take: 8, select: { reference: true, subject: true, status: true, lastActivityAt: true, user: { select: { email: true } } } }),
  ]);

  return <main className="admin-page">
    <header className="admin-header"><div><p className="eyebrow">DANGOTE IPO INVESTMENT CALCULATOR</p><h1>Support administration</h1><p>Current account and ticket records from the application database.</p></div><nav aria-label="Admin navigation"><Link href="/admin">Overview</Link><Link href="/admin/tickets">Support queue</Link><Link href="/admin/users">Users</Link><Link href="/admin/ipo">Verified IPO data</Link></nav></header>
    <section className="admin-metrics" aria-label="Current operational counts">{[["Registered users", totalUsers], ["Open tickets", openTickets], ["In progress", inProgress], ["Waiting for customer", waiting], ["Resolved", resolved]].map(([label, value]) => <article className="admin-metric" key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
    <div className="admin-columns"><section><div className="section-head"><span>RECENT SUPPORT ACTIVITY</span><Link href="/admin/tickets">Open queue</Link></div>{recentTickets.length ? <div className="admin-record-list">{recentTickets.map(ticket => <Link href={`/admin/tickets/${encodeURIComponent(ticket.reference)}`} key={ticket.reference}><strong>{ticket.subject}</strong><span>{ticket.reference} · {ticket.user.email}</span><time dateTime={ticket.lastActivityAt.toISOString()}>{ticket.lastActivityAt.toLocaleString("en-NG")} · {ticket.status.replaceAll("_", " ")}</time></Link>)}</div> : <p className="empty">There are no support tickets yet.</p>}</section>
      <section><div className="section-head"><span>RECENTLY CREATED ACCOUNTS</span><Link href="/admin/users">View users</Link></div>{recentUsers.length ? <div className="admin-record-list">{recentUsers.map(user => <Link href={`/admin/users/${encodeURIComponent(user.id)}`} key={user.id}><strong>{user.name || user.email}</strong><span>{user.email}</span><time dateTime={user.createdAt.toISOString()}>{user.createdAt.toLocaleString("en-NG")}</time></Link>)}</div> : <p className="empty">There are no registered users.</p>}</section></div>
  </main>;
}