import connectToDatabase from "@/utils/db";
import Report from "@/models/Report";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req, res) {
  const token = await getToken({ req });
  const { ObjectId } = mongoose.Types;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  if (
    !areaOfReport ||
    !to ||
    !from ||
    !field ||
    !code ||
    !subject ||
    !reportDate ||
    !source ||
    !twoSentencesConclusion ||
    !details ||
    !notesRecap ||
    !notesToDo ||
    !notesMonitoring
  ) {
    return NextResponse.json({ error: "Fill All Input" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const userId = token.id;

    console.log(areaOfReport)

    const newReport = new Report({
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
      userId: new ObjectId(userId),
    });

    console.log("newReport", newReport);

    await newReport.save();

    return NextResponse.json(
      { success: true, message: "Report created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the report" },
      { status: 500 }
    );
  }
}
