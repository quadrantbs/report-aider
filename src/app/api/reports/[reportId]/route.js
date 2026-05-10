import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Report from "@/models/Report";
import connectToDatabase from "@/utils/db";
import { getToken } from "next-auth/jwt";

export async function GET(req, { params }) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { reportId } = await params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return NextResponse.json(
        { success: false, message: "Invalid report ID" },
        { status: 400 }
      );
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { reportId } = await params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return NextResponse.json(
        { success: false, message: "Invalid report ID" },
        { status: 400 }
      );
    }

    await Report.findByIdAndDelete(reportId);

    return NextResponse.json({ success: true, message: "Report deleted" });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { reportId } = await params;
    const {
      areaOfReport,
      to,
      cc,
      from,
      field,
      code,
      subject,
      reportDate,
      source,
      twoSentencesConclusion,
      details,
      notesRecap,
      notesToDo,
      notesMonitoring,
    } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return NextResponse.json(
        { success: false, message: "Invalid report ID" },
        { status: 400 }
      );
    }

    await Report.findByIdAndUpdate(reportId, {
      areaOfReport,
      to,
      cc,
      from,
      field,
      code,
      subject,
      reportDate,
      source,
      twoSentencesConclusion,
      details,
      notesRecap,
      notesToDo,
      notesMonitoring,
    });

    return NextResponse.json({ success: true, message: "Report updated" });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
