import { ImportTransactionsPanel } from "@/components/finance/ImportTransactionsPanel";

import { ReferencePageShell } from "@/components/finance/ReferencePageShell";

export const metadata = {
  title: "Importar lançamentos",
  description: "Importe seu histórico financeiro em CSV ou OFX.",
};

export default function ImportPage() {
  return (
    <ReferencePageShell pageLabel="Importar dados" pageKicker="ENTRADAS E EXTRATOS">
      <ImportTransactionsPanel />
    </ReferencePageShell>
  );
}
