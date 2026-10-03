export const SUPPORT_CATEGORIES = ["ACCOUNT", "CALCULATOR", "IPO_INFORMATION", "FEES_CHARGES", "TECHNICAL_ISSUE", "OTHER"] as const;
export type SupportCategoryInput = typeof SUPPORT_CATEGORIES[number];

export type NewTicketInput = { category: SupportCategoryInput; subject: string; description: string };

export function parseNewTicket(value: unknown): NewTicketInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (typeof input.category !== "string" || !SUPPORT_CATEGORIES.includes(input.category as SupportCategoryInput)) return null;
  if (typeof input.subject !== "string" || typeof input.description !== "string") return null;
  const subject = input.subject.trim();
  const description = input.description.trim();
  if (subject.length < 5 || subject.length > 160 || description.length < 20 || description.length > 5000) return null;
  return { category: input.category as SupportCategoryInput, subject, description };
}

export function parseSupportMessage(value: unknown): { content: string; requestHuman: boolean } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (typeof input.content !== "string") return null;
  const content = input.content.trim();
  if (content.length < 1 || content.length > 5000) return null;
  if (input.requestHuman !== undefined && typeof input.requestHuman !== "boolean") return null;
  return { content, requestHuman: input.requestHuman === true };
}