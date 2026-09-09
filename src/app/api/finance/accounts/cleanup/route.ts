import { NextResponse } from "next/server";
import { keepOnlyOneCheckingAccount } from "@/actions/finance";

export async function POST() {
  try {
    const result = await keepOnlyOneCheckingAccount();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível limpar contas.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
