"use client"

import { useViewMode } from './ViewModeProvider'
import { cn } from '@/lib/utils'

export default function ViewModeToggle() {
  const { viewMode, setViewMode, isSimpleMode, isExpertMode } = useViewMode()

  return (
    <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
      <button
        onClick={() => setViewMode('simple')}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
          isSimpleMode
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <div className="flex items-center space-x-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Simple</span>
        </div>
      </button>
      
      <button
        onClick={() => setViewMode('expert')}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
          isExpertMode
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <div className="flex items-center space-x-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Expert</span>
        </div>
      </button>
    </div>
  )
} 