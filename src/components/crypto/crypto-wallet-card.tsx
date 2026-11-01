"use client"

import Link from "next/link"
import { ArrowRightIcon, WalletIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CryptoWalletCard() {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Sua carteira</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <WalletIcon className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">R$ 0,00</p>
            <p className="text-xs text-muted-foreground">Saldo em criptomoedas</p>
          </div>
        </div>

        <div className="space-y-1 rounded-lg bg-muted/40 px-3 py-3">
          <p className="text-sm font-medium">Nenhuma carteira vinculada</p>
          <p className="text-xs text-muted-foreground">
            Vincule uma conta do tipo Cripto em Contas para acompanhar saldos, posições e negociações.
          </p>
        </div>

        <Button variant="outline" className="w-full gap-1.5" render={<Link href="/accounts" />}>
          Vincular conta
          <ArrowRightIcon className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}
