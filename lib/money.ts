export const KOBO_PER_NAIRA = 100n;
export const MAX_KOBO = 10_000_000_000_000_000n; // ₦100 trillion cap

export function parseMoney(value: unknown, field: string): bigint | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" && typeof value !== "number") throw new InputError(`${field} must be a number.`);
  const clean = String(value).replace(/,/g, "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) throw new InputError(`${field} must have no more than two decimal places.`);
  const [whole, fraction = ""] = clean.split(".");
  const amount = BigInt(whole) * KOBO_PER_NAIRA + BigInt((fraction + "00").slice(0, 2));
  if (amount > MAX_KOBO) throw new InputError(`${field} exceeds the supported limit.`);
  return amount;
}
export function moneyString(kobo: bigint): string { const sign = kobo < 0n ? "-" : ""; const n = kobo < 0n ? -kobo : kobo; return `${sign}${n / 100n}.${String(n % 100n).padStart(2, "0")}`; }
export class InputError extends Error { constructor(message: string) { super(message); this.name = "InputError"; } }
