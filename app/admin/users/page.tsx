import Link from "next/link";
import { redirect } from "next/navigation";
import { currentActor } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const actor = await currentActor();
  if (!actor) redirect("/login?callbackUrl=%2Fadmin%2Fusers");
  if (actor.role !== "ADMIN") return <main className="admin-page"><h1>Administrator access required</h1><Link href="/support">Return to customer support</Link></main>;
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, email: true, name: true, role: true, createdAt: true, _count: { select: { calculations: true, supportTickets: true } } } });
  return <main className="admin-page"><AdminNav /><header className="admin-header"><div><p className="eyebrow">ACCOUNT RECORDS</p><h1>Users</h1><p>Account details and counts from the database. Password hashes and session credentials are not included.</p></div></header>
    {users.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th><th>Saved calculations</th><th>Support requests</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td><Link href={`/admin/users/${encodeURIComponent(user.id)}`}>{user.name || "Not provided"}</Link></td><td>{user.email}</td><td>{user.role}</td><td>{user.createdAt.toLocaleDateString("en-NG")}</td><td>{user._count.calculations}</td><td>{user._count.supportTickets}</td></tr>)}</tbody></table></div> : <p className="empty">No users are registered.</p>}
  </main>;
}

function AdminNav() { return <nav className="admin-nav" aria-label="Admin navigation"><Link href="/admin">Overview</Link><Link href="/admin/tickets">Support queue</Link><Link href="/admin/users">Users</Link><Link href="/admin/ipo">Verified IPO data</Link></nav>; }