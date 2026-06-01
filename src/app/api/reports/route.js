import { getToken } from "next-auth/jwt";
import connectToDatabase from "@/utils/db";
import Report from "@/models/Report";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { escapeRegExp } from "@/utils/helpers";

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
      const safe = new RegExp(escapeRegExp(search), "i");
      query.$or = [
        { subject: safe },
        { description: safe },
        { to: safe },
        { from: safe },
        { field: safe },
        { code: safe },
        { source: { $elemMatch: { name: safe } } },
        { twoSentencesConclusion: safe },
        { details: { $elemMatch: { $regex: safe } } },
        { notesRecap: safe },
        { notesToDo: safe },
        { notesMonitoring: safe },
        { areaOfReport: safe },
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
