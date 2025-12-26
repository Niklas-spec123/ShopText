"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { en } from "@/lib/copy/en";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const result = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (result.error) {
      const msg = result.error.message.toLowerCase();

      if (msg.includes("invalid")) {
        setError("Invalid email or password.");
      } else if (msg.includes("already")) {
        setError("This email address is already in use.");
      } else if (msg.includes("password")) {
        setError("Password is too weak (minimum 6 characters).");
      } else {
        setError(
          isLogin
            ? "Login failed. Please try again."
            : "Could not create account. Please try again."
        );
      }

      setLoading(false);
      return;
    }

    // ✅ Success
    setSuccess(true);

    setTimeout(
      () => {
        router.push("/dashboard");
      },
      isLogin ? 0 : 1200
    ); // register shows success briefly
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md p-6 space-y-6 bg-slate-900 border border-slate-800">
        <h1 className="text-xl font-semibold text-slate-50 text-center">
          {isLogin ? en.auth.login.title : en.auth.register.title}
        </h1>

        {/* ❌ Error */}
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {/* ✅ Success (register only) */}
        {!isLogin && success && (
          <p className="text-emerald-400 text-sm text-center">
            ✅ Account created! Signing you in…
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs text-slate-400">
              {isLogin ? en.auth.login.email : en.auth.register.email}
            </label>
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="mt-1"
              required
              disabled={loading || success}
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">
              {isLogin ? en.auth.login.password : en.auth.register.password}
            </label>
            <Input
              type="password"
              name="password"
              placeholder={isLogin ? "••••••••" : "Minimum 6 characters"}
              className="mt-1"
              required
              disabled={loading || success}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {isLogin ? "Logging in…" : "Creating account…"}
              </>
            ) : success ? (
              "Done ✓"
            ) : isLogin ? (
              en.auth.login.submit
            ) : (
              en.auth.register.submit
            )}
          </Button>
        </form>

        <p className="text-slate-400 text-xs text-center">
          {isLogin ? (
            <>
              {en.auth.login.noAccount}{" "}
              <a
                href="/auth/register"
                className="text-indigo-400 hover:underline"
              >
                {en.auth.login.createAccount}
              </a>
            </>
          ) : (
            <>
              {en.auth.register.haveAccount}{" "}
              <a href="/auth/login" className="text-indigo-400 hover:underline">
                {en.auth.register.login}
              </a>
            </>
          )}
        </p>
      </Card>
    </div>
  );
}
