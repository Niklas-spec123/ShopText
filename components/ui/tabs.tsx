"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import clsx from "clsx";

export function Tabs({
  tabs,
  initial,
}: {
  tabs: { id: string; label: string; content: ReactNode }[];
  initial?: string;
}) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);
  return (
    <div>
      <div className="mb-3 flex gap-2 border-b border-slate-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              active === tab.id
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {tabs.map((tab) =>
          tab.id === active ? (
            <div key={tab.id}>
              {tab.content}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
