import { CategoriesManager } from "@/components/finance/CategoriesManager";
import { ReferencePageShell } from "@/components/finance/ReferencePageShell";

export const metadata = {
  title: "Categorias",
  description: "Gerencie suas categorias pessoais de receita e despesa.",
};

export default function CategoriesPage() {
  return (
    <ReferencePageShell pageLabel="Categorias" pageKicker="ORGANIZAÇÃO FINANCEIRA">
      <CategoriesManager />
    </ReferencePageShell>
  );
}
