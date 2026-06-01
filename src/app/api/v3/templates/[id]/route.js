import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/db";
import ReportV3Template from "@/models/ReportV3Template";
import { validateBlocks } from "@/utils/reports-v3/validate";

const cleanVariables = (vars) =>
  Array.isArray(vars)
    ? vars.map((v) => ({
        key: String(v?.key || "").trim(),
        label: String(v?.label || ""),
        defaultValue: String(v?.defaultValue || ""),
      }))
    : [];

export async function GET(req, { params }) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();
  try {
    const template = await ReportV3Template.findOne({
      _id: id,
      $or: [{ userId: token.sub }, { isPublic: true }],
    });
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json(template);
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
  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    updates.name = name;
  }
  if (body.description !== undefined) updates.description = String(body.description || "");
  if (body.blocks !== undefined) {
    const result = validateBlocks(body.blocks);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    updates.blocks = result.blocks;
  }
  if (body.defaultVariables !== undefined) updates.defaultVariables = cleanVariables(body.defaultVariables);
  if (body.isPublic !== undefined) updates.isPublic = !!body.isPublic;

  await connectToDatabase();
  try {
    const template = await ReportV3Template.findOneAndUpdate(
      { _id: id, userId: token.sub },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json(template);
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
    const template = await ReportV3Template.findOneAndDelete({ _id: id, userId: token.sub });
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Template deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
