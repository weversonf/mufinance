"use client"

import { useState } from "react"
import { ptBR } from "date-fns/locale"
import { CalendarDaysIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function parseISO(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return undefined
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? undefined : date
}

function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function DateField({ value, onChange, id, className }: { value: string; onChange: (value: string) => void; id?: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const selected = parseISO(value)
  const label = selected ? new Intl.DateTimeFormat("pt-BR").format(selected) : "Selecionar data"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            id={id}
            type="button"
            aria-label={selected ? `Data selecionada: ${label}` : "Selecionar data"}
            className={cn(
              "flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-background px-3 text-left text-sm text-foreground transition-colors outline-none hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-10",
              open && "border-ring ring-3 ring-ring/50",
              className
            )}
          >
            <span className={cn("tabular-nums", !selected && "text-muted-foreground")}>{label}</span>
            <CalendarDaysIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          locale={ptBR}
          captionLayout="dropdown"
          startMonth={new Date(2000, 0)}
          endMonth={new Date(2100, 11)}
          onSelect={(next) => {
            if (!next) return
            onChange(toISO(next))
            setOpen(false)
          }}
          autoFocus
        />
        <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
          <span className="text-xs text-muted-foreground">Selecione o dia</span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => {
              onChange(toISO(new Date()))
              setOpen(false)
            }}
          >
            Hoje
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
