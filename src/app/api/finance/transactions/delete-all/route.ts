import { NextResponse } from "next/server";
import { deleteAllTransactions } from "../../../../../actions/finance";

export async function POST() {
  try {
    const result = await deleteAllTransactions();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao deletar todas as transações:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro desconhecido" }, { status: 400 });
  }
}
