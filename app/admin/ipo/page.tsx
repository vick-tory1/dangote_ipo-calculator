import Link from "next/link";
import { redirect } from "next/navigation";
import { currentActor } from "@/lib/access";
import { publicIpoConfig } from "@/lib/ipo-data";

export default async function AdminIpoPage() {
  const actor = await currentActor();
  if (!actor) redirect("/login?callbackUrl=%2Fadmin%2Fipo");
  if (actor.role !== "ADMIN") return <main className="admin-page"><h1>Administrator access required</h1><Link href="/support">Return to customer support</Link></main>;
  const data = publicIpoConfig();
  return <main className="admin-page"><AdminNav /><header className="admin-header"><div><p className="eyebrow">VERSIONED VERIFIED SNAPSHOT</p><h1>IPO data</h1><p>Read-only view. Financial terms remain in version control and are not silently editable here.</p></div></header>
    <section className="card admin-ipo-data"><dl><dt>Issuer</dt><dd>{data.issuer}</dd><dt>Snapshot version</dt><dd>{data.version}</dd><dt>Offer price</dt><dd>₦{(Number(data.offerPriceKobo) / 100).toFixed(2)} per share</dd><dt>Offer shares</dt><dd>{Number(data.offerShares).toLocaleString("en-NG")}</dd><dt>Minimum / increment</dt><dd>{data.minimumShares} / {data.quantityIncrement} shares</dd><dt>Offer dates</dt><dd>{data.opensOn} – {data.closesOn}</dd><dt>Last verified</dt><dd>{data.lastVerified}</dd><dt>Fees / dividend</dt><dd>Unavailable in verified snapshot</dd></dl><h2>Sources</h2><ul>{data.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul><p>To change financial facts, verify a primary source, update the versioned data in code, document and review the change, then deploy it. This screen intentionally cannot write offer terms.</p></section>
  </main>;
}

function AdminNav() { return <nav className="admin-nav" aria-label="Admin navigation"><Link href="/admin">Overview</Link><Link href="/admin/tickets">Support queue</Link><Link href="/admin/users">Users</Link><Link href="/admin/ipo">Verified IPO data</Link></nav>; }