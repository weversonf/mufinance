"use client"

import { useFinanceData } from "@/components/finance/finance-provider"
import { EmptyState } from "@/components/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  PalmtreeIcon,
  ShieldIcon,
  CarIcon,
  HomeIcon,
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  "palm-tree": <PalmtreeIcon className="size-5" />,
  shield: <ShieldIcon className="size-5" />,
  car: <CarIcon className="size-5" />,
  home: <HomeIcon className="size-5" />,
}

export function SavingsGoals() {
  const { savingsGoals } = useFinanceData()

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Metas de economia</CardTitle>
      </CardHeader>
      <CardContent>
        {savingsGoals.length === 0 ? (
          <EmptyState
            variant="budgets"
            title="No savings goals yet"
            description="Create a goal to track progress toward the things that matter to you."
            className="py-8"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {savingsGoals.map((goal) => {
              const percent = Math.min(
                100,
                Math.max(0, Math.round((goal.currentAmount / goal.targetAmount) * 100)),
              )
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
              const hasProjection = goal.monthlyContribution > 0 && remaining > 0
              const monthsLeft = hasProjection
                ? Math.ceil(remaining / goal.monthlyContribution)
                : 0
              const projectedDate = hasProjection ? new Date() : null
              if (projectedDate) {
                projectedDate.setMonth(projectedDate.getMonth() + monthsLeft)
              }
              const deadlineDate = goal.deadline
                ? new Date(`${goal.deadline}T12:00:00`)
                : null
              const hasValidDeadline = Boolean(deadlineDate && !Number.isNaN(deadlineDate.valueOf()))
              const isComplete = remaining === 0
              const onTrack = isComplete || (
                hasProjection &&
                hasValidDeadline &&
                projectedDate !== null &&
                deadlineDate !== null &&
                projectedDate <= deadlineDate
              )

              return (
                <div key={goal.id} className="flex gap-4 rounded-xl border p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {iconMap[goal.iconName] ?? <HomeIcon className="size-5" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{goal.name}</p>
                      <Badge
                        variant={isComplete || onTrack ? "secondary" : hasProjection ? "destructive" : "outline"}
                        className="text-[10px]"
                      >
                        {isComplete ? "Complete" : onTrack ? "On track" : hasProjection ? "Behind" : "Set contribution"}
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold tabular-nums">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(goal.currentAmount)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(goal.targetAmount)}
                      </span>
                    </div>
                    <Progress value={percent} className="h-2" />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {goal.monthlyContribution > 0
                          ? `$${goal.monthlyContribution}/mo`
                          : "Monthly contribution not set"}
                      </span>
                      <span>{goal.deadline ? `Target: ${goal.deadline}` : "No deadline"}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
