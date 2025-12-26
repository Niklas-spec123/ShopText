import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { HeaderUsage } from "./components/HeaderUsage";
import { UsageProvider } from "./usage/UsageContext";

import { getGenerationUsage } from "@/lib/usage";
import { getUserProfile } from "@/lib/getProfile";
import { logoutAction } from "@/lib/logoutAction";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { en } from "@/lib/copy/en";

import { NavLink } from "./generate/components/NavLink";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const profile = await getUserProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  // 🔐 Onboarding state (SERVER TRUTH)
  const isOnboarding = profile.onboarding_completed === false;

  // 🚦 Usage only after onboarding is completed
  const generationUsage = isOnboarding ? null : await getGenerationUsage();

  const email = session.user.email;

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col h-screen border-r border-slate-800 bg-slate-950/80">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-slate-800 flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-bold">
            ST
          </div>
          <span className="font-semibold text-slate-50">ShopText</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <NavLink href="/dashboard" label={en.sidebar.overview} />
          <NavLink href="/dashboard/generate" label={en.sidebar.generate} />
          <NavLink href="/dashboard/history" label={en.sidebar.history} />
          <NavLink href="/dashboard/favorites" label={en.sidebar.favorites} />
          <NavLink href="/dashboard/settings" label={en.sidebar.settings} />

          <div className="px-3 pt-4 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {en.sidebar.projectsLabel}
          </div>
          <NavLink href="/dashboard/projects" label={en.sidebar.allProjects} />
        </nav>

        {/* Profile */}
        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-500 space-y-1">
          <p>
            Signed in as <span className="text-slate-300">{email}</span>
          </p>
          <p>
            Plan:{" "}
            <span className="text-emerald-400">
              {profile.effectivePlan ?? "Free"}
            </span>
          </p>

          <form action={logoutAction}>
            <button type="submit" className="hover:underline">
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN */}
      <UsageProvider initialUsage={generationUsage}>
        <main className="flex-1 flex flex-col">
          {/* TOP BAR */}
          <header
            className="
              relative z-40
              h-14
              border-b border-slate-800
              flex items-center justify-between
              px-4
              bg-slate-950/80
              backdrop-blur
            "
          >
            <div /> {/* left spacer */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {/* ✅ Usage pill – only appears after onboarding */}
              {!isOnboarding && <HeaderUsage />}

              <span className="hidden sm:inline">{email}</span>

              <span className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700">
                {profile.effectivePlan ?? "Free"}
              </span>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="ml-2 rounded-md px-2 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition"
                >
                  Log out
                </button>
              </form>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <div className="flex-1 px-4 py-4 md:px-8 md:py-6 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
            {children}
          </div>
        </main>
      </UsageProvider>
    </div>
  );
}
