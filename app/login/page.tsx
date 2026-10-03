import { redirect } from "next/navigation";
import Link from "next/link";
import { currentActor } from "@/lib/access";
import LoginForm from "@/components/login-form";

function safeCallback(value: string | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/support";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const actor = await currentActor();
  const { callbackUrl } = await searchParams;
  const destination = safeCallback(callbackUrl);
  if (actor) redirect(destination);
  return <main className="auth-page"><nav><a className="brand" href="/dangote-ipo-calculator">Dangote IPO Calculator</a><Link href="/support">Customer support</Link></nav><section className="card auth-panel"><p className="eyebrow">EXISTING ACCOUNT ACCESS</p><h1>Sign in to contact support</h1><p>Accounts are provisioned by the site owner. This page does not create new accounts.</p><LoginForm callbackUrl={destination} /></section></main>;
}