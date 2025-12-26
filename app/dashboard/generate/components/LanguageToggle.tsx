"use client";

type Props = {
  value: "sv" | "en";
  onChange: (value: "sv" | "en") => void;
};

export function LanguageToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-full bg-slate-900 p-1 text-xs border border-slate-700">
      <button
        type="button"
        onClick={() => onChange("sv")}
        className={`px-3 py-1 rounded-full transition ${
          value === "sv" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-100"
        }`}
      >
        🇸🇪 Svenska
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`px-3 py-1 rounded-full transition ${
          value === "en" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-100"
        }`}
      >
        🇬🇧 English
      </button>
    </div>
  );
}
