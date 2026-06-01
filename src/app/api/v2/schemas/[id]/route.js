import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/db";
import ReportSchema from "@/models/ReportSchema";

export async function GET(req, { params }) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();
  try {
    const schema = await ReportSchema.findOne({ _id: id, userId: token.sub });
    if (!schema) {
      return NextResponse.json({ error: "Schema not found" }, { status: 404 });
    }
    return NextResponse.json(schema);
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
  await connectToDatabase();
  try {
    const body = await req.json();
    const { name, description, structure, version, isPublic, defaultVariables } = body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (structure !== undefined) updates.structure = structure;
    if (version !== undefined) updates.version = version;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (defaultVariables !== undefined) updates.defaultVariables = defaultVariables;
    const schema = await ReportSchema.findOneAndUpdate(
      { _id: id, userId: token.sub },
      { $set: updates },
      { new: true }
    );
    if (!schema) {
      return NextResponse.json({ error: "Schema not found" }, { status: 404 });
    }
    return NextResponse.json(schema);
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
    const schema = await ReportSchema.findOneAndDelete({
      _id: id,
      userId: token.sub,
    });
    if (!schema) {
      return NextResponse.json({ error: "Schema not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Schema deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
