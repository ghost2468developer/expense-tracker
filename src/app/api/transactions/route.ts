import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function serialize(t: {
  id: number;
  description: string;
  category: string;
  type: string;
  amount: unknown;
  occurredOn: Date;
}) {
  return {
    id: t.id,
    description: t.description,
    category: t.category,
    type: t.type,
    amount: String(t.amount),
    occurredOn: t.occurredOn.toISOString().slice(0, 10),
  };
}

export async function GET() {
  const rows = await prisma.transaction.findMany({
    orderBy: [{ occurredOn: "desc" }, { id: "desc" }],
  });
  return NextResponse.json(rows.map(serialize));
}

export async function POST(req: Request) {
  const body = await req.json();
  const description = String(body.description ?? "").trim();
  const category = String(body.category ?? "").trim() || "General";
  const type = body.type === "income" ? "income" : "expense";
  const amount = Number(body.amount);
  const occurredOn = String(body.occurredOn ?? "").trim();

  if (!description) return NextResponse.json({ error: "Description is required" }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0)
    return NextResponse.json({ error: "Amount must be greater than R0.00" }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occurredOn))
    return NextResponse.json({ error: "A valid date is required" }, { status: 400 });

  const row = await prisma.transaction.create({
    data: {
      description,
      category,
      type,
      amount: amount.toFixed(2),
      occurredOn: new Date(`${occurredOn}T00:00:00.000Z`),
    },
  });

  return NextResponse.json(serialize(row), { status: 201 });
}
