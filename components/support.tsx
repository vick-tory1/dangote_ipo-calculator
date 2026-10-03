"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Ticket = { id: string; reference: string; category: string; subject: string; status: string; createdAt: string; lastActivityAt: string };
type TicketMessage = { id: string; author: "CUSTOMER" | "AI" | "ADMIN"; content: string; createdAt: string };
type TicketDetail = Ticket & { escalatedAt: string | null; messages: TicketMessage[] };

const categories = [
  ["ACCOUNT", "Account access"],
  ["CALCULATOR", "Calculator estimate"],
  ["IPO_INFORMATION", "Dangote IPO information"],
  ["FEES_CHARGES", "Fees and charges"],
  ["TECHNICAL_ISSUE", "Technical issue"],
  ["OTHER", "Other"],
] as const;

const statusLabel: Record<string, string> = { OPEN: "Open", IN_PROGRESS: "In progress", WAITING_FOR_CUSTOMER: "Waiting for you", RESOLVED: "Resolved", CLOSED: "Closed" };

function requestError(data: { error?: string }, fallback: string) { return data.error || fallback; }

export function SupportHome() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [loadingError, setLoadingError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch("/api/support/tickets").then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(requestError(data, "Your support requests could not be loaded."));
      if (active) setTickets(data.tickets);
    }).catch(error => { if (active) setLoadingError(error.message || "Your support requests could not be loaded."); });
    return () => { active = false; };
  }, []);

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/support/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category: form.get("category"), subject: form.get("subject"), description: form.get("description") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(requestError(data, "The support request could not be created."));
      router.push(`/support/${encodeURIComponent(data.ticket.reference)}`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "The support request could not be created.");
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="support-page">
    <nav><a className="brand" href="/dangote-ipo-calculator">Dangote IPO Calculator</a><a href="/dangote-ipo-calculator">Return to calculator</a></nav>
    <header className="support-page-heading"><p className="eyebrow">CUSTOMER SUPPORT</p><h1>Support for your Dangote IPO calculator account</h1><p>Ask about account access, calculator estimates, or information shown on this site. Support cannot submit an IPO application, confirm allotment, or provide personal investment advice.</p></header>
    <div className="support-layout">
      <section className="card support-request"><p className="eyebrow">START A SUPPORT REQUEST</p><h2>Tell us what you need help with</h2><p>Include the estimate reference or the exact message you saw. Never include your password, bank details, PIN, or one-time code.</p>
        <form onSubmit={createTicket}>
          <label>Support category<select name="category" required defaultValue="CALCULATOR">{categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label>Subject<input name="subject" required minLength={5} maxLength={160} placeholder="For example: Why does my budget cover fewer shares?" /></label>
          <label>Description<textarea name="description" required minLength={20} maxLength={5000} rows={7} placeholder="Describe what you were trying to do and what happened." /></label>
          {formError && <p className="message" role="alert">{formError}</p>}
          <button className="primary" type="submit" disabled={submitting}>{submitting ? "Creating request…" : "Create support request"}</button>
        </form>
      </section>
      <section className="support-ticket-list"><div className="section-head"><span>YOUR SUPPORT REQUESTS</span><small>Only you and authorized support staff can see your tickets.</small></div>
        {loadingError ? <p className="message" role="alert">{loadingError}</p> : tickets === null ? <p className="empty">Loading your requests…</p> : tickets.length === 0 ? <p className="empty">You have no support requests yet. Your created requests will appear here.</p> : <div className="ticket-list">{tickets.map(ticket => <a className="ticket-row" href={`/support/${encodeURIComponent(ticket.reference)}`} key={ticket.id}><span className="ticket-row-title"><strong>{ticket.subject}</strong><small>{ticket.reference} · {categories.find(([value]) => value === ticket.category)?.[1] ?? ticket.category}</small></span><span className={`ticket-status ${ticket.status.toLowerCase()}`}>{statusLabel[ticket.status] ?? ticket.status}</span><time dateTime={ticket.lastActivityAt}>{new Date(ticket.lastActivityAt).toLocaleString("en-NG")}</time></a>)}</div>}
      </section>
    </div>
    <section className="support-services" aria-labelledby="support-services-title">
      <p className="eyebrow">ADAMS EKPE · CREATIVE AND DIGITAL SERVICES</p>
      <h2 id="support-services-title">Design, editing, and web services</h2>
      <p>Alongside this IPO calculator, I offer creative and digital services for businesses, organisations, and personal brands.</p>
      <ul><li>Flyer and promotional graphic design</li><li>Magazine design and layout</li><li>Logo design and brand identity</li><li>Product packaging design</li><li>Calendar and sticker design</li><li>Video editing</li><li>Image editing and retouching</li><li>Websites, e-commerce, and custom web applications</li></ul>
      <div className="support-services-contact"><a className="primary" href="https://wa.me/2349057920012?text=Hello%20Adams%2C%20I%20found%20your%20Dangote%20IPO%20support%20page%20and%27d%20like%20to%20discuss%20a%20design%2C%20editing%2C%20or%20website%20project." target="_blank" rel="noreferrer">Discuss a project on WhatsApp <span aria-hidden="true">↗</span></a><a href="mailto:ekpeadams@gmail.com">Email Adams about a project</a></div>
    </section>
  </main>;
}

