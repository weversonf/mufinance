import { ReportsDashboard } from "@/components/finance/ReportsDashboard";
import { ReferencePageShell } from "@/components/finance/ReferencePageShell";

export const metadata = {
  title: "Relatórios",
  description: "Acompanhe fluxo de caixa, receitas, despesas e gastos por categoria.",
};

export default function ReportsPage() {
  return (
    <ReferencePageShell pageLabel="Relatórios" pageKicker="ANÁLISE FINANCEIRA">
      <ReportsDashboard />
    </ReferencePageShell>
  );
}
