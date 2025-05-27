"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string | number
  description?: string
  className?: string
}

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  badge,
  description,
  className
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn("border rounded-lg bg-card shadow-sm", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold">{title}</h3>
            {badge && (
              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {badge}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {description && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                {description}
              </span>
            )}
            <svg
              className={cn(
                "w-5 h-5 text-muted-foreground transition-transform duration-200",
                isOpen ? "rotate-180" : ""
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 pb-6 border-t">
          <div className="pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 