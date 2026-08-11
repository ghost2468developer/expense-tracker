import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";

export type TransactionRow = {
  id: number;
  type: "income" | "expense";
  title: string;
  category: string;
  amount: number;
  occurredOn: string;
};

// Prisma returns @db.Date columns as a JS Date at midnight UTC. Convert it
// back to a stable "YYYY-MM-DD" calendar string for display + storage.
function dateToISO(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function getAllTransactions(): Promise<TransactionRow[]> {
  const rows = await prisma.transaction.findMany({
    orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type === "income" ? "income" : "expense",
    title: r.title,
    category: r.category,
    amount: toNumber(r.amount.toString()),
    occurredOn: dateToISO(r.occurredOn),
  }));
}

export type CategoryTotals = {
  category: string;
  total: number;
  count: number;
};

export async function getExpenseTotalsByCategory(): Promise<
  CategoryTotals[]
> {
  const rows = await prisma.transaction.groupBy({
    by: ["category"],
    where: { type: "expense" },
    _sum: { amount: true },
    _count: { _all: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  return rows.map((r) => ({
    category: r.category,
    total: toNumber(r._sum.amount?.toString() ?? "0"),
    count: r._count._all,
  }));
}

export type Summary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number; // percentage of income kept
  transactionCount: number;
};

export async function getSummary(): Promise<Summary> {
  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    _sum: { amount: true },
    _count: { _all: true },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  let transactionCount = 0;

  for (const r of grouped) {
    const total = toNumber(r._sum.amount?.toString() ?? "0");
    transactionCount += r._count._all;
    if (r.type === "income") totalIncome += total;
    else if (r.type === "expense") totalExpense += total;
  }

  const balance = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? Math.round((balance / totalIncome) * 1000) / 10 : 0;

  return {
    totalIncome,
    totalExpense,
    balance,
    savingsRate,
    transactionCount,
  };
}

export async function deleteTransaction(id: number, type: string) {
  await prisma.transaction.deleteMany({
    where: { id, type },
  });
}
