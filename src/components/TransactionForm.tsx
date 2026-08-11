"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TxType } from "@/lib/categories";

type Errors = Partial<
  Record<"title" | "category" | "amount" | "occurredOn" | "form", string>
>;

export default function TransactionForm() {
  const router = useRouter();
  const [type, setType] = useState<TxType>("expense");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [occurredOn, setOccurredOn] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const categories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const form = new FormData();
    form.set("type", type);
    form.set("title", title);
    form.set("category", category);
    form.set("amount", amount);
    form.set("occurredOn", occurredOn);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors ?? { form: data.error ?? "Could not save." });
        return;
      }

      // Reset fields but keep the type + date for quick entry.
      setTitle("");
      setCategory("");
      setAmount("");
      router.refresh();
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
        <button
          type="button"
          onClick={() => {
            setType("expense");
            setCategory("");
          }}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            type === "expense"
              ? "bg-white text-rose-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          − Expense
        </button>
        <button
          type="button"
          onClick={() => {
            setType("income");
            setCategory("");
          }}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            type === "income"
              ? "bg-white text-emerald-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          + Salary / Income
        </button>
      </div>

      {/* Amount */}
      <div>
        <label
          htmlFor="amount"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Amount (R)
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">
            R
          </span>
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full rounded-xl border bg-white py-3 pl-9 pr-4 text-lg font-semibold text-slate-900 outline-none transition focus:ring-2 ${
              errors.amount
                ? "border-rose-400 focus:ring-rose-200"
                : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
            }`}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-rose-600">{errors.amount}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="title"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {type === "income" ? "Income source" : "What was it for?"}
        </label>
        <input
          id="title"
          type="text"
          placeholder={
            type === "income"
              ? "e.g. Monthly salary"
              : "e.g. Pick n Pay groceries"
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
            errors.title
              ? "border-rose-400 focus:ring-rose-200"
              : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-rose-600">{errors.title}</p>
        )}
      </div>

      {/* Category + Date */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="category"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
              errors.category
                ? "border-rose-400 focus:ring-rose-200"
                : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
            }`}
          >
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-rose-600">{errors.category}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="occurredOn"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Date
          </label>
          <input
            id="occurredOn"
            type="date"
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
              errors.occurredOn
                ? "border-rose-400 focus:ring-rose-200"
                : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
            }`}
          />
          {errors.occurredOn && (
            <p className="mt-1 text-xs text-rose-600">{errors.occurredOn}</p>
          )}
        </div>
      </div>

      {errors.form && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errors.form}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
          type === "income"
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-rose-600 hover:bg-rose-700"
        }`}
      >
        {submitting
          ? "Saving…"
          : type === "income"
            ? "Add salary / income"
            : "Add expense"}
      </button>
    </form>
  );
}
