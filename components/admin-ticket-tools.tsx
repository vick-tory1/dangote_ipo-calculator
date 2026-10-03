"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AdminOption = { id: string; name: string | null; email: string };
type AdminTicket = { id: string; reference: string; status: string; aiEnabled: boolean; assigneeId: string | null };

export default function AdminTicketTools({ ticket, admins }: { ticket: AdminTicket; admins: AdminOption[] }) {
  const router = useRouter();
  const [status, setStatus] = useState(ticket.status);
  const [assigneeId, setAssigneeId] = useState(ticket.assigneeId ?? "");
  const [aiEnabled, setAiEnabled] = useState(ticket.aiEnabled);
  const [content, setContent] = useState("");
  const [internal, setInternal] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function updateTicket(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/tickets/${encodeURIComponent(ticket.reference)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, assigneeId: assigneeId || null, aiEnabled }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ticket changes could not be saved.");
      router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Ticket changes could not be saved."); }
    finally { setBusy(false); }
  }

  async function sendReply(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/tickets/${encodeURIComponent(ticket.reference)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, internal }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The reply could not be sent.");
      setContent("");
      setInternal(false);
      router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "The reply could not be sent."); }
    finally { setBusy(false); }
  }

  return <section className="admin-ticket-tools">
    <form className="admin-ticket-settings" onSubmit={updateTicket}>
      <label>Status<select value={status} onChange={event => setStatus(event.target.value)}><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="WAITING_FOR_CUSTOMER">Waiting for customer</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select></label>
      <label>Assigned administrator<select value={assigneeId} onChange={event => setAssigneeId(event.target.value)}><option value="">Unassigned</option>{admins.map(admin => <option key={admin.id} value={admin.id}>{admin.name || admin.email}</option>)}</select></label>
      <label className="admin-checkbox"><input type="checkbox" checked={aiEnabled} onChange={event => setAiEnabled(event.target.checked)} /> AI replies enabled</label>
      <button className="primary" disabled={busy} type="submit">{busy ? "Saving…" : "Save ticket settings"}</button>
    </form>
    <form className="admin-reply-form" onSubmit={sendReply}>
      <label htmlFor="admin-ticket-reply">Reply to customer or add an internal note</label>
      <textarea id="admin-ticket-reply" value={content} onChange={event => setContent(event.target.value)} maxLength={5000} required rows={5} />
      <label className="admin-checkbox"><input type="checkbox" checked={internal} onChange={event => setInternal(event.target.checked)} /> Internal note, hidden from customer</label>
      <button className="secondary" disabled={busy || !content.trim()} type="submit">{busy ? "Sending…" : internal ? "Add internal note" : "Send staff reply"}</button>
    </form>
    {error && <p className="message" role="alert">{error}</p>}
  </section>;
}