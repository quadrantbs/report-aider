import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { genAI } from "@/config/ai";
import connectToDatabase from "@/utils/db";
import TextSource from "@/models/TextSource";

export async function POST(req) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt, sourceIds, config, variables } = await req.json();

  if (typeof prompt !== "string" || prompt.trim() === "") {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  if (prompt.length > 20000) {
    return NextResponse.json({ error: "Prompt is too long" }, { status: 400 });
  }

  // Whitelist models and clamp generation params so clients can't pick arbitrary
  // models or drive up token usage/cost.
  const ALLOWED_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
  const model = ALLOWED_MODELS.includes(config?.model)
    ? config.model
    : "gemini-2.5-flash-lite";
  const clamp = (value, min, max, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
  };
  const temperature = clamp(config?.temperature, 0, 2, 0.7);
  const maxOutputTokens = Math.round(clamp(config?.maxTokens, 1, 8192, 4096));

  await connectToDatabase();
  
  let context = "";
  if (sourceIds && sourceIds.length > 0) {
    const sources = await TextSource.find({
      _id: { $in: sourceIds },
      userId: token.sub,
    });
    context = sources.map((s) => `SOURCE: ${s.title}\nCONTENT:\n${s.content}`).join("\n\n---\n\n");
  }

  const interpolatedPrompt = variables
    ? prompt.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`)
    : prompt;

  const userMessage = `CONTEXT SOURCES:
${context || "No specific sources provided."}

PROMPT:
${interpolatedPrompt}`;

  try {
    const result = await genAI.models.generateContent({
      model,
      systemInstruction: `You are a professional report writer. Generate content based on the provided sources and prompt. Keep the tone formal and objective. If the context is in Indonesian, write in Indonesian.`,
      contents: [
        { role: "user", parts: [{ text: userMessage }] },
      ],
      config: {
        temperature,
        maxOutputTokens,
      },
    });

    const generatedText = result?.text ?? "";
    return NextResponse.json({ result: generatedText });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
