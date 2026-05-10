import Chat from "@/models/Chat";
import connectToDatabase from "@/utils/db";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import {GoogleGenAI} from '@google/genai'

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

if (!process.env.GEMINI_API_KEY) {
  console.warn("[Gemini][Init] Warning: GEMINI_API_KEY is not set.");
}

export async function POST(req) {
  console.log("[Gemini][POST] Start handling request");
  await connectToDatabase();
  console.log("[Gemini][POST] Connected to database");

  const token = await getToken({ req });
  if (!token) {
    console.warn("[Gemini][POST] Unauthorized request (no token)");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = token.id;
  console.log("[Gemini][POST] Authenticated userId:", userId);

  try {
    let { messages } = await req.json();
    console.log("[Gemini][POST] Received messages:", Array.isArray(messages) ? messages.length : 0);

    if (!messages || messages.length === 0) {
      console.warn("[Gemini][POST] Messages cannot be empty");
      return NextResponse.json(
        { error: "Messages cannot be empty" },
        { status: 400 }
      );
    }

    // create a stateful chat session via the SDK

    // The system prompt should be the first message in the history for Gemini
    const systemPrompt = {
      role: "model",
      parts: [
        {
          text:
            "Kamu adalah AIder, asisten AI yang berfokus pada pembuatan laporan. Tugasmu adalah membantu menghasilkan laporan yang jelas, terstruktur, dan informatif berdasarkan topik yang diberikan. Sertakan data, analisis, dan wawasan yang relevan, serta pastikan isi laporan sesuai dengan konteks, audiens, dan tujuan yang ditentukan. Gunakan gaya penulisan yang ringkas, padat, dan hindari penjelasan yang tidak perlu.",
        },
      ],
    };

    // Format messages for Gemini API
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    console.log(
      "[Gemini][POST] Formatted messages count:",
      formattedMessages.length,
      "Last message snippet:",
      formattedMessages[formattedMessages.length - 1]?.parts[0]?.text?.slice(0, 120)
    );

    // Keep only the last N messages in the history to reduce tokens
    const maxHistoryMessages = 5;
    const priorMessages = formattedMessages.slice(0, -1); // all except the last (which we'll send)
    const recentHistory = priorMessages.length > maxHistoryMessages ? priorMessages.slice(-maxHistoryMessages) : priorMessages;

    console.log("[Gemini][POST] Including prior history messages:", recentHistory.length);

    const chat = genAI.chats.create({
      model: "gemini-2.5-flash-lite",
      history: [
        systemPrompt,
        ...recentHistory,
      ],
      config: {
        maxOutputTokens: 4096,
      },
    });

    console.log("[Gemini][POST] Chat started with model");

    const lastUserMessage = formattedMessages[formattedMessages.length - 1];
    const result = await chat.sendMessage({ message: lastUserMessage.parts[0].text });
    console.log("[Gemini][POST] Sent message to Gemini");

    const responseMessage = result?.text ?? "";

    console.log("[Gemini][POST] Received response from Gemini. Length:", responseMessage?.length || 0);

    if (!responseMessage) {
      console.error("[Gemini][POST] Invalid response from Gemini");
      return NextResponse.json(
        { error: "Invalid response from Gemini" },
        { status: 500 }
      );
    }

    let userChat = await Chat.findOne({ userId });
    if (!userChat) {
      console.log("[Gemini][POST] Creating new chat document for user:", userId);
      userChat = new Chat({
        userId,
        messages: [],
      });
    } else {
      console.log("[Gemini][POST] Found existing chat document for user:", userId);
    }

    userChat.messages.push(
      { role: "user", content: lastUserMessage.parts[0].text },
      { role: "assistant", content: responseMessage }
    );

    const saved = await userChat.save();
    console.log("[Gemini][POST] Chat saved. _id:", saved._id?.toString?.() || "(no id)");

    return NextResponse.json(userChat, { status: 201 });
  } catch (error) {
    console.error("[Gemini][POST] Error creating chat:", error?.stack || error);
    return NextResponse.json({ error: "Error creating chat" }, { status: 500 });
  }
}

export async function GET(req) {
  console.log("[Gemini][GET] Fetch chats start");
  await connectToDatabase();
  console.log("[Gemini][GET] Connected to database");

  const token = await getToken({ req });
  if (!token) {
    console.warn("[Gemini][GET] Unauthorized request (no token)");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = token.id;
  console.log("[Gemini][GET] Authenticated userId:", userId);

  try {
    const chat = await Chat.findOne({ userId });
    if (!chat) {
      console.log("[Gemini][GET] No chat found for user:", userId);
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    console.log("[Gemini][GET] Returning chat for user:", userId, "messages:", chat.messages?.length || 0);
    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    console.error("[Gemini][GET] Error fetching chats:", error?.stack || error);
    return NextResponse.json(
      { error: "Error fetching chats" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  console.log("[Gemini][DELETE] Delete chat start");
  await connectToDatabase();
  console.log("[Gemini][DELETE] Connected to database");

  const token = await getToken({ req });
  if (!token) {
    console.warn("[Gemini][DELETE] Unauthorized request (no token)");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = token.id;
  console.log("[Gemini][DELETE] Authenticated userId:", userId);

  try {
    const res = await Chat.deleteOne({ userId });
    console.log("[Gemini][DELETE] deleteOne result:", res);

    return NextResponse.json({ message: "Chat deleted" }, { status: 200 });
  } catch (error) {
    console.error("[Gemini][DELETE] Error deleting chat:", error?.stack || error);
    return NextResponse.json({ error: "Error deleting chat" }, { status: 500 });
  }
}