type GeminiResponse = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
export type GeminiTurn = { role: "user" | "model"; text: string };

/** Optional support provider. The calculator never delegates financial maths here. */
export async function replyWithGemini(systemPrompt: string, turns: GeminiTurn[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents: turns.map(turn => ({ role: turn.role, parts: [{ text: turn.text }] })), generationConfig: { maxOutputTokens: 650, temperature: 0.2 } }),
  });
  if (!response.ok) return null;
  const data = await response.json() as GeminiResponse;
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() || null;
}
