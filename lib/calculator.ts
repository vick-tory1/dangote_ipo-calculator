import { DANGOTE_IPO } from "./ipo-data";
import { InputError, moneyString, parseMoney } from "./money";

export type CalculationInput = { mode: "amount" | "shares"; investmentAmount?: string | number; shares?: string | number; expectedSellingPrice?: string | number; feePercent?: string | number; flatFee?: string | number };
export type CalculationResult = { shares: string; investmentCost: string; remainingCash: string | null; fees: string; totalCashRequired: string; estimatedPositionValue: string | null; potentialGainLoss: string | null; percentageReturn: string | null; breakEvenPrice: string; dividendEstimate: null; assumptions: { expectedSellingPrice: string | null; feePercent: string; flatFee: string }; ipoVersion: string };

function integer(value: unknown, field: string, max: bigint): bigint | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" && typeof value !== "number") throw new InputError(`${field} must be a whole number.`);
  const text = String(value).trim(); if (!/^\d+$/.test(text)) throw new InputError(`${field} must be a whole number.`);
  const n = BigInt(text); if (n > max) throw new InputError(`${field} exceeds the supported limit.`); return n;
}
function ceilDiv(a: bigint, b: bigint) { return (a + b - 1n) / b; }
function feeFor(cost: bigint, feeBps: bigint, flat: bigint) { return ceilDiv(cost * feeBps, 10_000n) + flat; }
function totalFor(shares: bigint, feeBps: bigint, flat: bigint) { const cost = shares * BigInt(DANGOTE_IPO.offerPriceKobo); return { cost, fee: feeFor(cost, feeBps, flat), total: cost + feeFor(cost, feeBps, flat) }; }

export function validateInput(raw: unknown): CalculationInput {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new InputError("A calculator input object is required.");
  const v = raw as Record<string, unknown>;
  if (v.mode !== "amount" && v.mode !== "shares") throw new InputError("Choose whether you know an amount or a share quantity.");
  return { mode: v.mode, investmentAmount: v.investmentAmount as string | number | undefined, shares: v.shares as string | number | undefined, expectedSellingPrice: v.expectedSellingPrice as string | number | undefined, feePercent: v.feePercent as string | number | undefined, flatFee: v.flatFee as string | number | undefined };
}

export function calculateIpo(raw: CalculationInput): CalculationResult {
  const feePercent = parseMoney(raw.feePercent ?? 0, "Fee percentage")!; // percentage *100, e.g. 1.25 => 125 bps
  if (feePercent > 10000n) throw new InputError("Fee percentage cannot exceed 100%.");
  const flatFee = parseMoney(raw.flatFee ?? 0, "Flat fee")!;
  const expected = parseMoney(raw.expectedSellingPrice, "Expected selling price");
  const lot = BigInt(DANGOTE_IPO.quantityIncrement); const min = BigInt(DANGOTE_IPO.minimumShares);
  let shares: bigint; let amount: bigint | undefined;
  if (raw.mode === "shares") {
    shares = integer(raw.shares, "Number of shares", 1_000_000_000_000n) ?? 0n;
    if (shares < min || shares % lot !== 0n) throw new InputError(`Shares must be at least ${min} and in multiples of ${lot}.`);
    amount = parseMoney(raw.investmentAmount, "Investment amount");
  } else {
    amount = parseMoney(raw.investmentAmount, "Investment amount");
    if (!amount || amount <= 0n) throw new InputError("Enter a positive investment amount.");
    let low = 0n, high = amount / (BigInt(DANGOTE_IPO.offerPriceKobo) * lot);
    while (low < high) { const mid = (low + high + 1n) / 2n; if (totalFor(mid * lot, feePercent, flatFee).total <= amount) low = mid; else high = mid - 1n; }
    shares = low * lot;
    if (shares < min) throw new InputError(`Your amount does not cover the verified minimum of ${min} shares plus your stated fees.`);
  }
  const { cost, fee, total } = totalFor(shares, feePercent, flatFee);
  const position = expected === undefined ? null : shares * expected;
  const gain = position === null ? null : position - total;
  const returnBps = gain === null || total === 0n ? null : (gain * 10_000n) / total;
  const breakEven = ceilDiv(total, shares);
  return { shares: shares.toString(), investmentCost: moneyString(cost), remainingCash: amount === undefined ? null : moneyString(amount - total), fees: moneyString(fee), totalCashRequired: moneyString(total), estimatedPositionValue: position === null ? null : moneyString(position), potentialGainLoss: gain === null ? null : moneyString(gain), percentageReturn: returnBps === null ? null : (Number(returnBps) / 100).toFixed(2), breakEvenPrice: moneyString(breakEven), dividendEstimate: null, assumptions: { expectedSellingPrice: expected === undefined ? null : moneyString(expected), feePercent: moneyString(feePercent), flatFee: moneyString(flatFee) }, ipoVersion: DANGOTE_IPO.version };
}
