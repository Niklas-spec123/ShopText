"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  language: "sv" | "en";
};

const tonesSv = ["Säljande", "Minimalistisk", "Lyxig", "Lekfull", "Teknisk", "Storytelling"];
const tonesEn = ["Sales-focused", "Minimalistic", "Premium", "Playful", "Technical", "Storytelling"];

export function ToneSelector({ value, onChange, language }: Props) {
  const tones = language === "sv" ? tonesSv : tonesEn;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {tones.map((tone) => (
        <option key={tone} value={tone}>
          {tone}
        </option>
      ))}
    </select>
  );
}
