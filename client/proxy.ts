import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isLogin = req.nextUrl.pathname === "/";

  if (isDashboard && !refreshToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isLogin && refreshToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/"],
};
