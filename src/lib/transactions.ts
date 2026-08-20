export type MoneyType = "income" | "expense";

export type Transaction = {
  id: string;
  description: string;
  category: string;
  type: MoneyType;
  amount: number;
  occurredOn: string;
};

type TransactionRecord = {
  id: string;
  description: string;
  category: string;
  type: string;
  amount: { toString(): string } | number | string;
  occurredOn: Date | string;
};

function toIsoDate(value: Date | string) {
  if (typeof value === "string") return value.slice(0, 10);
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function serializeTransaction(row: TransactionRecord): Transaction {
  return {
    id: row.id,
    description: row.description,
    category: row.category,
    type: row.type === "income" ? "income" : "expense",
    amount: Number(row.amount),
    occurredOn: toIsoDate(row.occurredOn),
  };
}

export function parseAmount(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

export function isMoneyType(value: unknown): value is MoneyType {
  return value === "income" || value === "expense";
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
