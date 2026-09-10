import { NextResponse } from "next/server";
import { seedDefaultCategories } from "@/actions/finance";
export async function POST() {
  try {
    const result = await seedDefaultCategories();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro" }, { status: 400 });
  }
}
