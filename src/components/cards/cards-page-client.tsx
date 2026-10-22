"use client"

import { useCallback, useMemo, useState } from "react"
import { useFinanceData } from "@/components/finance/finance-provider"
import { EmptyState } from "@/components/empty-state"
import type { CardData } from "@/data/seed"
import { InteractiveCard } from "@/components/cards/interactive-card"
import { CardControls } from "@/components/cards/card-controls"
import { VirtualCardGenerator } from "@/components/cards/virtual-card-generator"
import { CardList } from "@/components/cards/card-list"
import { Card, CardContent } from "@/components/ui/card"

export function CardsPageClient() {
  const { cardsData } = useFinanceData()
  const [localCards, setLocalCards] = useState<CardData[]>([])
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [frozenMap, setFrozenMap] = useState<Record<string, boolean>>({})
  const [dailyLimits, setDailyLimits] = useState<Record<string, number>>({})

  const cards = useMemo(() => [...cardsData, ...localCards], [cardsData, localCards])
  const activeCard = cards.find((card) => card.id === activeCardId) ?? cards[0]
  const currentCardId = activeCard?.id ?? null

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

  const handleCardCreated = useCallback((card: CardData) => {
    setLocalCards((prev) => [...prev, card])
    setFrozenMap((prev) => ({ ...prev, [card.id]: false }))
    setDailyLimits((prev) => ({ ...prev, [card.id]: card.dailyLimit }))
    setActiveCardId(card.id)
  }, [])

  return (
    <div className="space-y-6">
      {activeCard ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="flex items-start justify-center lg:col-span-7">
            <InteractiveCard
              card={activeCard}
              frozen={frozenMap[currentCardId!] ?? activeCard.frozen}
            />
          </div>
          <div className="lg:col-span-5">
            <CardControls
              card={activeCard}
              frozen={frozenMap[currentCardId!] ?? activeCard.frozen}
              onToggleFreeze={toggleFreeze}
              dailyLimit={dailyLimits[currentCardId!] ?? activeCard.dailyLimit}
              onDailyLimitChange={handleDailyLimitChange}
            />
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              variant="cards"
              title="Nenhum cartão cadastrado"
              description="Gere um cartão virtual ou adicione um cartão para gerenciar seus gastos."
              className="py-8 sm:py-16"
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <VirtualCardGenerator onCardCreated={handleCardCreated} />
        </div>
        <div className={cards.length > 0 ? "lg:col-span-8" : "hidden lg:col-span-8 lg:block"}>
          {cards.length > 0 ? (
            <CardList
              cards={cards}
              activeCardId={currentCardId ?? ""}
              onSelect={setActiveCardId}
              frozenMap={frozenMap}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  variant="cards"
                  title="Sua lista de cartões está vazia"
                  description="Os cartões cadastrados aparecerão aqui."
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
