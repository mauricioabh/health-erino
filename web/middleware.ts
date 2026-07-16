import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/chat",
  "/api/chat",
]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/offline",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/debug/sentry",
]);

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;
  if (path === "/") {
    const { userId } = await auth();
    if (userId) return NextResponse.redirect(new URL("/admin", req.url));
  }
  if (!isPublicRoute(req) && isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|pwa/|api/).*)",
    "/(api|trpc)(.*)",
  ],
};
