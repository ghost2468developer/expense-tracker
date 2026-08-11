import { NextRequest, NextResponse } from "next/server";
import { deleteTransaction } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id." },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") === "income" ? "income" : "expense";

  await deleteTransaction(numericId, type);

  return NextResponse.json({ ok: true });
}
