"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();

  const isActive =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={clsx(
        "block rounded-lg px-3 py-2 text-sm transition",
        isActive
          ? "bg-slate-900 text-white"
          : "text-slate-300 hover:bg-slate-900 hover:text-white"
      )}
    >
      {label}
    </Link>
  );
}
