"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutGridIcon, LockIcon, RotateCcwIcon } from "lucide-react"

type CustomizerContextType = {
  editing: boolean
  setEditing: React.Dispatch<React.SetStateAction<boolean>>
  resetLayout: () => void
  registerReset: (fn: () => void) => void
}

const CustomizerContext = createContext<CustomizerContextType | null>(null)

export function DashboardCustomizerProvider({ children }: { children: React.ReactNode }) {
  const [editing, setEditing] = useState(false)
  const [resetFn, setResetFn] = useState<(() => void) | null>(null)
  const pathname = usePathname()

  // Reset editing mode when navigating away from dashboard
  useEffect(() => {
    if (pathname !== "/dashboard") {
      const timeout = window.setTimeout(() => setEditing(false), 0)
      return () => window.clearTimeout(timeout)
    }
  }, [pathname])

  const registerReset = useCallback((fn: () => void) => {
    setResetFn(() => fn)
  }, [])

  const resetLayout = useCallback(() => {
    if (resetFn) resetFn()
  }, [resetFn])

  return (
    <CustomizerContext.Provider value={{ editing, setEditing, resetLayout, registerReset }}>
      {children}
    </CustomizerContext.Provider>
  )
}

export function useDashboardCustomizer() {
  return useContext(CustomizerContext)
}

export function DashboardCustomizeHeaderButton() {
  const pathname = usePathname()
  const customizer = useDashboardCustomizer()

  if (pathname !== "/dashboard" || !customizer) return null

  const { editing, setEditing, resetLayout } = customizer

  return (
    <div className="flex items-center gap-1.5">
      {editing && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={resetLayout}
          title="Restaurar layout padrão"
        >
          <RotateCcwIcon className="size-3" />
          <span className="hidden md:inline">Restaurar</span>
        </Button>
      )}
      <Button
        variant={editing ? "default" : "outline"}
        size="sm"
        className="h-8 gap-1.5 px-2.5 text-xs font-medium"
        onClick={() => setEditing(!editing)}
      >
        {editing ? (
          <>
            <LockIcon className="size-3.5" />
            <span className="hidden sm:inline">Salvar</span>
          </>
        ) : (
          <>
            <LayoutGridIcon className="size-3.5" />
            <span className="hidden sm:inline">Personalizar</span>
          </>
        )}
      </Button>
    </div>
  )
}
