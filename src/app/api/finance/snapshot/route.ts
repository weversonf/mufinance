import { NextResponse } from "next/server";
import { getFinanceSnapshot } from "@/actions/finance";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export async function GET() {
  try {
    if (!isFirebaseAdminConfigured()) {
      if (process.env.NODE_ENV === "development") return NextResponse.json(null);
      return NextResponse.json({ error: "Serviço financeiro indisponível." }, { status: 503 });
    }
    const snapshot = await getFinanceSnapshot();
    if (!snapshot) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("Falha ao carregar snapshot financeiro", error);
    return NextResponse.json({ error: "Não foi possível carregar os dados financeiros." }, { status: 500 });
  }
}
