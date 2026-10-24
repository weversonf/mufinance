"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useFinanceData } from "@/components/finance/finance-provider"
import { getMyProfile, saveMyProfile } from "@/actions/profiles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  UserIcon,
  ShieldIcon,
  BellIcon,
  CreditCardIcon,
  PaletteIcon,
  LoaderIcon,
  MonitorIcon,
  SunIcon,
  MoonIcon,
  CheckIcon,
  DownloadIcon,
  SmartphoneIcon,
  LaptopIcon,
  TabletIcon,
  SparklesIcon,
} from "lucide-react"

type TabId = "profile" | "security" | "notifications" | "billing" | "appearance"

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Perfil", icon: <UserIcon className="size-4" /> },
  { id: "security", label: "Segurança", icon: <ShieldIcon className="size-4" /> },
  { id: "notifications", label: "Notificações", icon: <BellIcon className="size-4" /> },
  { id: "billing", label: "Plano e Assinatura", icon: <CreditCardIcon className="size-4" /> },
  { id: "appearance", label: "Aparência", icon: <PaletteIcon className="size-4" /> },
]

// ── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user } = useAuth()
  const { refresh } = useFinanceData()
  const [saving, setSaving] = React.useState(false)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [profileError, setProfileError] = React.useState("")
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    if (!user) return
    setName(user.displayName?.trim() || user.email?.split("@")[0] || "")
    setEmail(user.email || "")
    void getMyProfile().then((profile) => {
      if (!profile) return
      setName(profile.displayName)
      setEmail(profile.email)
      setUsername(profile.username)
    }).catch(() => {})
  }, [user])

  async function handleSave() {
    setSaving(true)
    setProfileError("")
    setSaved(false)
    try {
      const profile = await saveMyProfile({ displayName: name, username })
      await refresh()
      setUsername(profile.username)
      setSaved(true)
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Não foi possível salvar o perfil.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Informações do perfil</CardTitle>
          <CardDescription>Atualize os dados do seu perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user?.photoURL || ""} alt={name || "User avatar"} />
              <AvatarFallback className="text-lg">{name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "M"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                Nome completo
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Endereço de e-mail
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="username">
                Usuário para transferências
              </label>
              <div className="relative max-w-md">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/^@+/, "").replace(/[^a-z0-9._]/g, ""))}
                  placeholder="weverson"
                  autoComplete="username"
                  className="pl-8"
                  minLength={3}
                  maxLength={24}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Seu identificador único para receber saldo de outros usuários do MuFinance.
              </p>
            </div>
          </div>

          {profileError && <p role="alert" className="text-sm text-destructive">{profileError}</p>}
          {saved && <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">Perfil salvo. Você pode receber por @{username}.</p>}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || name.trim().length < 2 || username.length < 3}>
              {saving && <LoaderIcon className="mr-2 size-4 animate-spin" />}
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50 mt-6">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>Ações irreversíveis para sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-medium">Zerar todas as transações</h4>
              <p className="text-sm text-muted-foreground">Isso apagará permanentemente todo o histórico e zerará o saldo das contas.</p>
            </div>
            <DangerZoneDialog />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function DangerZoneDialog() {
  const [open, setOpen] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function handleDeleteAll() {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/finance/delete-all-data`, { method: "POST" })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Erro na API")
      }
      const data = await res.json()
      try {
        localStorage.setItem("mufinance_demo_mode", "false")
      } catch {}
      alert(`Tudo apagado com sucesso. ${data.deleted ?? 0} documentos removidos (transações, contas, cartões, categorias, metas, orçamentos).`)
      setOpen(false)
      window.location.reload()
    } catch (err) {
      alert("Erro ao excluir dados. " + (err instanceof Error ? err.message : ""))
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>Zerar Tudo</Button>
      
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <CardHeader>
              <CardTitle className="text-destructive">Atenção Absoluta</CardTitle>
              <CardDescription>
                Você está prestes a apagar permanentemente todas as suas transações e zerar todos os saldos de contas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-medium">
                Para confirmar, digite <span className="select-all font-mono font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">zerar tudo</span> abaixo:
              </p>
              <Input 
                value={confirmText} 
                onChange={e => setConfirmText(e.target.value)} 
                placeholder="zerar tudo"
                className="font-mono border-destructive/50 focus-visible:ring-destructive"
              />
            </CardContent>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <Button variant="outline" onClick={() => { setOpen(false); setConfirmText("") }}>Cancelar</Button>
              <Button 
                variant="destructive" 
                disabled={confirmText.trim().toLowerCase() !== "zerar tudo" || isDeleting}
                onClick={handleDeleteAll}
              >
                {isDeleting ? "Apagando..." : "Sim, excluir tudo"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

// ── Security Tab ─────────────────────────────────────────────────────────────

const mockSessions = [
  { device: "MacBook Pro", icon: <LaptopIcon className="size-4" />, location: "São Paulo, SP", lastActive: "Ativo agora" },
  { device: "iPhone 15", icon: <SmartphoneIcon className="size-4" />, location: "São Paulo, SP", lastActive: "Há 2 horas" },
  { device: "Navegador Web", icon: <TabletIcon className="size-4" />, location: "Fortaleza, CE", lastActive: "Há 3 dias" },
]

function SecurityTab() {
  const [twoFA, setTwoFA] = React.useState(true)

  return (
    <div className="space-y-6">
      {/* Alterar senha */}
      <Card>
        <CardHeader>
          <CardTitle>Alterar senha</CardTitle>
          <CardDescription>
            Atualize sua senha para manter sua conta protegida
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="current-pw">
              Senha atual
            </label>
            <Input id="current-pw" type="password" placeholder="Digite a senha atual" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-pw">
                Nova senha
              </label>
              <Input id="new-pw" type="password" placeholder="Digite a nova senha" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="confirm-pw">
                Confirmar nova senha
              </label>
              <Input id="confirm-pw" type="password" placeholder="Confirme a nova senha" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Atualizar senha</Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor */}
      <Card>
        <CardHeader>
          <CardTitle>Autenticação em dois fatores</CardTitle>
          <CardDescription>
            Adicione uma camada extra de proteção à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {twoFA ? "Ativado" : "Desativado"}
              </p>
              <p className="text-sm text-muted-foreground">
                {twoFA
                  ? "Sua conta está protegida com autenticação em duas etapas"
                  : "Ative a verificação em duas etapas para mais segurança"}
              </p>
            </div>
            <Switch checked={twoFA} onCheckedChange={setTwoFA} />
          </div>
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Sessões ativas</CardTitle>
          <CardDescription>
            Gerencie os dispositivos conectados à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockSessions.map((s) => (
            <div
              key={s.device}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                  {s.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{s.device}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.location} &middot; {s.lastActive}
                  </p>
                </div>
              </div>
              {s.lastActive !== "Ativo agora" && (
                <Button variant="outline" size="sm">
                  Revogar
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Notifications Tab ────────────────────────────────────────────────────────

const notifToggles = [
  { id: "email", label: "Notificações por e-mail", description: "Receba alertas e comunicados importantes por e-mail", default: true },
  { id: "push", label: "Notificações push", description: "Receba alertas instantâneos nos seus dispositivos", default: true },
  { id: "transaction", label: "Alertas de transações", description: "Notificação a cada novo lançamento registrado", default: true },
  { id: "security", label: "Alertas de segurança", description: "Avisos sobre atividades suspeitas e novos logins", default: true },
  { id: "marketing", label: "Novidades do MuFinance", description: "Receba novidades, dicas financeiras e melhorias", default: false },
  { id: "digest", label: "Resumo semanal", description: "Relatório consolidado semanal das suas finanças", default: true },
]

function NotificationsTab() {
  const [settings, setSettings] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(notifToggles.map((t) => [t.id, t.default]))
  )

  function toggle(id: string) {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências de notificações</CardTitle>
        <CardDescription>
          Escolha quais notificações você deseja receber
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {notifToggles.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-lg px-1 py-3"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-sm text-muted-foreground">{t.description}</p>
            </div>
            <Switch
              checked={settings[t.id]}
              onCheckedChange={() => toggle(t.id)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── Billing Tab ──────────────────────────────────────────────────────────────

const invoices = [
  { date: "01/03/2026", amount: "R$ 0,00", status: "Plano gratuito", id: "INV-001" },
  { date: "01/02/2026", amount: "R$ 0,00", status: "Plano gratuito", id: "INV-002" },
  { date: "01/01/2026", amount: "R$ 0,00", status: "Plano gratuito", id: "INV-003" },
]

const freeFeatures = [
  "Gestão de contas bancárias",
  "Controle completo de receitas e despesas",
  "Metas e acompanhamento de orçamento",
  "Suporte padrão",
]

const proFeatures = [
  "Contas e cartões ilimitados",
  "Análises financeiras avançadas e insights",
  "Geração de cartões virtuais ilimitados",
  "Suporte prioritário 24/7",
  "Categorias de orçamento personalizadas",
  "Exportação completa em CSV e relatórios",
]

function BillingTab() {
  return (
    <div className="space-y-6">
      {/* Plano atual */}
      <Card>
        <CardHeader>
          <CardTitle>Plano atual</CardTitle>
          <CardDescription>
            Você está no plano gratuito
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">MuFinance Free</h3>
                <Badge variant="secondary">Atual</Badge>
              </div>
              <ul className="mt-3 space-y-1.5">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckIcon className="size-3.5 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums">R$ 0</p>
              <p className="text-sm text-muted-foreground">/mês</p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <SparklesIcon className="size-4 text-primary" />
                  <h4 className="font-semibold">MuFinance Pro</h4>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckIcon className="size-3.5 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums">R$ 12</p>
                <p className="text-sm text-muted-foreground">/mês</p>
              </div>
            </div>
            <div className="mt-4">
              <Button>Atualizar para o Pro</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Método de pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Método de pagamento</CardTitle>
          <CardDescription>Gerencie seus dados de pagamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                <CreditCardIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Cartão de Crédito</p>
                <p className="text-xs text-muted-foreground">Nenhum cartão cadastrado</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de cobrança */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de cobrança</CardTitle>
          <CardDescription>
            Baixe faturas e comprovantes anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Fatura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell className="tabular-nums">{inv.amount}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{inv.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-xs">
                      <DownloadIcon className="size-3.5" />
                      <span className="sr-only">Baixar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Aparência Tab ───────────────────────────────────────────────────────────

function AparênciaTab() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const themes: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: "light", label: "Claro", icon: <SunIcon className="size-5" /> },
    { id: "dark", label: "Escuro", icon: <MoonIcon className="size-5" /> },
    { id: "system", label: "Sistema", icon: <MonitorIcon className="size-5" /> },
  ]

  if (!mounted) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>
          Personalize como o MuFinance é exibido no seu dispositivo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border-2 p-6 transition-all hover:bg-muted/50",
                theme === t.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              )}
            >
              {t.icon}
              <span className="text-sm font-medium">{t.label}</span>
              {theme === t.id && (
                <CheckIcon className="size-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main Settings Page ───────────────────────────────────────────────────────

export function SettingsPageClient() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = React.useState<TabId>(
    tabs.some((t) => t.id === tabParam) ? (tabParam as TabId) : "profile"
  )

  const tabContent: Record<TabId, React.ReactNode> = {
    profile: <ProfileTab />,
    security: <SecurityTab />,
    notifications: <NotificationsTab />,
    billing: <BillingTab />,
    appearance: <AparênciaTab />,
  }

  return (
    <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:gap-6">
      {/* Left nav (desktop) */}
      <nav className="hidden w-52 shrink-0 flex-col gap-1 lg:flex">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "justify-start gap-2",
              activeTab === tab.id && "font-semibold"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </nav>

      {/* Mobile tab bar */}
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2 lg:hidden">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "secondary" : "ghost"}
            size="sm"
            className="shrink-0 gap-1.5 text-xs"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content — full width */}
      <div className="min-w-0 flex-1">{tabContent[activeTab]}</div>
    </div>
  )
}
