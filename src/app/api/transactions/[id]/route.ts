import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  await prisma.transaction.deleteMany({ where: { id: numId } });
  return NextResponse.json({ ok: true });
}
