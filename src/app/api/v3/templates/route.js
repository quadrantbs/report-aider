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

export async function GET(req) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  try {
    const templates = await ReportV3Template.find({
      $or: [{ userId: token.sub }, { isPublic: true }],
    }).sort({ updatedAt: -1 });
    return NextResponse.json(templates);
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

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const result = validateBlocks(Array.isArray(body.blocks) ? body.blocks : []);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await connectToDatabase();
  try {
    const template = await ReportV3Template.create({
      name,
      description: String(body.description || ""),
      blocks: result.blocks,
      defaultVariables: cleanVariables(body.defaultVariables),
      isPublic: !!body.isPublic,
      userId: token.sub,
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
