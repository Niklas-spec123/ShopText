"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  // 🔐 Check auth state (client-side, read-only)
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-bold">
            ST
          </div>
          <span className="font-semibold tracking-tight text-slate-50">
            ShopText
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-300">
                Go to dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-slate-300">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button>Start free</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="px-6 py-16 md:py-24 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-50 mb-4">
          Spend less time writing.
          <br className="hidden sm:block" />
          Spend more time selling.
        </h1>
        <p className="text-slate-300 max-w-xl mx-auto">
          Start free. Upgrade only if ShopText saves you time.
        </p>
      </section>

      {/* PRICING */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* FREE */}
          <Card className="p-6">
            <p className="text-xs font-semibold text-slate-400 mb-1 uppercase">
              Free
            </p>
            <p className="text-3xl font-bold mb-2">$0</p>
            <p className="text-sm text-slate-400 mb-6">
              Perfect for trying ShopText on a few products.
            </p>

            <ul className="text-sm text-slate-300 space-y-2 mb-6">
              <li>• Write product descriptions in seconds</li>
              <li>• Short & long descriptions</li>
              <li>• Basic SEO titles</li>
              <li>• English & Swedish output</li>
              <li>• No credit card required</li>
            </ul>

            <Link href={isLoggedIn ? "/dashboard" : "/auth/register"}>
              <Button variant="secondary" className="w-full">
                {isLoggedIn ? "Go to dashboard" : "Start free"}
              </Button>
            </Link>
          </Card>

          {/* PRO */}
          <Card className="p-6 border-indigo-500/70 relative overflow-hidden">
            <div className="absolute right-3 top-3 rounded-full bg-indigo-500/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide">
              Most popular
            </div>

            <p className="text-xs font-semibold text-slate-300 mb-1 uppercase">
              Pro
            </p>
            <p className="text-3xl font-bold mb-1">$15 / month</p>
            <p className="text-xs text-slate-500 mb-4">
              Cheaper than hiring a copywriter for one product
            </p>

            <p className="text-sm text-slate-400 mb-6">
              For store owners who add products regularly and want
              ready-to-publish copy.
            </p>

            <ul className="text-sm text-slate-300 space-y-2 mb-6">
              <li>• Unlimited product descriptions</li>
              <li>• Full SEO (titles, meta & keywords)</li>
              <li>• Instagram captions & ad copy</li>
              <li>• Organize copy with projects & favorites</li>
              <li>• Reuse your copy anytime</li>
            </ul>

            <Button
              className="w-full"
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading ? "Redirecting to checkout…" : "Upgrade to Pro"}
            </Button>

            <p className="text-xs text-slate-500 text-center mt-3">
              Cancel anytime · No commitment
            </p>
          </Card>
        </div>

        {/* TRUST */}
        <div className="text-center mt-12 text-sm text-slate-400">
          Most users upgrade after their first few products.
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 px-6 py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} ShopText. All rights reserved.</p>
          <span>Built for small online stores</span>
        </div>
      </footer>
    </main>
  );
}
