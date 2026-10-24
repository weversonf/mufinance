"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboardIcon,
  WalletIcon,
  ArrowLeftRightIcon,
  CreditCardIcon,
  SendIcon,
  TrendingUpIcon,
  BitcoinIcon,
  ChartAreaIcon,
  TargetIcon,
  SettingsIcon,
  BellIcon,
  LogInIcon,
  UserPlusIcon,
  LifeBuoyIcon,
  SearchIcon,
  MoonIcon,
  SunIcon,
  MonitorIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useFinanceData } from "@/components/finance/finance-provider"

export function CommandPalette() {
  const { contacts, recentTransactions, cryptoCoins } = useFinanceData()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const run = useCallback(
    (fn: () => void) => {
      setOpen(false)
      fn()
    },
    []
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Paleta de comandos"
      description="Pesquise páginas, transações, contatos e mais"
    >
      <Command>
        <CommandInput placeholder="Digite um comando ou pesquise..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

          <CommandGroup heading="Páginas">
            {[
              { label: "Visão geral", icon: LayoutDashboardIcon, href: "/dashboard" },
              { label: "Contas", icon: WalletIcon, href: "/accounts" },
              { label: "Transações", icon: ArrowLeftRightIcon, href: "/transactions" },
              { label: "Transferências", icon: SendIcon, href: "/transfers" },
              { label: "Cartões", icon: CreditCardIcon, href: "/cards" },
              { label: "Cripto", icon: BitcoinIcon, href: "/crypto" },
              { label: "Análises", icon: ChartAreaIcon, href: "/analytics" },
              { label: "Investimentos", icon: TrendingUpIcon, href: "/investments" },
              { label: "Orçamentos", icon: TargetIcon, href: "/budgets" },
              { label: "Configurações", icon: SettingsIcon, href: "/settings" },
              { label: "Notificações", icon: BellIcon, href: "/notifications" },
              { label: "Ajuda e suporte", icon: LifeBuoyIcon, href: "/support" },
              { label: "Entrar", icon: LogInIcon, href: "/sign-in" },
              { label: "Criar conta", icon: UserPlusIcon, href: "/sign-up" },
            ].map((page) => (
              <CommandItem key={page.href} onSelect={() => run(() => router.push(page.href))}>
                <page.icon className="mr-2 size-4" />
                {page.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Transações recentes">
            {recentTransactions.slice(0, 5).map((tx) => (
              <CommandItem key={tx.id} onSelect={() => run(() => router.push("/transactions"))}>
                <SearchIcon className="mr-2 size-4" />
                {tx.merchant}
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                  {tx.amount > 0 ? "+" : ""}
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Math.abs(tx.amount))}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Transferência rápida">
            {contacts.slice(0, 4).map((c) => (
              <CommandItem key={c.id} onSelect={() => run(() => router.push("/transfers"))}>
                <SendIcon className="mr-2 size-4" />
                Enviar para {c.name}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Cripto">
            {cryptoCoins.slice(0, 4).map((coin) => (
              <CommandItem key={coin.id} onSelect={() => run(() => router.push("/crypto"))}>
                <BitcoinIcon className="mr-2 size-4" />
                {coin.name}
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                  ${coin.price.toLocaleString()}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Tema">
            <CommandItem onSelect={() => run(() => setTheme("light"))}>
              <SunIcon className="mr-2 size-4" />
              Tema claro
            </CommandItem>
            <CommandItem onSelect={() => run(() => setTheme("dark"))}>
              <MoonIcon className="mr-2 size-4" />
              Tema escuro
            </CommandItem>
            <CommandItem onSelect={() => run(() => setTheme("system"))}>
              <MonitorIcon className="mr-2 size-4" />
              Usar tema do sistema
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
