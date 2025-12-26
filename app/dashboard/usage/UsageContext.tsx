"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type UsageState = {
  used: number;
  limit: number;
};

type UsageContextValue = {
  usage: UsageState | null;
  increment: () => void;
  rollback: () => void;
  setUsage: (usage: UsageState | null) => void;
};

const UsageContext = createContext<UsageContextValue | null>(null);

export function UsageProvider({
  initialUsage,
  children,
}: {
  initialUsage: UsageState | null;
  children: ReactNode;
}) {
  const [usage, setUsage] = useState<UsageState | null>(initialUsage);

  // ✅ KRITISK FIX:
  // Synca client state när servern skickar ny usage (t.ex. plan → pro)
  useEffect(() => {
    setUsage(initialUsage);
  }, [initialUsage]);

  function increment() {
    setUsage((prev) => (prev ? { ...prev, used: prev.used + 1 } : prev));
  }

  function rollback() {
    setUsage((prev) =>
      prev ? { ...prev, used: Math.max(prev.used - 1, 0) } : prev
    );
  }

  return (
    <UsageContext.Provider value={{ usage, increment, rollback, setUsage }}>
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  const ctx = useContext(UsageContext);
  if (!ctx) {
    throw new Error("useUsage must be used inside UsageProvider");
  }
  return ctx;
}
