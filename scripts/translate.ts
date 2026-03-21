/**
 * Translation script using DeepL API.
 *
 * Usage:
 *   1. Add DEEPL_API_KEY to .env.local (get a free key at deepl.com/pro-api)
 *   2. Run: npm run translate
 *
 * Reads messages/pt.json and auto-generates en.json and es.json.
 * Only string values are translated — keys, variables ({name}), and tech terms are preserved.
 */

import * as deepl from "deepl-node";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

/** Collects all string leaves in traversal order */
function collectStrings(val: JsonValue, out: string[]): void {
  if (typeof val === "string") {
    out.push(val);
  } else if (Array.isArray(val)) {
    val.forEach((v) => collectStrings(v, out));
  } else if (val && typeof val === "object") {
    Object.values(val).forEach((v) => collectStrings(v, out));
  }
}

/** Rebuilds the structure replacing strings with translated values (same traversal order) */
function applyTranslations(val: JsonValue, translations: string[], idx: { i: number }): JsonValue {
  if (typeof val === "string") {
    return translations[idx.i++];
  }
  if (Array.isArray(val)) {
    return val.map((v) => applyTranslations(v, translations, idx));
  }
  if (val && typeof val === "object") {
    return Object.fromEntries(
      Object.entries(val).map(([k, v]) => [k, applyTranslations(v, translations, idx)]),
    );
  }
  return val;
}

async function translateJson(
  messages: JsonValue,
  translator: deepl.Translator,
  sourceLang: deepl.SourceLanguageCode,
  targetLang: deepl.TargetLanguageCode,
): Promise<JsonValue> {
  const strings: string[] = [];
  collectStrings(messages, strings);

  if (strings.length === 0) return messages;

  // DeepL rejects empty strings — keep them as-is and only translate non-empty
  const nonEmpty = strings.map((s, i) => ({ s, i })).filter(({ s }) => s.trim() !== "");
  const translatedMap: Record<number, string> = {};

  if (nonEmpty.length > 0) {
    const results = await translator.translateText(
      nonEmpty.map((x) => x.s),
      sourceLang,
      targetLang,
    );
    const texts = (Array.isArray(results) ? results : [results]).map((r) => r.text);
    nonEmpty.forEach(({ i }, j) => { translatedMap[i] = texts[j]; });
  }

  const translated = strings.map((s, i) => (i in translatedMap ? translatedMap[i] : s));

  return applyTranslations(messages, translated, { i: 0 });
}

async function main() {
  const key = process.env.DEEPL_API_KEY;
  if (!key) {
    console.error("❌  DEEPL_API_KEY not found in environment.");
    console.error("    Add it to .env.local and try again.");
    process.exit(1);
  }

  const translator = new deepl.Translator(key);
  const messagesDir = path.join(process.cwd(), "messages");
  const ptPath = path.join(messagesDir, "pt.json");

  console.log("📖 Reading messages/pt.json...");
  const ptMessages = JSON.parse(await fs.readFile(ptPath, "utf-8")) as JsonValue;

  console.log("🌐 Translating to English (US)...");
  const enMessages = await translateJson(ptMessages, translator, "pt", "en-US");
  await fs.writeFile(
    path.join(messagesDir, "en.json"),
    JSON.stringify(enMessages, null, 2) + "\n",
  );
  console.log("✅ messages/en.json updated");

  console.log("🌐 Translating to Spanish...");
  const esMessages = await translateJson(ptMessages, translator, "pt", "es");
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
