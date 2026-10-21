"use client"

import { useState } from "react"
import { PlusIcon, CheckIcon, LoaderIcon } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { createAccount } from "@/actions/finance"
import { useFinanceData } from "@/components/finance/finance-provider"

import type { BankAccount } from "@/data/seed"

interface AddAccountProps {
  onAdd?: (account: BankAccount) => void
}

type Step = "idle" | "form" | "loading" | "success"

const accountTypes = [
  { value: "checking", label: "Conta Corrente" },
  { value: "savings", label: "Poupança" },
  { value: "digital", label: "Digital" },
  { value: "investment", label: "Investimentos" },
  { value: "crypto", label: "Criptomoedas" },
] as const

const typeColors: Record<string, string> = {
  checking: "bg-blue-500",
  savings: "bg-emerald-500",
  digital: "bg-violet-500",
  investment: "bg-indigo-500",
  crypto: "bg-orange-500",
}

export function AddAccount({ onAdd }: AddAccountProps) {
  const { refresh } = useFinanceData()
  const [step, setStep] = useState<Step>("idle")
  const [institution, setInstitution] = useState("")
  const [accountType, setAccountType] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [initialBalance, setInitialBalance] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleConnect() {
    if (!institution || !accountType) return

    setStep("loading")
    setErrorMsg("")
    try {
      const parsedBalance = parseFloat(initialBalance.replace(",", ".")) || 0
      const created = await createAccount({
        name: institution.trim(),
        type: accountType as "checking" | "savings" | "digital" | "investment" | "crypto" | "wallet",
        balance: parsedBalance,
        color: typeColors[accountType] ?? "mint",
        icon: "bank",
        currency: "BRL",
        createAdjustment: false,
      })

      if (onAdd) {
        onAdd({
          id: created.id,
          name: institution.trim(),
          type: accountType as BankAccount["type"],
          institution: institution.trim(),
          institutionLogo: "/icon.svg",
          accountNumber: accountNumber ? `****${accountNumber.slice(-4)}` : `****${created.id.slice(-4)}`,
          balance: parsedBalance,
          currency: "BRL",
          change: 0,
          changePercent: 0,
          lastActivity: "Agora",
          color: typeColors[accountType] ?? "bg-blue-500",
        })
      }

      await refresh()
      setStep("success")

      setTimeout(() => {
        setStep("idle")
        setInstitution("")
        setAccountType("")
        setAccountNumber("")
        setInitialBalance("")
      }, 1500)
    } catch (err) {
      console.error("Falha ao criar conta:", err)
      setErrorMsg(err instanceof Error ? err.message : "Não foi possível criar a conta.")
      setStep("form")
    }
  }

  return (
    <Card
      className={cn(
        "flex min-h-[180px] items-center justify-center border-2 border-dashed ring-0 transition-colors",
        step === "idle" && "cursor-pointer hover:border-primary/40 hover:bg-muted/30"
      )}
      onClick={() => step === "idle" && setStep("form")}
    >
      <CardContent className="flex w-full flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {step === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <PlusIcon className="size-5" />
              </div>
              <span className="text-sm font-medium">Adicionar conta</span>
            </motion.div>
          )}

          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex w-full flex-col gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                placeholder="Nome da conta (ex: Nubank, Itaú, Carteira)"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
              <Select
                value={accountType}
                onValueChange={(v) => v && setAccountType(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo de conta" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Nº da conta (opcional)"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
                <Input
                  placeholder="Saldo inicial R$"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                />
              </div>
              {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setStep("idle")
                    setInstitution("")
                    setAccountType("")
                    setAccountNumber("")
                    setInitialBalance("")
                    setErrorMsg("")
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={!institution.trim() || !accountType}
                  onClick={handleConnect}
                >
                  Adicionar
                </Button>
              </div>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <LoaderIcon className="size-6 animate-spin" />
              <span className="text-sm">Salvando no Firestore...</span>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-emerald-500"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckIcon className="size-5" />
              </div>
              <span className="text-sm font-medium">Conta criada!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
