"use client";
import { useEffect, useState } from "react";
type Item = { id: string; createdAt: string; ipoVersion: string; inputs: { expectedSellingPrice?: string; investmentAmount?: string; shares?: string; feePercent?: string; flatFee?: string }; result: { shares: string; investmentCost: string; fees: string; totalCashRequired: string; potentialGainLoss: string | null; percentageReturn: string | null } };
const ngn = (n: string | null | undefined) => n == null ? "—" : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(n));
export default function HistoryClient() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function loadScenarios() {
      try {
        const response = await fetch("/api/ipo/history");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setItems(data.calculations);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Saved Dangote IPO scenarios could not be loaded.");
      }
    }
    void loadScenarios();
  }, []);

  async function deleteScenario(id: string) {
    if (!window.confirm("Delete this saved IPO scenario? This cannot be undone.")) return;
    setDeleting(id);
    setError("");
    try {
      const response = await fetch(`/api/ipo/history/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "This saved scenario could not be deleted.");
      setItems(previous => previous?.filter(item => item.id !== id) ?? previous);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "This saved scenario could not be deleted.");
    } finally {
      setDeleting(null);
    }
  }

  return <main className="history-page"><nav><a className="brand" href="/dangote-ipo-calculator">DANGOTE <b>IPO</b></a><a href="/dangote-ipo-calculator">← Return to IPO calculator</a></nav><header><p className="eyebrow">SAVED DANGOTE IPO SCENARIOS</p><h1>Your saved estimates</h1><p>Each entry records the offer-data version, your inputs, and the estimate produced when you saved it. A saved scenario is not an IPO application or an allotment confirmation.</p></header>{error ? <div className="card message">{error} <a href="/login?callbackUrl=%2Fdangote-ipo-calculator%2Fhistory">Sign in to view saved scenarios.</a></div> : items === null ? <div className="card empty">Loading your saved Dangote IPO estimates…</div> : items.length === 0 ? <div className="card empty"><b>You have no saved IPO estimates.</b><p>Return to the calculator, calculate an estimate, then select “Save this IPO estimate”.</p></div> : <div className="history-list">{items.map(item => <article className="card" key={item.id}><div><span>Saved {new Date(item.createdAt).toLocaleString("en-NG")}</span><h2>{Number(item.result.shares).toLocaleString("en-NG")} shares · {ngn(item.result.totalCashRequired)} total application cash</h2><p>Offer-share cost: {ngn(item.result.investmentCost)} · Fees: {ngn(item.result.fees)} · Offer-data version: {item.ipoVersion}</p><p>Selling-price assumption: {ngn(item.inputs.expectedSellingPrice)} · Estimated gain/loss: {ngn(item.result.potentialGainLoss)}{item.result.percentageReturn !== null ? ` (${item.result.percentageReturn}% return)` : ""}</p></div><div className="history-actions"><strong className={item.result.potentialGainLoss !== null && Number(item.result.potentialGainLoss) >= 0 ? "positive" : "negative"}>{ngn(item.result.potentialGainLoss)}</strong><button className="secondary" type="button" onClick={() => void deleteScenario(item.id)} disabled={deleting === item.id}>{deleting === item.id ? "Deleting…" : "Delete scenario"}</button></div></article>)}</div>}</main>;
}
