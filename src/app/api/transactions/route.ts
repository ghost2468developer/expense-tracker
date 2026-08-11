import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const EXPENSE_CATEGORIES = new Set([
  "Rent",
  "Groceries",
  "Transport",
  "Utilities",
  "Dining Out",
  "Entertainment",
  "Health",
  "Shopping",
  "Education",
  "Insurance",
  "Other",
]);

const INCOME_CATEGORIES = new Set([
  "Salary",
  "Bonus",
  "Freelance",
  "Investment",
  "Rental Income",
  "Gift",
  "Other",
]);

function normaliseType(raw: FormDataEntryValue | null): "income" | "expense" {
  return raw === "income" ? "income" : "expense";
}

export async function POST(request: NextRequest) {
  const form = await request.formData();

  const type = normaliseType(form.get("type"));
  const title = (form.get("title") as string | null)?.trim() ?? "";
  const category = (form.get("category") as string | null)?.trim() ?? "";
  const amountRaw = (form.get("amount") as string | null)?.trim() ?? "";
  const occurredOn = (form.get("occurredOn") as string | null)?.trim() ?? "";

  const errors: Record<string, string> = {};

  if (!title) errors.title = "Please add a description.";
  if (!category) errors.category = "Please choose a category.";

  const amount = parseFloat(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Enter an amount greater than R 0.";
  }

  if (!occurredOn || Number.isNaN(new Date(occurredOn).getTime())) {
    errors.occurredOn = "Please choose a valid date.";
  }

  const allowedCategories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (category && !allowedCategories.has(category)) {
    errors.category = "That category is not allowed.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const created = await prisma.transaction.create({
    data: {
      type,
      title,
      category,
      amount,
      // Treat the chosen date as a calendar day in UTC (date-only column).
      occurredOn: new Date(`${occurredOn}T00:00:00.000Z`),
    },
  });

  return NextResponse.json({ ok: true, transaction: created }, { status: 201 });
}
