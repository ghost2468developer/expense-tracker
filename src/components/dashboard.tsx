"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/types";
import { CATEGORIES, CATEGORY_COLORS, INPUT_CLASS, LABEL_CLASS } from "@/lib/constants";
import { formatEntryDate, formatZar, todayIsoDate } from "@/lib/money";
import type { MoneyType, Transaction } from "@/lib/transactions";

type Filter = "all" | MoneyType;

type FormState = {
  description: string;
  category: string;
  type: MoneyType;
  amount: string;
  occurredOn: string;
};

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: string;
  accent: "emerald" | "rose" | "sky";
}) {
  const accents = {
    emerald: "text-emerald-300 bg-emerald-400/15",
    rose: "text-rose-300 bg-rose-400/15",
    sky: "text-sky-300 bg-sky-400/15",
  };

  return (
    <div className="glass rise rounded-2xl p-5 shadow-xl shadow-black/20 transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${accents[accent]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-50">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

export function Dashboard({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [entries, setEntries] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FormState>({
    description: "",
    category: "",
    type: "expense",
    amount: "",
    occurredOn: todayIsoDate(),
  });

  async function loadEntries() {
    const response = await fetch("/api/transactions", { cache: "no-store", credentials: "include" });
    if (response.status === 401) {
      router.push("/login");
      router.refresh();
      return;
    }
    if (!response.ok) {
      setError("Could not load entries");
      setLoading(false);
      return;
    }
    setEntries(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    void loadEntries();
  }, []);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const entry of entries) {
      if (entry.type === "income") income += entry.amount;
      else expense += entry.amount;
    }
    return { income, expense, balance: income - expense };
  }, [entries]);

  const spendByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of entries) {
      if (entry.type !== "expense") continue;
      map.set(entry.category, (map.get(entry.category) ?? 0) + entry.amount);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (filter !== "all" && entry.type !== filter) return false;
      if (!needle) return true;
      return `${entry.description} ${entry.category}`.toLowerCase().includes(needle);
    });
  }, [entries, filter, query]);

  const categoryOptions = useMemo(() => {
    return [...new Set([...CATEGORIES, ...entries.map((entry) => entry.category)])];
  }, [entries]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not save entry");
      return;
    }
    setForm((current) => ({ ...current, description: "", category: "", amount: "" }));
    await loadEntries();
  }

  async function onDelete(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    await fetch(`/api/transactions/${id}`, { method: "DELETE", credentials: "include" });
  }

  async function onSignOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/");
    router.refresh();
  }

  const savingsRate = totals.income > 0 ? Math.max(0, (totals.balance / totals.income) * 100) : 0;
  const incomeCount = entries.filter((entry) => entry.type === "income").length;
  const expenseCount = entries.filter((entry) => entry.type === "expense").length;

  return (
    <main className="aurora min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <header className="rise mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live · South African Rand
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Randly<span className="text-emerald-400">.</span>
            </h1>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              Your own numbers, nothing pre-filled. Capture every rand in and out.
            </p>
          </div>
          <div className="flex flex-wrap items-stretch gap-3">
            <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Signed in</p>
                <p className="max-w-[10rem] truncate text-sm font-medium text-slate-100">{user.name}</p>
              </div>
              <button
                type="button"
                onClick={() => void onSignOut()}
                disabled={signingOut}
                className="shrink-0 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-500/20 hover:text-rose-100 disabled:opacity-50"
              >
                {signingOut ? "Logging out…" : "Logout"}
              </button>
            </div>
            <div className="glass rounded-2xl px-5 py-4 text-right">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Net balance</p>
              <p
                className={`text-3xl font-bold tabular-nums ${
                  totals.balance >= 0 ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {formatZar(totals.balance)}
              </p>
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Money in"
            value={formatZar(totals.income)}
            accent="emerald"
            icon="↑"
            sub={`${incomeCount} entries`}
          />
          <StatCard
            label="Money out"
            value={formatZar(totals.expense)}
            accent="rose"
            icon="↓"
            sub={`${expenseCount} entries`}
          />
          <StatCard
            label="Savings rate"
            value={`${savingsRate.toFixed(0)}%`}
            accent="sky"
            icon="◎"
            sub={totals.income > 0 ? "of money in" : "add income to calculate"}
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form onSubmit={onSubmit} className="glass rise h-fit rounded-3xl p-6 shadow-2xl shadow-black/30">
            <h2 className="mb-1 text-lg font-semibold">Add an entry</h2>
            <p className="mb-5 text-xs text-slate-400">Everything is stored in your database.</p>
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
              {(["expense", "income"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, type }))}
                  className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
                    form.type === type
                      ? type === "income"
                        ? "bg-emerald-400/20 text-emerald-300 shadow-inner"
                        : "bg-rose-400/20 text-rose-300 shadow-inner"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <div>
                <label className={LABEL_CLASS}>Description</label>
                <input
                  className={INPUT_CLASS}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Groceries at Checkers"
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Amount</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    R
                  </span>
                  <input
                    className={`${INPUT_CLASS} pl-8 text-lg font-semibold tabular-nums`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Category</label>
                  <input
                    className={INPUT_CLASS}
                    list="cats"
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                    placeholder="General"
                  />
                  <datalist id="cats">
                    {categoryOptions.map((category) => (
                      <option value={category} key={category} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Date</label>
                  <input
                    className={INPUT_CLASS}
                    type="date"
                    value={form.occurredOn}
                    onChange={(event) => setForm((current) => ({ ...current, occurredOn: event.target.value }))}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.slice(0, 5).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, category }))}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-slate-400 transition hover:border-emerald-400/40 hover:text-emerald-300"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            {error ? (
              <p className="mt-4 rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            ) : null}
            <button
              disabled={saving}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Add entry"}
            </button>
          </form>

          <div className="space-y-6">
            <section className="glass rise overflow-hidden rounded-3xl shadow-2xl shadow-black/30">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
                <h2 className="text-lg font-semibold">Entries</h2>
                <div className="flex items-center gap-2">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search…"
                    className="w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-400/50 sm:w-44"
                  />
                  <div className="flex rounded-lg bg-white/5 p-0.5">
                    {(["all", "income", "expense"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFilter(value)}
                        className={`rounded-md px-2.5 py-1 text-xs capitalize transition ${
                          filter === value ? "bg-white/10 text-slate-100" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="space-y-2 p-5">
                  {[0, 1, 2].map((key) => (
                    <div key={key} className="h-12 animate-pulse rounded-xl bg-white/5" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                    🪙
                  </div>
                  <p className="font-medium text-slate-200">
                    {entries.length === 0 ? "No entries yet" : "Nothing matches that filter"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {entries.length === 0
                      ? "Add your first income or expense on the left."
                      : "Try a different search or filter."}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {visible.map((entry) => (
                    <li
                      key={entry.id}
                      className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-white/5"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          entry.type === "income"
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-rose-400/15 text-rose-300"
                        }`}
                      >
                        {entry.type === "income" ? "↑" : "↓"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-100">{entry.description}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-white/5 px-2 py-0.5">{entry.category}</span>
                          {formatEntryDate(entry.occurredOn)}
                        </p>
                      </div>
                      <p
                        className={`shrink-0 text-sm font-semibold tabular-nums ${
                          entry.type === "income" ? "text-emerald-300" : "text-slate-200"
                        }`}
                      >
                        {entry.type === "income" ? "+" : "−"} {formatZar(entry.amount)}
                      </p>
                      <button
                        type="button"
                        onClick={() => void onDelete(entry.id)}
                        aria-label="Delete entry"
                        className="shrink-0 rounded-lg border border-transparent px-2 py-1 text-xs text-slate-600 opacity-0 transition hover:border-rose-400/30 hover:text-rose-300 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {spendByCategory.length > 0 ? (
              <section className="glass rise rounded-3xl p-6 shadow-2xl shadow-black/30">
                <div className="mb-5 flex items-baseline justify-between">
                  <h2 className="text-lg font-semibold">Where the rands go</h2>
                  <span className="text-xs text-slate-500">{spendByCategory.length} categories</span>
                </div>
                <div className="space-y-4">
                  {spendByCategory.map(([category, amount], index) => {
                    const percent = totals.expense > 0 ? (amount / totals.expense) * 100 : 0;
                    const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                    const next = CATEGORY_COLORS[(index + 1) % CATEGORY_COLORS.length];
                    return (
                      <div key={category}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-slate-300">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                            {category}
                          </span>
                          <span className="tabular-nums text-slate-400">
                            {formatZar(amount)}{" "}
                            <span className="text-slate-600">· {percent.toFixed(0)}%</span>
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${percent}%`,
                              background: `linear-gradient(90deg, ${color}, ${next})`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-slate-600">
          Amounts in South African rand (ZAR) · Next.js + Prisma + PostgreSQL
        </footer>
      </div>
    </main>
  );
}
