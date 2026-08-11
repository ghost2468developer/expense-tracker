"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_ICON } from "@/lib/categories";
import { formatRands, formatSaDate } from "@/lib/format";
import type { TransactionRow } from "@/lib/queries";

export default function TransactionList({
  transactions,
}: {
  transactions: TransactionRow[];
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
        <span className="text-4xl">🧾</span>
        <p className="mt-3 text-sm font-medium text-slate-700">
          No transactions yet
        </p>
        <p className="mt-1 max-w-xs text-xs text-slate-500">
          Add your salary or an expense using the form to start tracking in
          Rand.
        </p>
      </div>
    );
  }

  function handleDelete(id: number, type: "income" | "expense") {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await fetch(`/api/transactions/${id}?type=${type}`, {
          method: "DELETE",
        });
        router.refresh();
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <ul className="divide-y divide-slate-100">
      {transactions.map((t) => {
        const isIncome = t.type === "income";
            const removing = deletingId === t.id;
        return (
          <li
            key={t.id}
            className={`flex items-center gap-3 py-3 transition-opacity ${
              removing ? "opacity-40" : "opacity-100"
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
                isIncome ? "bg-emerald-50" : "bg-rose-50"
              }`}
            >
              {CATEGORY_ICON[t.category] ?? "✨"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {t.title}
              </p>
              <p className="truncate text-xs text-slate-500">
                {t.category} · {formatSaDate(t.occurredOn)}
              </p>
            </div>

            <div className="text-right">
              <p
                className={`text-sm font-bold tabular-nums ${
                  isIncome ? "text-emerald-600" : "text-slate-900"
                }`}
              >
                {isIncome ? "+" : "−"}
                {formatRands(t.amount)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(t.id, isIncome ? "income" : "expense")}
              aria-label="Delete transaction"
              className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.5H3.5a.75.75 0 0 0 0 1.5h13a.75.75 0 0 0 0-1.5H14v-.5A2.75 2.75 0 0 0 11.25 1h-2.5ZM7.5 4.25v-.5c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v.5h-5Z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M5.28 7.22a.75.75 0 0 0-.78.83l.7 7.42A2.75 2.75 0 0 0 7.94 18h4.12a2.75 2.75 0 0 0 2.74-2.53l.7-7.42a.75.75 0 0 0-1.49-.14l-.7 7.42c-.06.6-.56 1.07-1.17 1.07H7.94c-.6 0-1.11-.47-1.17-1.07l-.7-7.42a.75.75 0 0 0-.79-.69Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
