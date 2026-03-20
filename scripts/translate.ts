/**
 * Translation script using Claude API.
 *
 * Usage:
 *   1. Add ANTHROPIC_API_KEY to .env.local
 *   2. Run: npm run translate
 *
 * This script reads messages/pt.json and auto-generates en.json and es.json.
 * Only string values are translated — keys, variables ({name}), and tech terms are preserved.
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";
import "dotenv/config";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function translateMessages(
  messages: Record<string, unknown>,
  targetLanguage: string,
): Promise<Record<string, unknown>> {
  const json = JSON.stringify(messages, null, 2);

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `Translate the following JSON from Brazilian Portuguese to ${targetLanguage}.

Rules:
- Translate ONLY the string VALUES, never the keys
- Preserve all {variables} inside curly braces exactly as they appear
- Preserve all emojis exactly as they appear
- Keep proper nouns and technical terms untranslated (React, TypeScript, Next.js, etc.)
- Return ONLY valid JSON — no markdown, no code block, no explanation

JSON to translate:
${json}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "{}";

  return JSON.parse(text);
}

async function main() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.error("❌  ANTHROPIC_API_KEY not found in environment.");
    console.error("    Add it to .env.local and try again.");
    process.exit(1);
  }

  const messagesDir = path.join(process.cwd(), "messages");
  const ptPath = path.join(messagesDir, "pt.json");

  console.log("📖 Reading messages/pt.json...");
  const ptMessages = JSON.parse(await fs.readFile(ptPath, "utf-8"));

  console.log("🌐 Translating to English (US)...");
  const enMessages = await translateMessages(ptMessages, "English (US)");
  await fs.writeFile(
    path.join(messagesDir, "en.json"),
    JSON.stringify(enMessages, null, 2) + "\n",
  );
  console.log("✅ messages/en.json updated");

  console.log("🌐 Translating to Spanish (Latin America)...");
  const esMessages = await translateMessages(
    ptMessages,
    "Spanish (Latin America)",
  );
  await fs.writeFile(
    path.join(messagesDir, "es.json"),
    JSON.stringify(esMessages, null, 2) + "\n",
  );
  console.log("✅ messages/es.json updated");

  console.log("\n🎉 All translations complete!");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
