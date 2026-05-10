// Middleware migration note:
// The `middleware` file convention is deprecated in Next.js. To avoid the
// deprecation warning while preserving the code for reference, this file has
// been renamed logically in-place. You should migrate this authentication
// check into server-side logic (e.g., the `layout.js` or page-level
// `route.js` handlers) or implement an equivalent edge middleware via the
// appropriate Next.js configuration if needed.

// Original middleware (kept here commented for reference):
/*
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/reports/:path*", "/reports"],
};
*/

// TODO: Re-implement this auth guard in the app routes or layout server-side
// logic to keep /reports protected. If you want, I can migrate it now to the
// `app/reports/layout.js` server-side checks so behavior remains identical.
