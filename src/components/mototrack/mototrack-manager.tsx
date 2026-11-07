"use client"

import * as React from "react"
import {
  BikeIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  SparklesIcon,
  FuelIcon,
  WrenchIcon,
  ArrowRightLeftIcon,
  PlusCircleIcon,
  AlertCircleIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { syncMotoTrack, createMotoTrackAccount, type MotoTrackStatus } from "@/actions/mototrack"

export function MotoTrackManager({ initialStatus }: { initialStatus: MotoTrackStatus }) {
  const [status, setStatus] = React.useState<MotoTrackStatus>(initialStatus)
  const [syncing, setSyncing] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleSync = async () => {
    try {
      setSyncing(true)
      setFeedback(null)
      const res = await syncMotoTrack()
      setFeedback({ type: "success", message: res.message })
      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Erro ao sincronizar com MotoTrack." })
    } finally {
      setSyncing(false)
    }
  }

  const handleCreateAccount = async () => {
    try {
      setCreating(true)
      setFeedback(null)
      const res = await createMotoTrackAccount()
      setFeedback({ type: "success", message: res.message })
      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Erro ao conectar conta." })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner Principal de Integração */}
      <Card className="relative overflow-hidden border-border bg-card">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <BikeIcon className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-bold">MotoTrack Conectado</CardTitle>
                  {status.connected ? (
                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1 text-xs">
                      <CheckCircle2Icon className="size-3" />
                      Conectado (@{status.username || "weverson"})
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 gap-1 text-xs">
                      <AlertCircleIcon className="size-3" />
                      Desconectado
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm mt-0.5">
                  Sincronização bidirecional de combustível e manutenções com a categoria Transporte.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://wf-mototrack.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 h-8 rounded-md px-3 text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Abrir App
                <ExternalLinkIcon className="size-3.5" />
              </a>
              {status.connected ? (
                <Button
                  onClick={handleSync}
                  disabled={syncing}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <RefreshCwIcon className={`size-4 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Sincronizando..." : "Sincronizar agora"}
                </Button>
              ) : (
                <Button
                  onClick={handleCreateAccount}
                  disabled={creating}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <PlusCircleIcon className="size-4" />
                  {creating ? "Criando..." : "Criar conta / Vincular"}
                </Button>
              )}
            </div>
          </div>

          {feedback && (
            <div
              className={`mt-4 rounded-lg p-3 text-sm font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {feedback.message}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-2">
          {/* Métricas Rápidas */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BikeIcon className="size-3.5 text-primary" />
                Motos na Garagem
              </div>
              <p className="mt-1 text-xl font-black text-foreground">{status.motosCount}</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FuelIcon className="size-3.5 text-amber-400" />
                Abastecimentos
              </div>
              <p className="mt-1 text-xl font-black text-foreground">{status.fuelEntriesCount}</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <WrenchIcon className="size-3.5 text-blue-400" />
                Manutenções
              </div>
              <p className="mt-1 text-xl font-black text-foreground">{status.maintenanceCount}</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ArrowRightLeftIcon className="size-3.5 text-emerald-400" />
                No MuFinance
              </div>
              <p className="mt-1 text-xl font-black text-foreground">{status.transportCategoryCount} lançamentos</p>
            </div>
          </div>

          {/* Rodapé informativo */}
          <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border/40 bg-background/50 p-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <SparklesIcon className="size-4 text-primary shrink-0" />
              <span>
                Piloto identificado: <strong className="text-foreground">@{status.username || "weverson"}</strong> ({status.email || "weversonf@gmail.com"})
              </span>
            </div>
            {status.lastSyncedAt && (
              <div>
                Última atividade: <span className="font-mono text-foreground">{status.lastSyncedAt}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
