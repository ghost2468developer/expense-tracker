"use client";

import { useEffect, useMemo, useState } from "react";

type Txn = {
  id: number;
  description: string;
  category: string;
  type: string;
  amount: string;
  occurredOn: string;
};

const rands = (n: number) =>
  "R " + n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const prettyDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const CATEGORY_HINTS = ["Groceries", "Transport", "Rent", "Airtime", "Eating out", "Salary", "Savings"];

const RING = ["#34d399", "#38bdf8", "#a78bfa", "#fbbf24", "#f472b6", "#22d3ee", "#fb7185"];

export default function Home() {
  const [rows, setRows] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [query, setQuery] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    description: "",
    category: "",
    type: "expense",
    amount: "",
    occurredOn: today,
  });

  async function load() {
    const res = await fetch("/api/transactions", { cache: "no-store" });
    setRows(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const r of rows) {
      const v = Number(r.amount);
      if (r.type === "income") income += v;
      else expense += v;
    }
    return { income, expense, balance: income - expense };
  }, [rows]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    rows
      .filter((r) => r.type === "expense")
      .forEach((r) => map.set(r.category, (map.get(r.category) ?? 0) + Number(r.amount)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const visible = useMemo(
    () =>
      rows.filter(
        (r) =>
          (filter === "all" || r.type === filter) &&
          (query.trim() === "" ||
            `${r.description} ${r.category}`.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [rows, filter, query],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Could not save entry");
      return;
    }
    setForm({ ...form, description: "", category: "", amount: "" });
    load();
  }

  async function remove(id: number) {
    setRows((r) => r.filter((x) => x.id !== id));
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-400/60 focus:bg-white/10 focus:ring-4 focus:ring-emerald-400/10";
  const label = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400";

  const savingsRate = totals.income > 0 ? Math.max(0, (totals.balance / totals.income) * 100) : 0;

  return (
    <main className="aurora min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        {/* Header */}
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
          <div className="glass rounded-2xl px-5 py-4 text-right">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Net balance</p>
            <p
              className={`text-3xl font-bold tabular-nums ${
                totals.balance >= 0 ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {rands(totals.balance)}
            </p>
          </div>
        </header>

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Money in" value={rands(totals.income)} accent="emerald" icon="↑" sub={`${rows.filter((r) => r.type === "income").length} entries`} />
          <Stat label="Money out" value={rands(totals.expense)} accent="rose" icon="↓" sub={`${rows.filter((r) => r.type === "expense").length} entries`} />
          <Stat
            label="Savings rate"
            value={`${savingsRate.toFixed(0)}%`}
            accent="sky"
            icon="◎"
            sub={totals.income > 0 ? "of money in" : "add income to calculate"}
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Form */}
          <form onSubmit={submit} className="glass rise h-fit rounded-3xl p-6 shadow-2xl shadow-black/30">
            <h2 className="mb-1 text-lg font-semibold">Add an entry</h2>
            <p className="mb-5 text-xs text-slate-400">Everything is stored in your database.</p>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
              {(["expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
                    form.type === t
                      ? t === "income"
                        ? "bg-emerald-400/20 text-emerald-300 shadow-inner"
                        : "bg-rose-400/20 text-rose-300 shadow-inner"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className={label}>Description</label>
                <input
                  className={field}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Groceries at Checkers"
                />
              </div>

              <div>
                <label className={label}>Amount</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    R
                  </span>
                  <input
                    className={`${field} pl-8 text-lg font-semibold tabular-nums`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Category</label>
                  <input
                    className={field}
                    list="cats"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="General"
                  />
                  <datalist id="cats">
                    {[...new Set([...CATEGORY_HINTS, ...rows.map((r) => r.category)])].map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className={label}>Date</label>
                  <input
                    className={field}
                    type="date"
                    value={form.occurredOn}
                    onChange={(e) => setForm({ ...form, occurredOn: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_HINTS.slice(0, 5).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, category: c })}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-slate-400 transition hover:border-emerald-400/40 hover:text-emerald-300"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            )}

            <button
              disabled={saving}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Add entry"}
            </button>
          </form>

          {/* Right column */}
          <div className="space-y-6">
            <section className="glass rise overflow-hidden rounded-3xl shadow-2xl shadow-black/30">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
                <h2 className="text-lg font-semibold">Entries</h2>
                <div className="flex items-center gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search…"
                    className="w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-400/50 sm:w-44"
                  />
                  <div className="flex rounded-lg bg-white/5 p-0.5">
                    {(["all", "income", "expense"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`rounded-md px-2.5 py-1 text-xs capitalize transition ${
                          filter === f ? "bg-white/10 text-slate-100" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="space-y-2 p-5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                    🪙
                  </div>
                  <p className="font-medium text-slate-200">
                    {rows.length === 0 ? "No entries yet" : "Nothing matches that filter"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {rows.length === 0
                      ? "Add your first income or expense on the left."
                      : "Try a different search or filter."}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {visible.map((r) => (
                    <li key={r.id} className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-white/5">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          r.type === "income"
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-rose-400/15 text-rose-300"
                        }`}
                      >
                        {r.type === "income" ? "↑" : "↓"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-100">{r.description}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-white/5 px-2 py-0.5">{r.category}</span>
                          {prettyDate(r.occurredOn)}
                        </p>
                      </div>
                      <p
                        className={`shrink-0 text-sm font-semibold tabular-nums ${
                          r.type === "income" ? "text-emerald-300" : "text-slate-200"
                        }`}
                      >
                        {r.type === "income" ? "+" : "−"} {rands(Number(r.amount))}
                      </p>
                      <button
                        onClick={() => remove(r.id)}
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

            {byCategory.length > 0 && (
              <section className="glass rise rounded-3xl p-6 shadow-2xl shadow-black/30">
                <div className="mb-5 flex items-baseline justify-between">
                  <h2 className="text-lg font-semibold">Where the rands go</h2>
                  <span className="text-xs text-slate-500">{byCategory.length} categories</span>
                </div>
                <div className="space-y-4">
                  {byCategory.map(([cat, amt], i) => {
                    const pct = (amt / totals.expense) * 100;
                    return (
                      <div key={cat}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-slate-300">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: RING[i % RING.length] }}
                            />
                            {cat}
                          </span>
                          <span className="tabular-nums text-slate-400">
                            {rands(amt)} <span className="text-slate-600">· {pct.toFixed(0)}%</span>
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${RING[i % RING.length]}, ${
                                RING[(i + 1) % RING.length]
                              })`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-slate-600">
          Amounts in South African rand (ZAR) · Next.js + Prisma + PostgreSQL
        </footer>
      </div>
    </main>
  );
}

function Stat({
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
  const tones = {
    emerald: "text-emerald-300 bg-emerald-400/15",
    rose: "text-rose-300 bg-rose-400/15",
    sky: "text-sky-300 bg-sky-400/15",
  } as const;
  return (
    <div className="glass rise rounded-2xl p-5 shadow-xl shadow-black/20 transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${tones[accent]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-50">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
}
