import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/db";
import Tokoh from "@/models/Tokoh";

export async function GET(req) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  try {
    const tokoh = await Tokoh.find({ userId: token.sub }).sort({ name: 1 });
    return NextResponse.json(tokoh);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  try {
    const { name, jabatan } = await req.json();
    const tokoh = new Tokoh({ name, jabatan, userId: token.sub });
    await tokoh.save();
    return NextResponse.json(tokoh, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
