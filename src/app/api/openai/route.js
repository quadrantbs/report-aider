import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt } = await req.json();

  const systemPrompt = {
    role: "system",
    content: `
    You are an AI assistant tasked with providing suggestions for filling out sections of a report. Follow these rules strictly in your responses:
    - For 'details', process the text to create description paragraphs that excludes mentioning sources, uses formal language, and passive voice. Write in paragraphs without bullet points, subheadings, or direct quotations. Avoid using the same phrases or sentences as the original text. Ensure the text does not resemble news, does not contain questions, and includes only source-derived opinions. Do not use metaphors, informal terms, or idiomatic expressions. Each paragraph must have at least two sentences. Minimum 4 paragraphs.
    - For 'twoSentencesConclusion', create a concise two-sentence conclusion in one paragraph on the provided subject.
    - For 'notesRecap', summarize the 'details' into a brief paragraph.
    - For 'notesToDo', create a two-sentence paragraph outlining what the local government should do next.
    - For 'notesMonitoring', suggest a general topics that could be monitored, derived from the 'details'.
    When the the input or article are in Indonesian, ensure your responses are also in Indonesian while adhering to the rules above.
    `,
  };
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 1,
      max_completion_tokens: 4096,
    });
    const result = response.choices[0].message.content;
    return new NextResponse(JSON.stringify({ result }), { status: 200 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate OpenAI response" }),
      { status: 500 }
    );
  }
}
