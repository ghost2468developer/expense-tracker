import { NextResponse } from "next/server";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { isIsoDate, isMoneyType, parseAmount, serializeTransaction } from "@/lib/transactions";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }

  const rows = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(rows.map(serializeTransaction));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }

  let body: {
    description?: unknown;
    category?: unknown;
    type?: unknown;
    amount?: unknown;
    occurredOn?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const description = typeof body.description === "string" ? body.description.trim() : "";
  const category =
    typeof body.category === "string" && body.category.trim() ? body.category.trim() : "General";
  const type = body.type;
  const amount = parseAmount(body.amount);
  const occurredOn = body.occurredOn;

  if (!description) {
    return NextResponse.json({ error: "Add a description" }, { status: 400 });
  }
  if (!isMoneyType(type)) {
    return NextResponse.json({ error: "Choose income or expense" }, { status: 400 });
  }
  if (amount === null) {
    return NextResponse.json({ error: "Enter an amount greater than zero" }, { status: 400 });
  }
  if (!isIsoDate(occurredOn)) {
    return NextResponse.json({ error: "Pick a valid date" }, { status: 400 });
  }

  const row = await db.transaction.create({
    data: {
      userId: user.id,
      description,
      category,
      type,
      amount: amount.toFixed(2),
      occurredOn: new Date(`${occurredOn}T00:00:00.000Z`),
    },
  });

  return NextResponse.json(serializeTransaction(row), { status: 201 });
}
