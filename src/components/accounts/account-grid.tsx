"use client"

import { useState } from "react"
import Image from "next/image"
import { TrendingUpIcon, TrendingDownIcon, ClockIcon, BuildingIcon } from "lucide-react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import type { BankAccount } from "@/data/seed"

interface AccountCardProps {
  account: BankAccount
  index: number
  onSelect?: (account: BankAccount) => void
}

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: "Conta Corrente",
  savings: "Poupança",
  digital: "Digital",
  investment: "Investimentos",
  crypto: "Criptomoedas",
  wallet: "Carteira",
}

export function AccountCard({ account, index, onSelect }: AccountCardProps) {
  const [imgError, setImgError] = useState(false)
  const typeLabel = ACCOUNT_TYPE_LABELS[account.type] ?? account.type

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => {
        onSelect?.(account)
      }}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
    >
      {/* Colored left border */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          account.color
        )}
      />

      <div className="p-4 pl-5">
        {/* Institution row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {imgError ? (
              <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                <BuildingIcon className="size-4 text-muted-foreground" />
              </div>
            ) : (
              <Image
                src={account.institutionLogo}
                alt={account.institution}
                width={32}
                height={32}
                unoptimized
                className="size-8 rounded-full bg-muted object-cover"
                onError={() => setImgError(true)}
              />
            )}
            <span className="text-xs text-muted-foreground">
              {account.institution}
            </span>
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {typeLabel}
          </span>
        </div>

        {/* Account name + number */}
        <div className="mt-3">
          <p className="text-sm font-semibold">{account.name}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {account.accountNumber}
          </p>
        </div>

        {/* Balance */}
        <p className={cn("mt-3 tabular-nums text-xl font-bold tracking-tight", account.balance < 0 && "text-rose-600 dark:text-rose-400")}>
          {fmt(account.balance)}
        </p>

        {/* Change badge + last activity */}
        <div className="mt-2 flex items-center justify-between">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              account.change >= 0
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-rose-500/10 text-rose-500"
            )}
          >
            {account.change >= 0 ? (
              <TrendingUpIcon className="size-3" />
            ) : (
              <TrendingDownIcon className="size-3" />
            )}
            <span className="tabular-nums">
              {account.change >= 0 ? "+" : "-"}
              {fmt(account.change)}{" "}
              ({Math.abs(account.changePercent).toFixed(1)}%)
            </span>
          </span>

          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ClockIcon className="size-3" />
            {account.lastActivity}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
