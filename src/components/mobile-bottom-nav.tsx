"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  MoreHorizontalIcon,
  WalletIcon,
  LayoutDashboardIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"

const items = [
  { label: "Início", href: "/dashboard", icon: LayoutDashboardIcon },
  { label: "Transações", href: "/transactions", icon: ArrowLeftRightIcon },
  { label: "Contas", href: "/accounts", icon: WalletIcon },
  { label: "Análises", href: "/analytics", icon: BarChart3Icon },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="mx-auto grid h-[68px] max-w-md grid-cols-5 items-center rounded-[24px] border border-white/10 bg-zinc-950/95 px-1 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "text-white" : "text-zinc-400 hover:text-white",
              )}
            >
              <span className={cn("flex h-6 w-11 items-center justify-center rounded-full transition-colors", active && "bg-white/15")}><Icon className={cn("size-5", active && "stroke-[2.5]")} /></span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={() => setOpenMobile(true)}
          className="flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-medium text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Abrir mais opções"
        >
          <MoreHorizontalIcon className="size-5" />
          <span>Mais</span>
        </button>
      </div>
    </nav>
  )
}
