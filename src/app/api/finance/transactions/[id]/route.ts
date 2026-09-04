import { NextResponse } from "next/server";
import { updateTransaction, deleteTransaction } from "@/actions/finance";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await updateTransaction(id, await request.json());
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível atualizar a transação.";
    const status = message === "Não autenticado." ? 401 : message.includes("não encontrado") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await deleteTransaction(id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível excluir a transação.";
    const status = message === "Não autenticado." ? 401 : message.includes("não encontrado") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
