"use client"

import { useCallback, useState } from "react"
import { useFinanceData } from "@/components/finance/finance-provider"
import { EmptyState } from "@/components/empty-state"
import { InteractiveCard } from "@/components/cards/interactive-card"
import { CardControls } from "@/components/cards/card-controls"
import { CardEditorDialog } from "@/components/cards/card-editor-dialog"
import { CardList } from "@/components/cards/card-list"
import { Card, CardContent } from "@/components/ui/card"

type CardRecord = Record<string, unknown> & { id: string }

export function CardsPageClient() {
  const { cardsData, snapshot, refresh } = useFinanceData()
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [frozenMap, setFrozenMap] = useState<Record<string, boolean>>({})
  const [dailyLimits, setDailyLimits] = useState<Record<string, number>>({})
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CardRecord | undefined>(undefined)

  const cards = cardsData
  const rawCards = snapshot?.creditCards ?? []
  const activeCard = cards.find((card) => card.id === activeCardId) ?? cards[0]
  const currentCardId = activeCard?.id ?? null
  const currentRawCard = rawCards.find((card) => card.id === currentCardId)

  const toggleFreeze = useCallback(() => {
    if (!currentCardId) return
    setFrozenMap((prev) => ({
      ...prev,
      [currentCardId]: !(prev[currentCardId] ?? activeCard?.frozen ?? false),
    }))
  }, [activeCard?.frozen, currentCardId])

  const handleDailyLimitChange = useCallback(
    (value: number) => {
      if (!currentCardId) return
      setDailyLimits((prev) => ({ ...prev, [currentCardId]: value }))
    },
    [currentCardId],
  )

  const openNewCard = useCallback(() => {
    setEditingCard(undefined)
    setEditorOpen(true)
  }, [])

  const openEditCard = useCallback(() => {
    if (!currentRawCard) return
    setEditingCard(currentRawCard)
    setEditorOpen(true)
  }, [currentRawCard])

  const handleSaved = useCallback(async () => {
    await refresh()
  }, [refresh])

  return (
    <div className="space-y-6">
      {activeCard ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="flex items-start justify-center lg:col-span-7">
            <InteractiveCard
              card={activeCard}
              frozen={frozenMap[currentCardId!] ?? activeCard.frozen}
              onEdit={openEditCard}
            />
          </div>
          <div className="lg:col-span-5">
            <CardControls
              card={activeCard}
              frozen={frozenMap[currentCardId!] ?? activeCard.frozen}
              onToggleFreeze={toggleFreeze}
              dailyLimit={dailyLimits[currentCardId!] ?? activeCard.dailyLimit}
              onDailyLimitChange={handleDailyLimitChange}
              onAddCard={openNewCard}
            />
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 pt-6">
            <EmptyState
              variant="cards"
              title="Nenhum cartão cadastrado"
              description="Adicione um cartão para acompanhar a fatura e os limites."
              className="py-8 sm:py-12"
            />
            <button
              type="button"
              onClick={openNewCard}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Adicionar cartão
            </button>
          </CardContent>
        </Card>
      )}

      {cards.length > 0 && (
        <CardList
          cards={cards}
          activeCardId={currentCardId ?? ""}
          onSelect={setActiveCardId}
          frozenMap={frozenMap}
        />
      )}

      <CardEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        card={editingCard}
        onSaved={handleSaved}
      />
    </div>
  )
}
