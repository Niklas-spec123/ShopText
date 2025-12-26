import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ children, className, variant = "primary", ...rest }: Props) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-50 border border-slate-700",
    ghost: "bg-transparent hover:bg-slate-900 text-slate-200"
  }[variant];
  return (
    <button className={clsx(base, styles, className)} {...rest}>
      {children}
    </button>
  );
}
