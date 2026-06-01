import user from "@/models/User";
import connectToDatabase from "@/utils/db";
import { NextResponse } from "next/server";


export async function POST(req) {
  const body = await req.json();
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return new NextResponse(
      JSON.stringify({ error: "Username and password are required" }),
      { status: 400 }
    );
  }

  if (username.length < 3 || username.length > 32) {
    return new NextResponse(
      JSON.stringify({ error: "Username must be between 3 and 32 characters" }),
      { status: 400 }
    );
  }

  // bcrypt silently truncates passwords longer than 72 bytes, so cap the length.
  if (password.length < 8 || password.length > 72) {
    return new NextResponse(
      JSON.stringify({ error: "Password must be between 8 and 72 characters" }),
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

  try {
    const newUser = new user({ username, password });
    await newUser.save();
  } catch (error) {
    // Handle the unique-index race where two requests register the same username.
    if (error?.code === 11000) {
      return new NextResponse(
        JSON.stringify({ error: "Username already exists" }),
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }

  return new NextResponse(
    JSON.stringify({ success: true, message: "User registered successfully" }),
    { status: 201 }
  );
}
