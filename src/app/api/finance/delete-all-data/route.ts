import { NextResponse } from "next/server";
import { deleteAllData } from "@/actions/finance";

export async function POST() {
  try {
    const result = await deleteAllData();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao apagar todos os dados:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro desconhecido" }, { status: 400 });
  }
}

