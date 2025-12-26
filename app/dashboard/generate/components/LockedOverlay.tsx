export function LockedOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-center px-6">
      <h2 className="text-sm font-semibold mb-2 text-slate-100">
        Free limit reached
      </h2>
      <p className="text-xs text-slate-400 mb-4">
        You’ve used all free generations. Upgrade to Pro to keep generating
        product copy.
      </p>
      <button
        className="px-4 py-2 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-200"
        type="button"
      >
        Upgrade to Pro
      </button>
    </div>
  );
}
