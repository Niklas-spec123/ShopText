import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { en } from "@/lib/copy/en";

export default function Page() {
  const t = en.landing;

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

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <a href="#how" className="hover:text-slate-50">
            How it works
          </a>
          <a href="#pricing" className="hover:text-slate-50">
            Pricing
          </a>
          <a href="#faq" className="hover:text-slate-50">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-slate-300">
              Log in
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button>Try it free</Button>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-400 mb-4 uppercase">
            Product descriptions, done.
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-50 mb-4">
            Write product copy for your shop{" "}
            <span className="text-indigo-400">in seconds</span>
          </h1>

          <p className="text-slate-300 mb-6 max-w-xl">
            ShopText helps small store owners write product descriptions, SEO
            titles and ads — without overthinking or wasting time.
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <Link href="/auth/register">
              <Button className="px-6">Start writing for free</Button>
            </Link>

            <a href="#demo">
              <Button variant="secondary" className="px-6">
                See example
              </Button>
            </a>
          </div>

          <p className="text-xs text-slate-500">
            Built for Shopify sellers & side hustlers
          </p>
        </div>

        {/* DEMO */}
        <div id="demo">
          <Card className="relative overflow-hidden">
            <div className="absolute -right-24 -top-24 h-52 w-52 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live example
                </span>
                <span>English</span>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Product input
                </p>
                <p className="text-sm text-slate-200">
                  Black oversized hoodie, unisex, soft cotton. Everyday comfort.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Short description
                </p>
                <p className="text-sm text-slate-100">
                  Soft oversized hoodie made from cotton for everyday comfort
                  and a clean, timeless look.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  SEO title
                </p>
                <p className="text-sm text-slate-100">
                  Black oversized hoodie unisex – soft cotton hoodie
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-6 pb-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Simple workflow</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <h3 className="font-semibold mb-2">1. Describe your product</h3>
            <p className="text-sm text-slate-300">
              Enter the product name and a few details. No prompts to learn.
            </p>
          </Card>

          <Card>
            <h3 className="font-semibold mb-2">2. Generate copy</h3>
            <p className="text-sm text-slate-300">
              Get ready-to-use product descriptions, SEO and ads instantly.
            </p>
          </Card>

          <Card>
            <h3 className="font-semibold mb-2">3. Copy & publish</h3>
            <p className="text-sm text-slate-300">
              Paste directly into Shopify, socials or ads. Done.
            </p>
          </Card>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 pb-20 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
        <p className="text-sm text-slate-400 mb-6">
          Start free. Upgrade only if it saves you time.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* FREE */}
          <Card>
            <p className="text-xs font-semibold text-slate-400 mb-1 uppercase">
              Free
            </p>
            <p className="text-2xl font-bold mb-2">$0</p>
            <ul className="text-sm text-slate-300 space-y-1 mb-4">
              <li>• Limited generations</li>
              <li>• Product descriptions & SEO</li>
              <li>• No credit card required</li>
            </ul>
            <Link href="/auth/register">
              <Button className="w-full" variant="secondary">
                Try for free
              </Button>
            </Link>
          </Card>

          {/* PRO */}
          <Card className="border-indigo-500/70 relative overflow-hidden">
            <div className="absolute right-3 top-3 rounded-full bg-indigo-500/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide">
              Most popular
            </div>
            <p className="text-xs font-semibold text-slate-300 mb-1 uppercase">
              Pro
            </p>
            <p className="text-2xl font-bold mb-2">$15 / month</p>
            <ul className="text-sm text-slate-300 space-y-1 mb-4">
              <li>• Unlimited copy generation</li>
              <li>• Projects & favorites</li>
              <li>• Copy and reuse content</li>
            </ul>
            <Link href="/auth/register">
              <Button className="w-full">Upgrade to Pro</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="faq"
        className="border-t border-slate-800/80 px-6 py-6 text-xs text-slate-500"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} ShopText. All rights reserved.</p>
          <span>Built for small online stores</span>
        </div>
      </footer>
    </main>
  );
}
