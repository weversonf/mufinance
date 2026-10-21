"use client"

import { useState, useCallback, useEffect } from "react"
import {
  DndContext,
  pointerWithin,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable"
import { GripVerticalIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { FinancialOverview } from "@/components/dashboard/financial-overview"
import { AccountCards } from "@/components/dashboard/account-cards"
import { QuickTransfer } from "@/components/dashboard/quick-transfer"
import { SpendingLimit } from "@/components/dashboard/spending-limit"
import { MoneyMovement } from "@/components/dashboard/money-movement"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { HealthScore } from "@/components/dashboard/health-score"
import { useDashboardCustomizer } from "@/components/dashboard/dashboard-customizer-context"

type WidgetSize = "sm" | "lg" | "full"

type Block = {
  id: string
  label: string
  size: WidgetSize
  component: React.ReactNode
}

const defaultBlocks: Block[] = [
  { id: "financial-overview", label: "Visão Geral Financeira", size: "lg", component: <FinancialOverview /> },
  { id: "account-cards", label: "Cartões de Contas", size: "sm", component: <AccountCards /> },
  { id: "transfer-spending", label: "Transferência e Limites", size: "sm", component: <div className="flex flex-col gap-4 [&>*]:flex-1"><QuickTransfer /><SpendingLimit /></div> },
  { id: "money-movement", label: "Movimentação Financeira", size: "sm", component: <MoneyMovement /> },
  { id: "health-score", label: "Saúde Financeira", size: "sm", component: <HealthScore /> },
  { id: "recent-transactions", label: "Transações recentes", size: "full", component: <RecentTransactions /> },
]

const sizeClass: Record<WidgetSize, string> = {
  sm: "col-span-12 lg:col-span-4",
  lg: "col-span-12 lg:col-span-8",
  full: "col-span-12",
}

const STORAGE_KEY = "vault-dashboard-order"

// ── Null strategy: let CSS Grid handle layout, not dnd-kit transforms ──
const nullStrategy = () => null

function SortableWidget({
  block,
  editing,
}: {
  block: Block
  editing: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: block.id,
    disabled: !editing,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        sizeClass[block.size],
        "relative transition-opacity duration-200",
        isDragging && "opacity-30",
        editing && !isDragging && "rounded-xl ring-2 ring-dashed ring-primary/20",
      )}
    >
      {editing && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 cursor-grab items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-foreground shadow-md active:cursor-grabbing"
        >
          <GripVerticalIcon className="size-3" />
          {block.label}
        </div>
      )}
      <div className={cn("h-full [&>*]:h-full", editing && "pointer-events-none select-none")}>
        {block.component}
      </div>
    </div>
  )
}

export function DashboardCustomizer() {
  const customizer = useDashboardCustomizer()
  const [localEditing, setLocalEditing] = useState(false)
  const editing = customizer ? customizer.editing : localEditing

  const [blocks, setBlocks] = useState(() => {
    if (typeof window === "undefined") return defaultBlocks
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const order: string[] = JSON.parse(saved)
        const reordered = order
          .map((id) => defaultBlocks.find((b) => b.id === id))
          .filter(Boolean) as Block[]
        for (const b of defaultBlocks) {
          if (!reordered.find((r) => r.id === b.id)) reordered.push(b)
        }
        return reordered
      }
    } catch {}
    return defaultBlocks
  })
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id)
      const newIndex = prev.findIndex((b) => b.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      const next = arrayMove(prev, oldIndex, newIndex)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.map((b) => b.id)))
      return next
    })
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const handleReset = useCallback(() => {
    setBlocks(defaultBlocks)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  useEffect(() => {
    if (customizer?.registerReset) {
      customizer.registerReset(handleReset)
    }
  }, [customizer, handleReset])

  const activeBlock = blocks.find((b) => b.id === activeId)

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 pt-2 sm:gap-4 sm:p-4 sm:pt-2">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={nullStrategy}
        >
          <div className="grid min-w-0 grid-cols-12 gap-3 sm:gap-4">
            {blocks.map((block) => (
              <SortableWidget
                key={block.id}
                block={block}
                editing={editing}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag overlay — renders outside the grid, no distortion */}
        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {activeBlock ? (
            <div className="rounded-xl bg-card p-4 shadow-2xl ring-2 ring-primary/30 rotate-[1deg] scale-[1.02]">
              <p className="text-sm font-medium text-muted-foreground">
                {activeBlock.label}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
