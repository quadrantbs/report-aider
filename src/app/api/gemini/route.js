import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt } = await req.json();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const systemInstruction = {
      role: "user",
      parts: [
        {
          text: `
        You are an AI assistant tasked with providing suggestions for filling out sections of a report. Follow these rules strictly in your responses:
        - For 'details', process the text to create description paragraphs that excludes mentioning sources, uses formal language, and passive voice. Write in paragraphs without bullet points, subheadings, or direct quotations. Avoid using the same phrases or sentences as the original text. Ensure the text does not resemble news, does not contain questions, and includes only source-derived opinions. Do not use metaphors, informal terms, or idiomatic expressions. Each paragraph must have at least two sentences. Minimum 4 paragraphs.
        - For 'twoSentencesConclusion', create a concise two-sentence conclusion in one paragraph on the provided subject.
        - For 'notesRecap', summarize the 'details' into a brief paragraph.
        - For 'notesToDo', create a two-sentence paragraph outlining what the local government should do next.
        - For 'notesMonitoring', suggest a general topics that could be monitored, derived from the 'details'.
        When the the input or article are in Indonesian, ensure your responses are also in Indonesian while adhering to the rules above.
        `,
        },
      ],
    };

    const result = await model.generateContent({
      contents: [systemInstruction, { role: "model", parts: [{ text: "Okay, I understand. I am ready to provide suggestions for your report." }] }, { role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1,
        maxOutputTokens: 4096,
      },
    });
    const response = await result.response;
    const generatedText = response.text();

    return new NextResponse(JSON.stringify({ result: generatedText }), { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/gemini:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate Gemini response" }),
      { status: 500 }
    );
  }
}