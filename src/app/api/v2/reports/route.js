import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/db";
import ReportV2 from "@/models/ReportV2";

export async function GET(req) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  try {
    const reports = await ReportV2.find({ userId: token.sub })
      .populate("schemaId", "name")
      .sort({ createdAt: -1 });
    return NextResponse.json(reports);
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
    const report = await ReportV2.create({
      ...body,
      userId: token.sub,
    });
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
