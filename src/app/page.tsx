import { getAllTransactions, getSummary, getExpenseTotalsByCategory } from "@/lib/queries";
import { formatRands } from "@/lib/format";
import { CATEGORY_ICON } from "@/lib/categories";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone: "emerald" | "rose" | "indigo" | "slate";
  hint?: string;
}) {
  const tones: Record<string, string> = {
    emerald: "from-emerald-500 to-emerald-600",
    rose: "from-rose-500 to-rose-600",
    indigo: "from-indigo-500 to-indigo-600",
    slate: "from-slate-700 to-slate-800",
  };
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${tones[tone]} p-5 text-white shadow-sm`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-white/80">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-white/75">{hint}</p>}
    </div>
  );
}

export default async function HomePage() {
  const [summary, transactions, categories] = await Promise.all([
    getSummary(),
    getAllTransactions(),
    getExpenseTotalsByCategory(),
  ]);

  const topCategoryTotal = categories[0]?.total ?? 0;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-xl">
              💰
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                My Rand Tracker
              </h1>
              <p className="text-sm text-slate-500">
                Salary &amp; expenses, your way — in Rand.
              </p>
            </div>
          </div>
        </header>

        {/* Summary cards */}
        <section className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Income"
            value={formatRands(summary.totalIncome)}
            tone="emerald"
            hint="Salary &amp; other income"
          />
          <StatCard
            label="Total Expenses"
            value={formatRands(summary.totalExpense)}
            tone="rose"
            hint="All money spent"
          />
          <StatCard
            label="Balance"
            value={formatRands(summary.balance)}
            tone={summary.balance >= 0 ? "indigo" : "rose"}
            hint={
              summary.balance >= 0 ? "What you have left" : "You're over budget"
            }
          />
          <StatCard
            label="Savings Rate"
            value={`${summary.savingsRate}%`}
            tone="slate"
            hint={`${summary.transactionCount} transaction${
              summary.transactionCount === 1 ? "" : "s"
            }`}
          />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Add transaction */}
          <section className="lg:col-span-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h2 className="mb-4 text-base font-semibold text-slate-900">
                Add a transaction
              </h2>
              <TransactionForm />
            </div>

            {/* Category breakdown */}
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h2 className="mb-4 text-base font-semibold text-slate-900">
                Where the money goes
              </h2>
              {categories.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Add an expense to see a breakdown by category.
                </p>
              ) : (
                <ul className="space-y-3">
                  {categories.map((c) => {
                    const pct =
                      topCategoryTotal > 0
                        ? Math.round((c.total / summary.totalExpense) * 100)
                        : 0;
                    return (
                      <li key={c.category}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 font-medium text-slate-700">
                            <span>{CATEGORY_ICON[c.category] ?? "✨"}</span>
                            {c.category}
                          </span>
                          <span className="tabular-nums font-semibold text-slate-900">
                            {formatRands(c.total)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* Transactions list */}
          <section className="lg:col-span-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">
                  Transactions
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {transactions.length} total
                </span>
              </div>
              <TransactionList transactions={transactions} />
            </div>
          </section>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">
          Amounts are in South African Rand (ZAR). Your data is saved to your
          account.
        </footer>
      </div>
    </main>
  );
}
