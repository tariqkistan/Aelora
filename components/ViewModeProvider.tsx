"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type ViewMode = 'simple' | 'expert'

interface ViewModeContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  isSimpleMode: boolean
  isExpertMode: boolean
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined)

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>('simple')

  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aelora-view-mode')
    if (saved === 'simple' || saved === 'expert') {
      setViewModeState(saved)
    }
  }, [])

  // Save preference to localStorage
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode)
    localStorage.setItem('aelora-view-mode', mode)
  }

  const value = {
    viewMode,
    setViewMode,
    isSimpleMode: viewMode === 'simple',
    isExpertMode: viewMode === 'expert'
  }

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  const context = useContext(ViewModeContext)
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider')
  }
  return context
} 