"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { LoaderIcon, CopyIcon, CheckIcon, PlusIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CardData } from "@/data/seed"
import { createCreditCard } from "@/actions/finance"
import { useAuth } from "@/components/auth/auth-provider"
import { useFinanceData } from "@/components/finance/finance-provider"

type Step = "idle" | "form" | "loading" | "success"

interface VirtualCardGeneratorProps {
  onCardCreated: (card: CardData) => void
}

function randomDigits(n: number): string {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join(
    "",
  )
}

export function VirtualCardGenerator({
  onCardCreated,
}: VirtualCardGeneratorProps) {
  const { user } = useAuth()
  const { refresh } = useFinanceData()
  const [step, setStep] = useState<Step>("idle")
  const [name, setName] = useState("")
  const [limit, setLimit] = useState("")
  const [newCard, setNewCard] = useState<CardData | null>(null)
  const [copied, setCopied] = useState(false)

  const reset = useCallback(() => {
    setStep("idle")
    setName("")
    setLimit("")
    setNewCard(null)
    setCopied(false)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!name.trim()) return
    setStep("loading")

    const last4 = randomDigits(4)
    const brandType = Math.random() > 0.5 ? "Visa" : "Mastercard"
    const cardLimit = Number(limit) || 3000
    const holderName = (user?.displayName || "VOCÊ").toUpperCase()

    const card: CardData = {
      id: `vc-${Date.now()}`,
      name: name.trim(),
      type: "virtual",
      last4,
      cardNumber: `${randomDigits(4)} ${randomDigits(4)} ${randomDigits(4)} ${last4}`,
      holder: holderName,
      expiry: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}/${String(new Date().getFullYear() + 3).slice(-2)}`,
      cvv: randomDigits(3),
      network: brandType.toLowerCase() === "mastercard" ? "mastercard" : "visa",
      frozen: false,
      dailyLimit: 1000,
      monthlySpend: 0,
      monthlyLimit: cardLimit,
      color: "bg-muted text-foreground",
    }

    try {
      await createCreditCard({
        name: name.trim(),
        last4,
        brand: brandType,
        limit: cardLimit,
        closingDay: 1,
        dueDay: 10,
        color: "ocean",
      })
      await refresh()
    } catch (err) {
      console.error("Falha ao salvar cartão no Firestore:", err)
    }

    setNewCard(card)
    setStep("success")
    onCardCreated(card)

    setTimeout(() => {
      reset()
    }, 4000)
  }, [name, limit, onCardCreated, reset, user?.displayName, refresh])

  const handleCopy = useCallback(() => {
    if (!newCard) return
    navigator.clipboard.writeText(newCard.cardNumber.replace(/\s/g, ""))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [newCard])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerar Cartão Virtual</CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {/* ── Idle ── */}
          {step === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <p className="mb-4 text-sm text-muted-foreground">
                Crie um cartão virtual seguro para compras online.
              </p>
              <Button onClick={() => setStep("form")} className="w-full">
                <PlusIcon className="size-4" />
                Criar Cartão Virtual
              </Button>
            </motion.div>
          )}

          {/* ── Form ── */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Nome do Cartão
                </label>
                <Input
                  placeholder="Ex: Compras Online / Assinatura"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Limite Mensal (R$)
                </label>
                <Input
                  type="number"
                  placeholder="3000"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={reset}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  disabled={!name.trim()}
                  onClick={handleGenerate}
                >
                  Gerar Cartão
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Loading ── */}
          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <LoaderIcon className="size-6 text-muted-foreground" />
              </motion.div>
              <span className="text-sm text-muted-foreground">
                Gerando cartão...
              </span>
            </motion.div>
          )}

          {/* ── Success ── */}
          {step === "success" && newCard && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="mb-1 text-xs text-muted-foreground">
                  Número do Cartão
                </p>
                <motion.p
                  className="font-mono text-sm font-medium tabular-nums"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  {newCard.cardNumber}
                </motion.p>
                <div className="mt-2 flex gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Validade</p>
                    <p className="text-xs font-medium tabular-nums">
                      {newCard.expiry}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CVV</p>
                    <p className="text-xs font-medium tabular-nums">
                      {newCard.cvv}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCopy()
                }}
              >
                {copied ? (
                  <>
                    <CheckIcon className="size-3.5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <CopyIcon className="size-3.5" />
                    Copiar Número
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
