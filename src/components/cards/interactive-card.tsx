"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { PencilIcon, SnowflakeIcon, WifiIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CardData } from "@/data/seed"

interface InteractiveCardProps {
  card: CardData
  frozen: boolean
  onEdit: () => void
}

export function InteractiveCard({
  card,
  frozen,
  onEdit,
}: InteractiveCardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="aspect-[1.586/1] w-full cursor-pointer sm:max-w-[400px]"
      style={{ perspective: "1000px" }}
      onClick={() => setFlipped((f) => !f)}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* ── Front Face ── */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between rounded-2xl p-5",
            card.color,
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Top row */}
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium">{card.name}</span>
            <Image
              src={card.network === "visa" ? "/logos/visa-com.svg" : "/logos/mastercard-com.svg"}
              alt={card.network}
              width={48}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* Chip + NFC */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-300 to-amber-500 opacity-80" />
            <WifiIcon className="size-5 rotate-90 opacity-60" />
          </div>

          {/* Card number */}
          <p className="font-mono text-base tracking-widest tabular-nums">
            **** **** **** {card.last4}
          </p>

          {/* Bottom row */}
          <div className="flex items-end justify-between">
            <span className="text-xs font-medium uppercase tracking-wide">
              {card.holder}
            </span>
            <span className="text-xs tabular-nums">{card.expiry}</span>
          </div>
        </div>

        {/* ── Back Face ── */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl bg-primary text-primary-foreground"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Magnetic stripe */}
          <div className="mt-6 h-10 w-full bg-foreground/80" />

          <div className="flex flex-1 flex-col justify-between p-5 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-24 rounded bg-muted/20" />
                <span className="font-mono text-xs text-primary-foreground/70">
                  **** {card.last4}
                </span>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit()
                }}
                aria-label={`Editar ${card.name}`}
                className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition-colors hover:bg-primary-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
              >
                <PencilIcon className="size-4" />
              </button>
            </div>

            <p className="text-xs text-primary-foreground/60">
              Toque no lápis para editar. Toque no cartão para voltar.
            </p>
          </div>
        </div>

        {/* ── Freeze Overlay ── */}
        <AnimatePresence>
          {frozen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 rounded-2xl bg-background/70 backdrop-blur-sm"
            >
              <SnowflakeIcon className="size-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Cartão Bloqueado
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
