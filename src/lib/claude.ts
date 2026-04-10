import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const MODELS = [
  "claude-sonnet-4-20250514",
  "claude-haiku-4-5-20251001",
];

export async function callClaude(
  system: string,
  userMessage: string,
  maxTokens: number = 2000
): Promise<string> {
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const message = await client.messages.create({
          model,
          max_tokens: maxTokens,
          system,
          messages: [{ role: "user", content: userMessage }],
        });
        const raw = message.content[0].type === "text" ? message.content[0].text : "";
        // Strip markdown code blocks if present
        return raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      } catch (err: unknown) {
        const error = err as { status?: number };
        if (error.status === 529 || error.status === 529) {
          // Overloaded, wait and retry or try next model
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
          break; // try next model
        }
        throw err;
      }
    }
  }
  throw new Error("All models overloaded. Please try again in a moment.");
}
