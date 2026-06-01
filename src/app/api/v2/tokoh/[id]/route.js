import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/db";
import Tokoh from "@/models/Tokoh";

export async function GET(req, { params }) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();
  try {
    const tokoh = await Tokoh.findOne({ _id: id, userId: token.sub });
    if (!tokoh) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(tokoh);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();
  try {
    const { name, jabatan } = await req.json();
    const tokoh = await Tokoh.findOne({ _id: id, userId: token.sub });
    if (!tokoh) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (name !== undefined) tokoh.name = name;
    if (jabatan !== undefined) tokoh.jabatan = jabatan;
    await tokoh.save();
    return NextResponse.json(tokoh);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();
  try {
    const tokoh = await Tokoh.findOneAndDelete({ _id: id, userId: token.sub });
    if (!tokoh) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
