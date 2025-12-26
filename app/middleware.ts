// app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-middleware";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(req, res);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;

  // 🔒 Protect dashboard routes
  if (!user && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 🚀 Onboarding enforcement (only AFTER auth is confirmed)
  if (user && path.startsWith("/dashboard")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    const isOnboarding = profile?.onboarding_completed === false;

    if (isOnboarding) {
      if (path !== "/dashboard/generate") {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard/generate";
        url.search = "?onboarding=1";
        return NextResponse.redirect(url);
      }

      if (req.nextUrl.searchParams.get("onboarding") !== "1") {
        const url = req.nextUrl.clone();
        url.searchParams.set("onboarding", "1");
        return NextResponse.redirect(url);
      }
    } else if (
      path === "/dashboard/generate" &&
      req.nextUrl.searchParams.get("onboarding") === "1"
    ) {
      const url = req.nextUrl.clone();
      url.searchParams.delete("onboarding");
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
