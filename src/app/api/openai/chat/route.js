// pages/api/chat.js
import Chat from "@/models/Chat";
import connectToDatabase from "@/utils/db";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  await connectToDatabase();

  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = token.id;

  try {
    let { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages cannot be empty" },
        { status: 400 }
      );
    }

    const systemPrompt = {
      role: "system",
      //   content: `
      // You are an AI assistant tasked with providing suggestions for filling out sections of a report. Follow these rules strictly in your responses:
      // - For 'details', request an article or transcript as a source. Once provided, process the text to create a description that excludes mentioning sources, uses formal language, and passive voice. Write in paragraphs without bullet points, subheadings, or direct quotations. Avoid using the same phrases or sentences as the original text. Ensure the text does not resemble news, does not contain questions, and includes only source-derived opinions. Do not use metaphors, informal terms, or idiomatic expressions. Each paragraph must have at least two sentences.
      // - For 'twoSentencesConclusion', check if 'details' have been created previously. If not, request the creation of 'details' and ask for the subject. If 'details' exist, create a concise two-sentence conclusion on the provided subject.
      // - For 'notesRecap', check if 'details' exist. If not, request to create 'details'. Then, summarize the 'details' into a brief paragraph.
      // - For 'notesToDo', check if 'details' exist. If not, request to create 'details'. Then, create a two-sentence paragraph outlining what the local government should do next.
      // - For 'notesMonitoring', check if 'details' exist. If not, request to create 'details'. Then, suggest general topics that could be monitored, derived from the 'details'.
      // For all other types of questions or requests, provide concise and clear answers to save tokens. Limit responses to a few sentences whenever possible.
      // When the user communicates in Indonesian, ensure your responses are also in Indonesian while adhering to the rules above.
      //     `,
      content:
        "You are AIder, an AI assistant specialized in helping create reports. Assist in generating a clear, structured, and detailed report on any topic provided. Incorporate relevant data, analysis, and insights while ensuring the content aligns with the given context, audience, and objectives.",
    };

    messages = [systemPrompt, ...messages];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const responseMessage = completion.choices[0]?.message;
    if (!responseMessage || !responseMessage.content) {
      return NextResponse.json(
        { error: "Invalid response from OpenAI" },
        { status: 500 }
      );
    }

    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({
        userId,
        messages: [],
      });
    }

    chat.messages.push(
      { role: "user", content: messages[messages.length - 1].content },
      { role: "assistant", content: responseMessage.content }
    );

    await chat.save();

    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/chat:", error);
    return NextResponse.json({ error: "Error creating chat" }, { status: 500 });
  }
}

export async function GET(req) {
  await connectToDatabase();

  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = token.id;

  try {
    const chat = await Chat.findOne({ userId });
    if (!chat) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/chat:", error);
    return NextResponse.json(
      { error: "Error fetching chats" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  await connectToDatabase();

  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = token.id;

  try {
    await Chat.deleteOne({ userId });

    return NextResponse.json({ message: "Chat deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/chat:", error);
    return NextResponse.json({ error: "Error deleting chat" }, { status: 500 });
  }
}