export function SupportConversation({ reference }: { reference: string }) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [requestHuman, setRequestHuman] = useState(false);

  const loadTicket = useCallback(async () => {
    const response = await fetch(`/api/support/tickets/${encodeURIComponent(reference)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(requestError(data, "This support conversation could not be loaded."));
    setTicket(data.ticket);
  }, [reference]);

  useEffect(() => { void loadTicket().catch(error => setError(error.message || "This support conversation could not be loaded.")); }, [loadTicket]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const content = String(new FormData(form).get("message") ?? "");
    if (!content.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch(`/api/support/tickets/${encodeURIComponent(reference)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, requestHuman }) });
      const data = await response.json();
      if (!response.ok) throw new Error(requestError(data, "Your reply could not be sent."));
      setRequestHuman(false);
      form.reset();
      await loadTicket();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Your reply could not be sent.");
    } finally {
      setSending(false);
    }
  }

  return <main className="support-page">
    <nav><a className="brand" href="/dangote-ipo-calculator">Dangote IPO Calculator</a><Link href="/support">All support requests</Link></nav>
    {error && !ticket ? <p className="message" role="alert">{error}</p> : !ticket ? <p className="empty">Loading support conversation…</p> : <>
      <header className="support-page-heading"><p className="eyebrow">SUPPORT REQUEST · {ticket.reference}</p><h1>{ticket.subject}</h1><p>{categories.find(([value]) => value === ticket.category)?.[1] ?? ticket.category} · <span className={`ticket-status ${ticket.status.toLowerCase()}`}>{statusLabel[ticket.status] ?? ticket.status}</span></p>{ticket.escalatedAt && <p>This request is with the human support queue. Staff replies are identified below.</p>}</header>
      <section className="card conversation" aria-label="Support conversation">
        {ticket.messages.length === 0 ? <p className="empty">No messages are in this conversation yet.</p> : ticket.messages.map(message => <article className={`conversation-message ${message.author.toLowerCase()}`} key={message.id}><header><strong>{message.author === "CUSTOMER" ? "You" : message.author === "AI" ? "AI assistant" : "Support staff"}</strong><time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString("en-NG")}</time></header><p>{message.content}</p></article>)}
      </section>
      {ticket.status === "CLOSED" ? <p className="empty">This request is closed. Start a new support request if you still need help.</p> : <form className="reply-form" onSubmit={send}><label htmlFor="support-reply">Add a message</label><textarea id="support-reply" name="message" required minLength={1} maxLength={5000} rows={5} placeholder="Add details or respond to the support team." /><label className="human-request"><input type="checkbox" checked={requestHuman} onChange={event => setRequestHuman(event.target.checked)} /> Send this request to a human support agent</label>{error && <p className="message" role="alert">{error}</p>}<button className="primary" type="submit" disabled={sending}>{sending ? "Sending reply…" : "Send reply"}</button></form>}
    </>}
  </main>;
}