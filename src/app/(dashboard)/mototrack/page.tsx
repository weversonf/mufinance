import { Metadata } from "next"
import { getMotoTrackStatus } from "@/actions/mototrack"
import { MotoTrackManager } from "@/components/mototrack/mototrack-manager"

export const metadata: Metadata = {
  title: "MotoTrack — MuFinance",
  description: "Gerencie a integração e sincronização com o app MotoTrack",
}

export default async function MotoTrackPage() {
  const status = await getMotoTrackStatus()

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">MotoTrack</h1>
        <p className="text-sm text-muted-foreground">
          Conecte sua garagem do MotoTrack para sincronizar automaticamente abastecimentos e manutenções com a categoria Transporte do MuFinance.
        </p>
      </div>

      <MotoTrackManager initialStatus={status} />
    </div>
  )
}
