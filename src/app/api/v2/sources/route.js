import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/db";
import TextSource from "@/models/TextSource";

export async function GET(req) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  try {
    const sources = await TextSource.find({ userId: token.sub }).sort({
      createdAt: -1,
    });
    return NextResponse.json(sources);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  try {
    const body = await req.json();
    const source = await TextSource.create({
      ...body,
      userId: token.sub,
    });
    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
