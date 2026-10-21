"use client"

import { useFinanceData } from "@/components/finance/finance-provider"
import { Button } from "@/components/ui/button"
import { SparklesIcon, DatabaseIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function DemoModeToggle() {
  const { isDemoMode, setDemoMode } = useFinanceData()

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={isDemoMode ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setDemoMode(!isDemoMode)}
            className={`h-8 gap-1.5 px-2.5 text-xs font-medium transition-all ${
              isDemoMode
                ? "border border-amber-500/30 bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:text-amber-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isDemoMode ? (
              <>
                <SparklesIcon className="size-3.5 text-amber-500" />
                <span className="hidden sm:inline">Modo Demo</span>
              </>
            ) : (
              <>
                <DatabaseIcon className="size-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Meus Dados</span>
              </>
            )}
          </Button>
        }
      />
      <TooltipContent side="bottom">
        <p className="text-xs">
          {isDemoMode
            ? "Exibindo dados de exemplo. Clique para alternar para sua conta limpa e real."
            : "Exibindo seus dados reais do Firestore. Clique para alternar para demonstração."}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

export function DemoModeBanner() {
  const { isDemoMode, setDemoMode } = useFinanceData()

  if (!isDemoMode) return null

  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-900 dark:text-amber-200">
      <div className="flex items-center gap-2">
        <SparklesIcon className="size-4 shrink-0 text-amber-500" />
        <span>
          Você está visualizando os <strong>dados de demonstração</strong>. Desative para inserir suas contas e transações do zero.
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-6 shrink-0 border-amber-500/40 bg-background px-2.5 text-[11px] font-medium shadow-none hover:bg-muted"
        onClick={() => setDemoMode(false)}
      >
        Usar conta limpa
      </Button>
    </div>
  )
}
