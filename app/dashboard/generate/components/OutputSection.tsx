"use client";

import { useState } from "react";

export function OutputSection({
  title,
  type,
  content,
  productData,
  hasContent,
  onUpdate,
}: {
  title: string;
  type: string;
  content: string;
  productData: any;
  hasContent: boolean;
  onUpdate: (value: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function regenerate() {
    if (!hasContent || loading) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/generate/redo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          ...productData,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Couldn’t regenerate the text.");
        setLoading(false);
        return;
      }

      if (data.result !== undefined) {
        onUpdate(data.result);
      } else {
        setErrorMsg("Unexpected response from the server.");
      }
    } catch (err: any) {
      setErrorMsg("Network error. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="relative space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{title}</h3>
      </div>

      {/* Error message */}
      {errorMsg && <div className="text-red-400 text-sm">{errorMsg}</div>}

      {/* Content box */}
      <div className="relative bg-slate-900 border border-slate-700 p-4 rounded-lg whitespace-pre-line min-h-[80px]">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full"></span>
              Generating a new version…
            </div>
          </div>
        )}

        {!loading && content}
      </div>
    </div>
  );
}
