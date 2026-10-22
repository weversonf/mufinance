"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const labelMap: Record<string, string> = {
  dashboard: "Visão geral",
  accounts: "Contas",
  transactions: "Transações",
  transfers: "Transferências",
  cards: "Cartões",
  crypto: "Cripto",
  analytics: "Análises",
  investments: "Investimentos",
  budgets: "Orçamentos",
  settings: "Configurações",
  notifications: "Notificações",
  support: "Suporte",
  "sign-in": "Entrar",
  "sign-up": "Criar conta",
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/")
          const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
          const isLast = index === segments.length - 1

          return (
            <BreadcrumbItem key={href} className={index === 0 && segments.length > 1 ? "hidden md:block" : undefined}>
              {isLast ? (
                <h1 aria-current="page" className="font-normal text-foreground">{label}</h1>
              ) : (
                <>
                  <BreadcrumbLink render={<Link href={href} />}>
                    {label}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator className="hidden md:block" />
                </>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
