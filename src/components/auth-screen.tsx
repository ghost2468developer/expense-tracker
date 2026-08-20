"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { INPUT_CLASS, LABEL_CLASS } from "@/lib/constants";

type Mode = "login" | "register";

export function AuthScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isRegister = mode === "register";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (isRegister && password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setPending(true);
    const response = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
    });
    setPending(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="aurora min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
        <Link href="/" className="mb-8 text-center text-2xl font-bold tracking-tight">
          Randly<span className="text-emerald-400">.</span>
        </Link>
        <form onSubmit={onSubmit} className="glass rise rounded-3xl p-6 shadow-2xl shadow-black/30 sm:p-8">
          <h1 className="text-xl font-semibold">{isRegister ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {isRegister
              ? "Start tracking your own income and expenses in rand."
              : "Sign in to your private Randly ledger."}
          </p>

          <div className="mt-6 space-y-4">
            {isRegister ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  className={INPUT_CLASS}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  placeholder="Thandi Mokoena"
                  required
                />
              </div>
            ) : null}
            <div>
              <label className={LABEL_CLASS} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className={INPUT_CLASS}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@email.com"
                required
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className={INPUT_CLASS}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder={isRegister ? "At least 8 characters" : "Your password"}
                minLength={isRegister ? 8 : undefined}
                required
              />
            </div>
            {isRegister ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="confirm">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  className={INPUT_CLASS}
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  minLength={8}
                  required
                />
              </div>
            ) : null}
          </div>

          {error ? (
            <p className="mt-4 rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          ) : null}

          <button
            disabled={pending}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
          >
            {pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </button>

          <p className="mt-5 text-center text-sm text-slate-400">
            {isRegister ? (
              <>
                Already tracking?{" "}
                <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link href="/register" className="font-medium text-emerald-300 hover:text-emerald-200">
                  Create an account
                </Link>
              </>
            )}
          </p>
        </form>
      </div>
    </main>
  );
}
