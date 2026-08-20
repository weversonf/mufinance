import { NextResponse } from "next/server";
import { migrateLegacyFinanceState } from "../../../../actions/finance";

export async function POST() {
  try {
    const result = await migrateLegacyFinanceState();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Falha ao migrar estado financeiro", error);
    return NextResponse.json({ error: "Não foi possível migrar o estado financeiro." }, { status: 401 });
  }
}
