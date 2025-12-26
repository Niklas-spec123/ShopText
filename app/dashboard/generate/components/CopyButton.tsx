"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-[11px] rounded-full border border-slate-700 px-3 py-1 text-slate-300 hover:bg-slate-900"
    >
      {copied ? "Kopierat ✓" : "Kopiera alla"}
    </button>
  );
}
