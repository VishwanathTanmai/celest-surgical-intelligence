import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const path = request.nextUrl.pathname;

  // 1. Allow public auth routes and landing page
  if (path === "/" || path.startsWith("/auth") || path === "/admin/login") {
    if (session) {
      try {
        const user = await decrypt(session);
        // If already logged in and at root, move to appropriate dashboard
        if (path === "/") {
            const dashboard = user.role === "ADMIN" ? "/admin" : "/dashboard";
            return NextResponse.redirect(new URL(dashboard, request.url));
        }
        // If logged in and at auth pages, move to dashboard
        if (path.startsWith("/auth") || path === "/admin/login") {
            const dashboard = user.role === "ADMIN" ? "/admin" : "/dashboard";
            return NextResponse.redirect(new URL(dashboard, request.url));
        }
      } catch (e) {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // 2. Protect all other routes
  if (!session) {
    // If trying to access admin, go to admin login. Otherwise go to general signin.
    const loginPath = path.startsWith("/admin") ? "/admin/login" : "/auth/signin";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  try {
    const user = await decrypt(session);
    
    // 3. Admin Route Protection
    if (path.startsWith("/admin") && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 4. Force Admin to Admin Dashboard
    if (path === "/" && user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    const loginPath = path.startsWith("/admin") ? "/admin/login" : "/auth/signin";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
