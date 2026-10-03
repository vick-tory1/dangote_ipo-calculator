import { afterEach, describe, expect, it } from "vitest";
import { isAdminRole, ticketOwnerWhere } from "../lib/support-policy";
import { replyWithGemini } from "../lib/ai-provider";
import { allowSupportMessage } from "../lib/support-rate-limit";
import { parseNewTicket, parseSupportMessage } from "../lib/support-validation";

const originalApiKey = process.env.GEMINI_API_KEY;
afterEach(() => {
  if (originalApiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalApiKey;
});

describe("support input validation", () => {
  it("accepts a valid investor support request", () => {
    expect(parseNewTicket({ category: "CALCULATOR", subject: "Share estimate question", description: "Please explain why my budget covers fewer shares after I enter fees." })).toEqual({ category: "CALCULATOR", subject: "Share estimate question", description: "Please explain why my budget covers fewer shares after I enter fees." });
  });

  it("rejects invalid category and out-of-range fields", () => {
    expect(parseNewTicket({ category: "ADMIN", subject: "Question", description: "A sufficiently long description to pass the minimum." })).toBeNull();
    expect(parseNewTicket({ category: "OTHER", subject: "No", description: "Too short" })).toBeNull();
    expect(parseSupportMessage({ content: " ".repeat(3) })).toBeNull();
    expect(parseSupportMessage({ content: "Help", requestHuman: "yes" })).toBeNull();
  });
});

describe("support authorization policy", () => {
  it("allows only the explicit ADMIN role", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("CUSTOMER")).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });

  it("scopes ticket lookups to both reference and owner", () => {
    expect(ticketOwnerWhere("DIP-ABC-123", "user-a")).toEqual({ reference: "DIP-ABC-123", userId: "user-a" });
    expect(ticketOwnerWhere("DIP-ABC-123", "user-b").userId).not.toBe("user-a");
  });
});

describe("support request throttling", () => {
  it("limits a customer to eight messages per minute and resets after a minute", () => {
    const account = `test-${Date.now()}`;
    for (let count = 0; count < 8; count += 1) expect(allowSupportMessage(account, 1_000)).toBe(true);
    expect(allowSupportMessage(account, 1_000)).toBe(false);
    expect(allowSupportMessage(account, 61_000)).toBe(true);
  });
});

describe("Gemini support fallback", () => {
  it("returns unavailable when the server-side key is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(replyWithGemini("support rules", [{ role: "user", text: "How does the calculator work?" }])).resolves.toBeNull();
  });
});