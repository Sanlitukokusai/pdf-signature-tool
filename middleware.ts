import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtected = protectedRoutes.some((r) => path.startsWith(r));
  const isPublic = publicRoutes.some((r) => path.startsWith(r));

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  // Redirect unauthenticated users to login
  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect authenticated users away from login page
  if (isPublic && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Redirect root to dashboard or login
  if (path === "/") {
    if (session?.userId) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    } else {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|favicon\\.ico).*)"],
};
