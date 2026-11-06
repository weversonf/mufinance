import { AppSidebar } from "@/components/app-sidebar"
import { AuthGuard } from "@/components/auth/auth-guard"
import { FinanceProvider } from "@/components/finance/finance-provider"
import { MarketProvider } from "@/components/market/market-provider"
import { CommandPalette } from "@/components/command-palette"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { GlobalAddTransaction } from "@/components/global-add-transaction"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { PrivacyProvider, PrivacyToggle } from "@/components/privacy-toggle"
import { DashboardCustomizerProvider, DashboardCustomizeHeaderButton } from "@/components/dashboard/dashboard-customizer-context"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <FinanceProvider>
        <MarketProvider>
        <DashboardCustomizerProvider>
          <PrivacyProvider>
            <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 pt-[env(safe-area-inset-top)] sm:h-16">
          <div className="flex min-w-0 items-center gap-2 px-3 sm:px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <div className="min-w-0 truncate">
              <DynamicBreadcrumb />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 pr-3 sm:gap-3 sm:pr-4">
            <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
               Ctrl + K
            </kbd>
            <div className="hidden items-center gap-1.5 sm:contents">
              <DashboardCustomizeHeaderButton />
            </div>
            <PrivacyToggle />
            <ThemeToggle />
          </div>
        </header>
        <CommandPalette />
        <main className="flex min-w-0 flex-1 flex-col pb-24 md:pb-0">{children}</main>
        <GlobalAddTransaction />
      </SidebarInset>
      <MobileBottomNav />
          </SidebarProvider>
        </PrivacyProvider>
        </DashboardCustomizerProvider>
        </MarketProvider>
      </FinanceProvider>
    </AuthGuard>
  )
}
