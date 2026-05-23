import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/db";
import ReportV2 from "@/models/ReportV2";

export async function GET(req, { params }) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();
  try {
    const report = await ReportV2.findOne({ _id: id, userId: token.sub })
      .populate("schemaId")
      .populate("globalSourceIds")
      .populate("parts.sourceIds");
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();
  try {
    const { title, globalSourceIds, parts, data, status, variables } = await req.json();
    const report = await ReportV2.findOneAndUpdate(
      { _id: id, userId: token.sub },
      { $set: { title, globalSourceIds, parts, data, status, variables } },
      { new: true, runValidators: true }
    );
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    const report = await ReportV2.findOneAndDelete({
      _id: id,
      userId: token.sub,
    });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Report deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
