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
      model: config?.model || "gemini-2.5-flash-lite",
      systemInstruction: `You are a professional report writer. Generate content based on the provided sources and prompt. Keep the tone formal and objective. If the context is in Indonesian, write in Indonesian.`,
      contents: [
        { role: "user", parts: [{ text: userMessage }] },
      ],
      config: {
        temperature: config?.temperature || 0.7,
        maxOutputTokens: config?.maxTokens || 4096,
      },
    });

    const generatedText = result?.text ?? "";
    return NextResponse.json({ result: generatedText });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
