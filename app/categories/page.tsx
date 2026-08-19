import { CategoriesManager } from "@/components/finance/CategoriesManager";

export const metadata = {
  title: "Categorias",
  description: "Gerencie suas categorias pessoais de receita e despesa.",
};

export default function CategoriesPage() {
  return <CategoriesManager />;
}
