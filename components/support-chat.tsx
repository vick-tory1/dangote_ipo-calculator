"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { CalculationInput } from "@/lib/calculator";

type ChatMessage = { role: "user" | "assistant"; content: string };

const suggestions = ["How does the share minimum affect my estimate?", "Which fees are not included?", "Where are approved application channels listed?"];

export default function SupportChat({ calculatorInput }: { calculatorInput?: CalculationInput }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Ask about the Dangote Refinery public offer, the verified terms shown on this page, or how your entered budget, fees, and selling-price assumption affect the estimate." },
  ]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This effect is deliberately synchronous: React effects may only return a
    // cleanup function, never the Promise created by an async operation.
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    const history = messages.slice(-8);
    setMessages(previous => [...previous, { role: "user", content }]);
    setDraft("");
    setError("");
    setSending(true);

    try {
      const response = await fetch("/api/ipo/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history, calculatorInput }),
      });
      const data = await response.json();
      if (!response.ok) {
        setDraft(content);
        setError(data.error || "The Dangote IPO assistant could not answer. Your calculation is still available.");
        return;
      }
      setMessages(previous => [...previous, { role: "assistant", content: data.reply }]);
    } catch {
      setDraft(content);
      setError("Could not reach Gemini. Check your connection and retry; your calculation is unchanged.");
    } finally {
      setSending(false);
    }
  }

  return <section className="support-chat card" id="investor-support" aria-labelledby="support-title">
    <header className="support-head"><div><p className="eyebrow">DANGOTE IPO INVESTOR SUPPORT</p><h2 id="support-title">Ask about the offer or your estimate</h2><p>Gemini answers from the published offer snapshot and calculator rules. It cannot verify your application or give personal investment advice.</p></div><span className="support-status"><i aria-hidden="true" /> Gemini</span></header>
    <div className="chat-transcript" aria-live="polite" aria-relevant="additions text">
      {messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}><span className="chat-role">{message.role === "assistant" ? "IPO assistant" : "You"}</span><p>{message.content}</p></div>)}
      {sending && <div className="chat-message assistant"><span className="chat-role">IPO assistant</span><p className="typing">Checking the offer information and preparing a reply…</p></div>}
      <div ref={endRef} />
    </div>
    <div className="chat-suggestions" aria-label="Suggested questions">{suggestions.map(question => <button key={question} type="button" onClick={() => setDraft(question)} disabled={sending}>{question}</button>)}</div>
    <form className="chat-compose" onSubmit={send}><label className="sr-only" htmlFor="support-question">Ask about the Dangote IPO</label><input id="support-question" value={draft} onChange={event => setDraft(event.target.value)} maxLength={1200} disabled={sending} /><button className="primary" type="submit" disabled={sending || !draft.trim()}>{sending ? "Sending question…" : "Send question"}</button></form>
    {error && <p className="message" role="status">{error}</p>}
    <p className="chat-disclaimer">Your chat is not an application. Do not send passwords, bank details, PINs, or one-time codes. Confirm current application instructions on the official Dangote IPO site.</p>
  </section>;
}
