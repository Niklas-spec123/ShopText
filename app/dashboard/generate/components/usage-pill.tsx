"use client";

import { useRouter } from "next/navigation";

type UsagePillProps = {
  used: number;
  limit: number;
  onUpgrade?: () => void;
};

export function UsagePill({ used, limit, onUpgrade }: UsagePillProps) {
  const router = useRouter();

  const isUnlimited = limit === Infinity;
  const percent = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);

  const isNearLimit = !isUnlimited && used / limit >= 0.8;
  const isAtLimit = !isUnlimited && used >= limit;

  function handleClick() {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push("/pricing");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isUnlimited ? "Pro plan" : "View plans"}
      className="
        relative z-50
        pointer-events-auto
        cursor-pointer
        flex items-center gap-3
        rounded-full
        border border-slate-700
        bg-slate-900
        px-3 py-1.5
        text-xs text-slate-200
        hover:bg-slate-800
        transition
      "
    >
      {/* TEXT */}
      <span className="whitespace-nowrap">
        {isUnlimited ? "Unlimited writing" : `${used} of ${limit} writes used`}
      </span>

      {/* PROGRESS */}
      {!isUnlimited && (
        <div className="h-1.5 w-20 rounded-full bg-slate-700 overflow-hidden">
          <div
            className={`h-full transition-all ${
              isAtLimit
                ? "bg-red-500"
                : isNearLimit
                ? "bg-yellow-400"
                : "bg-indigo-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {/* LIMIT LABEL */}
      {isAtLimit && (
        <span className="ml-1 rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-400">
          Limit reached
        </span>
      )}
    </button>
  );
}
