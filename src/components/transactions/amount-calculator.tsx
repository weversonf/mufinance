"use client"

import { useState } from "react"
import { CalculatorIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function calculate(expression: string): number | null {
  const text = expression.replace(/,/g, ".").replace(/\s/g, "")
  if (!/^(?:\d+(?:\.\d+)?)(?:[+\-*/]\d+(?:\.\d+)?)*$/.test(text)) return null
  const tokens = text.match(/\d+(?:\.\d+)?|[+\-*/]/g) ?? []
  const terms = [Number(tokens[0])]
  const operators: string[] = []
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i]
    const value = Number(tokens[i + 1])
    if (op === "*" || op === "/") {
      if (op === "/" && value === 0) return null
      const previous = terms.pop()!
      terms.push(op === "*" ? previous * value : previous / value)
    } else {
      operators.push(op)
      terms.push(value)
    }
  }
  const result = operators.reduce((sum, op, index) => op === "+" ? sum + terms[index + 1] : sum - terms[index + 1], terms[0])
  return Number.isFinite(result) && result > 0 && result <= 1_000_000_000 ? Math.round((result + Number.EPSILON) * 100) / 100 : null
}

export function AmountCalculator({ value, onApply }: { value: string; onApply: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [expression, setExpression] = useState("")
  const [error, setError] = useState("")

  function apply() {
    const result = calculate(expression)
    if (result === null || result <= 0) { setError("Informe uma conta válida com resultado maior que zero."); return }
    onApply(result.toFixed(2))
    setOpen(false)
  }

  return <Popover open={open} onOpenChange={(next) => { setOpen(next); if (next) { setExpression(value || ""); setError("") } }}>
    <PopoverTrigger render={<Button type="button" variant="ghost" size="icon" aria-label="Abrir calculadora" className="absolute right-1 top-1/2 size-8 -translate-y-1/2" />}><CalculatorIcon className="size-4" /></PopoverTrigger>
    <PopoverContent align="end" className="w-64 p-3">
      <p className="font-semibold">Calculadora</p>
      <input aria-label="Conta da calculadora" inputMode="decimal" value={expression} onChange={(event) => { setExpression(event.target.value); setError("") }} placeholder="Ex.: 100 + 50" className="h-10 w-full rounded-md border bg-background px-3 text-right tabular-nums" />
      <div className="grid grid-cols-4 gap-1.5">
        {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ",", "⌫", "+"].map((key) => <Button key={key} type="button" variant="outline" size="sm" aria-label={key === "⌫" ? "Apagar último caractere" : key === "/" ? "Dividir" : key === "*" ? "Multiplicar" : key} onClick={() => { setExpression((current) => key === "⌫" ? current.slice(0, -1) : current + key); setError("") }}>{key === "/" ? "÷" : key === "*" ? "×" : key}</Button>)}
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => { setExpression(""); setError("") }}>Limpar</Button><Button type="button" size="sm" className="flex-1" onClick={apply}>Usar valor</Button></div>
    </PopoverContent>
  </Popover>
}
