import { PlanningDashboard } from "@/components/finance/PlanningDashboard";

import { ReferencePageShell } from "@/components/finance/ReferencePageShell";

export const metadata = {
  title: "Metas e orçamento",
  description: "Planeje metas financeiras e limites mensais por categoria.",
};

export default function PlanningPage() {
  return (
    <ReferencePageShell pageLabel="Planejamento" pageKicker="METAS E ORÇAMENTO">
      <PlanningDashboard />
    </ReferencePageShell>
  );
}
