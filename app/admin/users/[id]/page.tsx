import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentActor } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await currentActor();
  if (!actor) redirect("/login?callbackUrl=%2Fadmin%2Fusers");
  if (actor.role !== "ADMIN") return <main className="admin-page"><h1>Administrator access required</h1><Link href="/support">Return to customer support</Link></main>;
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, createdAt: true, calculations: { orderBy: { createdAt: "desc" }, take: 20, select: { id: true, ipoVersion: true, createdAt: true, inputs: true, result: true } }, supportTickets: { orderBy: { lastActivityAt: "desc" }, take: 20, select: { reference: true, subject: true, status: true, category: true, lastActivityAt: true } } } });
  if (!user) notFound();
  return <main className="admin-page"><AdminNav /><header className="admin-header"><div><p className="eyebrow">USER ACCOUNT</p><h1>{user.name || user.email}</h1><p>{user.email} · {user.role} · Created {user.createdAt.toLocaleString("en-NG")}</p></div></header>
    <section><div className="section-head"><span>SUPPORT REQUESTS</span></div>{user.supportTickets.length ? <div className="admin-record-list">{user.supportTickets.map(ticket => <Link href={`/admin/tickets/${encodeURIComponent(ticket.reference)}`} key={ticket.reference}><strong>{ticket.subject}</strong><span>{ticket.reference} · {ticket.category.replaceAll("_", " ")} · {ticket.status.replaceAll("_", " ")}</span><time>{ticket.lastActivityAt.toLocaleString("en-NG")}</time></Link>)}</div> : <p className="empty">No support requests for this account.</p>}</section>
    <section className="admin-user-calculations"><div className="section-head"><span>RECENT SAVED IPO CALCULATIONS</span></div>{user.calculations.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Saved</th><th>Offer-data version</th><th>Inputs</th><th>Calculated result</th></tr></thead><tbody>{user.calculations.map(calculation => <tr key={calculation.id}><td>{calculation.createdAt.toLocaleString("en-NG")}</td><td>{calculation.ipoVersion}</td><td><pre>{JSON.stringify(calculation.inputs, null, 2)}</pre></td><td><pre>{JSON.stringify(calculation.result, null, 2)}</pre></td></tr>)}</tbody></table></div> : <p className="empty">No saved calculations for this account.</p>}</section>
  </main>;
}

function AdminNav() { return <nav className="admin-nav" aria-label="Admin navigation"><Link href="/admin">Overview</Link><Link href="/admin/tickets">Support queue</Link><Link href="/admin/users">Users</Link><Link href="/admin/ipo">Verified IPO data</Link></nav>; }