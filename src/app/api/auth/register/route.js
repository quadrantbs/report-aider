import user from "@/models/User";
import connectToDatabase from "@/utils/db";
import { NextResponse } from "next/server";


export async function POST(req) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return new NextResponse(
      JSON.stringify({ error: "Username and password are required" }),
      { status: 400 }
    );
  }
  
  await connectToDatabase();

  const existingUser = await user.findOne({ username });
  if (existingUser) {
    return new NextResponse(
      JSON.stringify({ error: "Username already exists" }),
      { status: 400 }
    );
  }

  const newUser = new user({ username, password });
  await newUser.save();

  return new NextResponse(
    JSON.stringify({ success: true, message: "User registered successfully" }),
    { status: 201 }
  );
}
