import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { genAI } from "@/config/ai";
import connectToDatabase from "@/utils/db";
import TextSource from "@/models/TextSource";

const ALLOWED_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

const SYSTEM_TEXT = `You are a professional report writer. Generate a single concise section of content based on the provided sources and prompt. Keep the tone formal and objective. If the context is in Indonesian, write in Indonesian. Return only the content, no preamble.`;

const SYSTEM_LIST = `You are a professional report writer. Based on the sources and prompt, produce a list of report points. Return ONE point per line, with NO numbering, bullets, or markers — just the plain text of each point. If the context is in Indonesian, write in Indonesian.`;

export async function POST(req) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { prompt, sourceIds, config, variables } = body;
  const mode = body.mode === "list" ? "list" : "text";

  if (typeof prompt !== "string" || prompt.trim() === "") {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  if (prompt.length > 20000) {
    return NextResponse.json({ error: "Prompt is too long" }, { status: 400 });
  }

  const model = ALLOWED_MODELS.includes(config?.model) ? config.model : "gemini-2.5-flash-lite";
  const clamp = (value, min, max, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
  };
  const temperature = clamp(config?.temperature, 0, 2, 0.7);
  const maxOutputTokens = Math.round(clamp(config?.maxTokens, 1, 8192, 4096));

  await connectToDatabase();

  let context = "";
  if (Array.isArray(sourceIds) && sourceIds.length > 0) {
    const sources = await TextSource.find({ _id: { $in: sourceIds }, userId: token.sub });
    context = sources.map((s) => `SOURCE: ${s.title}\nCONTENT:\n${s.content}`).join("\n\n---\n\n");
  }

  const vars = variables || {};
  const interpolatedPrompt = prompt.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);

  const userMessage = `CONTEXT SOURCES:\n${context || "No specific sources provided."}\n\nPROMPT:\n${interpolatedPrompt}`;

  try {
    const result = await genAI.models.generateContent({
      model,
      systemInstruction: mode === "list" ? SYSTEM_LIST : SYSTEM_TEXT,
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      config: { temperature, maxOutputTokens },
    });

    const text = result?.text ?? "";

    if (mode === "list") {
      const items = text
        .split("\n")
        .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)]|[a-z][.)]|[ivx]+[.)])\s*/i, "").trim())
        .filter(Boolean)
        .map((t) => ({ text: t, children: [] }));
      return NextResponse.json({ items });
    }

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
