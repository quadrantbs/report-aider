import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/db";
import ReportSchema from "@/models/ReportSchema";

export async function GET(req) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  try {
    const schemas = await ReportSchema.find({
      $or: [{ userId: token.sub }, { isPublic: true }],
    }).sort({ createdAt: -1 });
    return NextResponse.json(schemas);
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
    const schema = new ReportSchema({ ...body, userId: token.sub });
    schema.markModified("structure");
    await schema.save();
    return NextResponse.json(schema, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
