import { NextResponse } from "next/server";
import { createTransaction } from "../../../../actions/finance";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createTransaction(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro desconhecido" }, { status: 400 });
  }
}
