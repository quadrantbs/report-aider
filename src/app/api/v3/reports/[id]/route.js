import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/db";
import ReportV3 from "@/models/ReportV3";
import { validateBlocks } from "@/utils/reports-v3/validate";

export async function GET(req, { params }) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();
  try {
    const report = await ReportV3.findOne({ _id: id, userId: token.sub })
      .populate("globalSourceIds");
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json(report);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates = {};
  if (body.title !== undefined) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    updates.title = title;
  }
  if (body.blocks !== undefined) {
    const result = validateBlocks(body.blocks);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    updates.blocks = result.blocks;
  }
  if (body.variables !== undefined) updates.variables = body.variables;
  if (body.globalSourceIds !== undefined) updates.globalSourceIds = body.globalSourceIds;
  if (body.status !== undefined) updates.status = body.status;

  await connectToDatabase();
  try {
    const report = await ReportV3.findOneAndUpdate(
      { _id: id, userId: token.sub },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json(report);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();
  try {
    const report = await ReportV3.findOneAndDelete({ _id: id, userId: token.sub });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Report deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
