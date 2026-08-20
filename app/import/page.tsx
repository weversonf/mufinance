import { ImportTransactionsPanel } from "@/components/finance/ImportTransactionsPanel";

export const metadata = {
  title: "Importar lançamentos",
  description: "Importe seu histórico financeiro em CSV ou OFX.",
};

export default function ImportPage() {
  return <main className="app-page"><ImportTransactionsPanel /></main>;
}
