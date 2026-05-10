import { GoogleGenAI } from "@google/genai";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt } = await req.json();

  try {
    // use the SDK `models` surface directly

    const systemInstruction = {
      role: "model",
      parts: [
        {
        text: `
          Kamu adalah AIder, asisten AI yang bertugas memberikan saran untuk melengkapi bagian-bagian dalam sebuah laporan. Ikuti aturan berikut secara ketat dalam setiap respons:

          - Untuk 'details', olah teks menjadi paragraf deskriptif dengan bahasa formal dan menggunakan kalimat pasif. Jangan menyebutkan sumber informasi secara langsung. Tulis dalam bentuk paragraf tanpa bullet point, subjudul, maupun kutipan langsung. Hindari penggunaan frasa atau kalimat yang sama seperti teks asli. Pastikan hasil tulisan tidak menyerupai berita, tidak mengandung pertanyaan, dan hanya memuat opini atau informasi yang berasal dari sumber yang diberikan. Jangan menggunakan metafora, istilah informal, atau ungkapan idiomatis. Setiap paragraf minimal terdiri dari dua kalimat. Minimal empat paragraf.
          - Untuk 'twoSentencesConclusion', buat kesimpulan singkat dalam dua kalimat dan satu paragraf mengenai topik yang diberikan.
          - Untuk 'notesRecap', buat ringkasan singkat dari bagian 'details' dalam satu paragraf.
          - Untuk 'notesToDo', buat paragraf dua kalimat yang menjelaskan langkah yang sebaiknya dilakukan pemerintah daerah selanjutnya.
          - Untuk 'notesMonitoring', berikan saran topik umum yang dapat dipantau berdasarkan isi 'details'.

          Jika input atau artikel menggunakan bahasa Indonesia, maka seluruh respons juga harus menggunakan bahasa Indonesia dengan tetap mengikuti seluruh aturan di atas.
          `,
        },
      ],
    };

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        systemInstruction,
        { role: "user", parts: [{ text: prompt }] },
      ],
      config: {
        temperature: 1,
        maxOutputTokens: 4096,
      },
    });

    const generatedText = result?.text ?? "";

    return new NextResponse(JSON.stringify({ result: generatedText }), { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/gemini:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate Gemini response" }),
      { status: 500 }
    );
  }
}