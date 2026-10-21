"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PrivacyContextType {
  privacyMode: boolean
  togglePrivacy: () => void
  maskValue: (value: string | number) => string
}

const PrivacyContext = React.createContext<PrivacyContextType>({
  privacyMode: false,
  togglePrivacy: () => {},
  maskValue: (v) => String(v),
})

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [privacyMode, setPrivacyMode] = React.useState(false)

  React.useEffect(() => {
    const saved = localStorage.getItem("mufinance_privacy")
    if (saved === "true") setPrivacyMode(true)
  }, [])

  const togglePrivacy = React.useCallback(() => {
    setPrivacyMode((prev) => {
      const next = !prev
      localStorage.setItem("mufinance_privacy", String(next))
      return next
    })
  }, [])

  const maskValue = React.useCallback((value: string | number) => {
    if (!privacyMode) return typeof value === "number" ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value) : String(value)
    return "R$ •••••"
  }, [privacyMode])

  return (
    <PrivacyContext.Provider value={{ privacyMode, togglePrivacy, maskValue }}>
      {children}
    </PrivacyContext.Provider>
  )
}

export function usePrivacy() {
  return React.useContext(PrivacyContext)
}

export function PrivacyToggle() {
  const { privacyMode, togglePrivacy } = usePrivacy()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 rounded-lg"
      onClick={togglePrivacy}
      title={privacyMode ? "Mostrar valores" : "Ocultar valores (Modo Privacidade)"}
    >
      {privacyMode ? (
        <EyeOffIcon className="size-4 text-muted-foreground transition-all" />
      ) : (
        <EyeIcon className="size-4 text-muted-foreground transition-all" />
      )}
      <span className="sr-only">Modo Privacidade</span>
    </Button>
  )
}
