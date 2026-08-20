import Link from "next/link";

const features = [
  {
    title: "Your ledger, locked to you",
    copy: "Create an account and every rand you log stays private. No shared demo data, no pre-filled numbers.",
    icon: "🔐",
  },
  {
    title: "Income and expenses",
    copy: "Capture money in and money out with categories like Groceries, Transport, Rent, and Salary.",
    icon: "⇅",
  },
  {
    title: "See where the rands go",
    copy: "Live balance, savings rate, search, and a category breakdown built for South African rand.",
    icon: "◎",
  },
];

export function Landing() {
  return (
    <main className="aurora min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <nav className="rise mb-16 flex items-center justify-between gap-4">
          <div>
            <p className="text-xl font-bold tracking-tight">
              Randly<span className="text-emerald-400">.</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
            >
              Get started
            </Link>
          </div>
        </nav>

        <section className="rise mb-16 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live · South African Rand
            </div>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-6xl">
              Track every rand in and out — privately.
            </h1>
            <p className="mt-4 max-w-lg text-base text-slate-400">
              Randly is a personal money tracker for South African rand. Sign in to capture income, expenses, and
              see your own balance. Nothing is pre-filled.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
              >
                Create your account
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-400/40"
              >
                I already have an account
              </Link>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 shadow-2xl shadow-black/30">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Preview</p>
            <p className="mt-1 text-sm text-slate-500">Your dashboard after you sign in</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Net balance</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-300">R 4 250,00</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Savings rate</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-sky-300">28%</p>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-white/5">
              <li className="flex items-center justify-between py-3 text-sm">
                <span className="text-slate-300">Salary</span>
                <span className="font-semibold tabular-nums text-emerald-300">+ R 15 000,00</span>
              </li>
              <li className="flex items-center justify-between py-3 text-sm">
                <span className="text-slate-300">Groceries at Checkers</span>
                <span className="font-semibold tabular-nums text-slate-200">− R 842,50</span>
              </li>
              <li className="flex items-center justify-between py-3 text-sm">
                <span className="text-slate-300">Transport</span>
                <span className="font-semibold tabular-nums text-slate-200">− R 320,00</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="glass rise rounded-2xl p-5 shadow-xl shadow-black/20">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-lg">
                {feature.icon}
              </div>
              <h2 className="text-base font-semibold text-slate-100">{feature.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{feature.copy}</p>
            </div>
          ))}
        </section>

        <footer className="mt-16 text-center text-xs text-slate-600">
          Amounts in South African rand (ZAR) · Next.js + Prisma + PostgreSQL
        </footer>
      </div>
    </main>
  );
}
