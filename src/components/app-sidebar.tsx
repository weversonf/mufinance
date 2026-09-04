"use client"

import * as React from "react"
import Link from "next/link"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/components/auth/auth-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  WalletIcon,
  ArrowLeftRightIcon,
  CreditCardIcon,
  ChartAreaIcon,
  TargetIcon,
  SettingsIcon,
  LifeBuoyIcon,
  LandmarkIcon,
  SendIcon,
  TrendingUpIcon,
  BitcoinIcon,
  BellIcon,
  LogInIcon,
  UserPlusIcon,
} from "lucide-react"

const navigation = {
  navDaily: [
    { title: "Visão geral", url: "/dashboard", icon: <LayoutDashboardIcon /> },
    { title: "Contas", url: "/accounts", icon: <WalletIcon /> },
    { title: "Transações", url: "/transactions", icon: <ArrowLeftRightIcon /> },
    { title: "Cartões", url: "/cards", icon: <CreditCardIcon /> },
  ],
  navMoney: [
    { title: "Transferências", url: "/transfers", icon: <SendIcon /> },
    { title: "Ações & Renda Fixa", url: "/investments", icon: <TrendingUpIcon /> },
    { title: "Criptomoedas", url: "/crypto", icon: <BitcoinIcon /> },
  ],
  navInsights: [
    { title: "Análises", url: "/analytics", icon: <ChartAreaIcon /> },
    { title: "Orçamentos", url: "/budgets", icon: <TargetIcon /> },
  ],
  navAuth: [
    { title: "Entrar", url: "/sign-in", icon: <LogInIcon /> },
    { title: "Criar conta", url: "/sign-up", icon: <UserPlusIcon /> },
  ],
  navSecondary: [
    { title: "Notificações", url: "/notifications", icon: <BellIcon /> },
    { title: "Configurações", url: "/settings", icon: <SettingsIcon /> },
    { title: "Ajuda e suporte", url: "/support", icon: <LifeBuoyIcon /> },
  ],
}

function getProfile(user: ReturnType<typeof useAuth>["user"]) {
  const name = user?.displayName?.trim() || user?.email?.split("@")[0] || "Usuário MuFinance"
  return {
    name,
    email: user?.email || "",
    avatar: user?.photoURL || "",
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const profile = getProfile(user)

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <LandmarkIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">MuFinance</span>
                <span className="truncate text-xs text-muted-foreground">
                  Controle financeiro pessoal
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation.navDaily} label="Dia a dia" />
        <NavMain items={navigation.navMoney} label="Investimentos" />
        <NavMain items={navigation.navInsights} label="Análises" />
        {!user && <NavMain items={navigation.navAuth} label="Acesso" />}
        <NavSecondary items={navigation.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={profile} />
      </SidebarFooter>
    </Sidebar>
  )
}
