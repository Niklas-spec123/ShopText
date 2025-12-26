import Link from "next/link";

export default function HistoryItem({ item }: { item: any }) {
  const date = new Date(item.created_at).toLocaleString("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <Link
      href={`/dashboard/history/${item.id}`}
      className="block p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-slate-100 font-medium">{item.title}</h2>
        <span className="text-xs text-slate-500">{date}</span>
      </div>
      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.content}</p>
    </Link>
  );
}
