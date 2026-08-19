import { describe, expect, it } from "vitest";
import { defaultFinanceCategories } from "@/lib/financeData";
import { mergeCategories } from "./normalization";

describe("mergeCategories", () => {
  it("adiciona padrões ausentes sem duplicar tipo e nome", () => {
    const custom = [{ id: "custom-health", name: "Saúde", type: "expense", tone: "mint", active: true, usage: 4 } as const];
    const result = mergeCategories([...custom, defaultFinanceCategories[0]]);
    const keys = result.map((category) => `${category.type}:${category.name.toLocaleLowerCase("pt-BR")}`);
    expect(result.some((category) => category.name === "Saúde")).toBe(true);
    expect(new Set(keys).size).toBe(keys.length);
    expect(result.length).toBe(defaultFinanceCategories.length + 1);
  });

  it("mantém uma categoria personalizada com uso e estado originais", () => {
    const custom = { id: "custom-income", name: "Dividendos", type: "income" as const, tone: "blue" as const, active: false, usage: 7 };
    const result = mergeCategories([custom]);
    expect(result.find((category) => category.id === custom.id)).toEqual(custom);
  });
});
