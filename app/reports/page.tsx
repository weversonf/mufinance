import { ReportsDashboard } from "@/components/finance/ReportsDashboard";

export const metadata = {
  title: "Relatórios",
  description: "Acompanhe fluxo de caixa, receitas, despesas e gastos por categoria.",
};

export default function ReportsPage() {
  return <ReportsDashboard />;
}
