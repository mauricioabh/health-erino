import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedPage = createRouteMatcher(["/admin(.*)", "/chat"]);
const isProtectedApi = createRouteMatcher(["/api/chat"]);
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

  if (isPublicRoute(req)) {
    return;
  }

  if (isProtectedApi(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, max-age=0, must-revalidate",
          },
        },
      );
    }
    return;
  }

  if (isProtectedPage(req)) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      // Avoid auth.protect() rewrite-to-/404 (gets CDN-cached as a permanent HIT).
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|pwa/|api/).*)",
    "/(api|trpc)(.*)",
  ],
};
