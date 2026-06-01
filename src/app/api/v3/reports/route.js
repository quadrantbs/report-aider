import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/db";
import ReportV3 from "@/models/ReportV3";
import { getPreset } from "@/utils/reports-v3/presets";
import { validateBlocks } from "@/utils/reports-v3/validate";

export async function GET(req) {
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  try {
    const reports = await ReportV3.find({ userId: token.sub })
      .select("title presetKey status createdAt updatedAt")
      .sort({ updatedAt: -1 });
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

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const preset = getPreset(body.presetKey);

  // Blocks come from the client (a saved template) or fall back to the preset.
  const rawBlocks = Array.isArray(body.blocks) ? body.blocks : preset.blocks;
  const result = validateBlocks(rawBlocks);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Variables: use what the client seeded (from a template), else the preset defaults.
  let variables = {};
  if (body.variables && typeof body.variables === "object" && !Array.isArray(body.variables)) {
    variables = body.variables;
  } else {
    (preset.defaultVariables || []).forEach((v) => {
      variables[v.key] = v.defaultValue || "";
    });
  }

  await connectToDatabase();
  try {
    const report = await ReportV3.create({
      title,
      presetKey: preset.key,
      blocks: result.blocks,
      variables,
      userId: token.sub,
    });
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
