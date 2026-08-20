import { NextResponse } from "next/server";
import { getFinanceSnapshot } from "../../../../actions/finance";

export async function GET() {
  try {
    const snapshot = await getFinanceSnapshot();
    if (!snapshot) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("Falha ao carregar snapshot financeiro", error);
    return NextResponse.json({ error: "Não foi possível carregar os dados financeiros." }, { status: 500 });
  }
}
