"use client"

import { useEffect, useState, type FormEvent } from "react"
import { createCreditCard, updateCreditCard } from "@/actions/finance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type CardRecord = Record<string, unknown> & { id: string }

export function CardEditorDialog({ open, onOpenChange, card, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; card?: CardRecord; onSaved: () => Promise<void> | void }) {
  const [name, setName] = useState("")
  const [last4, setLast4] = useState("")
  const [brand, setBrand] = useState("Visa")
  const [color, setColor] = useState("ocean")
  const [limit, setLimit] = useState("")
  const [closingDay, setClosingDay] = useState("1")
  const [dueDay, setDueDay] = useState("10")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setName(String(card?.name ?? "")); setLast4(String(card?.last4 ?? "")); setBrand(String(card?.brand ?? "Visa")); setColor(String(card?.color ?? "ocean")); setLimit(card ? String(card.limit ?? "") : ""); setClosingDay(String(card?.closingDay ?? "1")); setDueDay(String(card?.dueDay ?? "10")); setError("")
  }, [open, card])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true); setError("")
    try {
      const data = { name, last4, brand, color, limit: Number(limit), closingDay: Number(closingDay), dueDay: Number(dueDay) }
      if (card) await updateCreditCard(card.id, data)
      else await createCreditCard(data)
      await onSaved()
      onOpenChange(false)
    } catch {
      setError("Não foi possível salvar o cartão. Confira os dados e tente novamente.")
    } finally { setSaving(false) }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{card ? "Editar cartão" : "Adicionar cartão"}</DialogTitle><DialogDescription>Cadastre apenas os quatro últimos dígitos. Não informe número completo nem CVV.</DialogDescription></DialogHeader><form onSubmit={save} className="grid grid-cols-2 gap-3">
    <label className="col-span-2 grid gap-1 text-sm">Nome ou instituição<Input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Nubank, Caixa, Itaú" /></label>
    <label className="grid gap-1 text-sm">Últimos 4 dígitos<Input required inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={last4} onChange={(event) => setLast4(event.target.value.replace(/\D/g, ""))} /></label>
    <label className="grid gap-1 text-sm">Bandeira<select value={brand} onChange={(event) => setBrand(event.target.value)} className="h-9 rounded-md border bg-background px-3">{["Visa", "Mastercard", "Elo", "Amex"].map((value) => <option key={value}>{value}</option>)}</select></label>
    <label className="grid gap-1 text-sm">Limite (R$)<Input required type="number" min="0.01" step="0.01" value={limit} onChange={(event) => setLimit(event.target.value)} /></label>
    <label className="grid gap-1 text-sm">Cor alternativa<select value={color} onChange={(event) => setColor(event.target.value)} className="h-9 rounded-md border bg-background px-3"><option value="ocean">Azul</option><option value="forest">Verde</option><option value="plum">Roxo</option><option value="sunset">Laranja</option><option value="graphite">Grafite</option></select></label>
    <label className="grid gap-1 text-sm">Dia de fechamento<Input required type="number" min="1" max="31" value={closingDay} onChange={(event) => setClosingDay(event.target.value)} /></label>
    <label className="grid gap-1 text-sm">Dia de vencimento<Input required type="number" min="1" max="31" value={dueDay} onChange={(event) => setDueDay(event.target.value)} /></label>
    {error && <p role="alert" className="col-span-2 text-sm text-destructive">{error}</p>}
    <DialogFooter className="col-span-2"><Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar cartão"}</Button></DialogFooter>
  </form></DialogContent></Dialog>
}
