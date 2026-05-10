import { getToken } from "next-auth/jwt";
import connectToDatabase from "@/utils/db";
import Report from "@/models/Report";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req) {
  const token = await getToken({ req });
  const { ObjectId } = mongoose.Types;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = token.id;

  try {
    await connectToDatabase();

    const {
      search,
      field,
      page = 1,
      limit = 10,
    } = Object.fromEntries(new URL(req.url).searchParams);

    const query = { userId: new ObjectId(userId) };

    if (search) {
      query.$or = [
        { subject: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { to: new RegExp(search, "i") },
        { from: new RegExp(search, "i") },
        { field: new RegExp(search, "i") },
        { code: new RegExp(search, "i") },
        { source: { $elemMatch: { name: new RegExp(search, "i") } } },
        { twoSentencesConclusion: new RegExp(search, "i") },
        { details: { $elemMatch: { $regex: new RegExp(search, "i") } } },
        { notesRecap: new RegExp(search, "i") },
        { notesToDo: new RegExp(search, "i") },
        { notesMonitoring: new RegExp(search, "i") },
        { areaOfReport: new RegExp(search, "i") },
      ];
    }

    if (field) {
      query.field = field;
    }

    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const filterOptions = {
      field: await Report.distinct("field", { userId: new ObjectId(userId) }),
    };

    if (reports.length === 0) {
      return NextResponse.json(
        { message: "No reports found", filterOptions },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReports: total,
        },
        filterOptions,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while fetching reports" },
      { status: 500 }
    );
  }
}
