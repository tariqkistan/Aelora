"use client"

import { cn } from "@/lib/utils"

interface ScoreCardProps {
  title: string
  score: number
  description: string
  isPrimary?: boolean
}

export default function ScoreCard({ title, score, description, isPrimary = false }: ScoreCardProps) {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500 dark:text-green-400"
    if (score >= 70) return "text-emerald-500 dark:text-emerald-400"
    if (score >= 50) return "text-amber-500 dark:text-amber-400"
    return "text-red-500 dark:text-red-400"
  }

  // Determine background color for progress bar
  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500 dark:bg-green-500"
    if (score >= 70) return "bg-emerald-500 dark:bg-emerald-500"
    if (score >= 50) return "bg-amber-500 dark:bg-amber-500"
    return "bg-red-500 dark:bg-red-500"
  }

  return (
    <div 
      className={cn(
        "rounded-lg border p-4 shadow-sm transition-all", 
        isPrimary ? "border-primary/50 bg-primary/5" : ""
      )}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <span className={cn("text-2xl font-bold", getScoreColor(score))}>
            {score}
          </span>
        </div>
        
        <div className="h-2 w-full rounded-full bg-muted">
          <div 
            className={cn("h-2 rounded-full", getProgressColor(score))} 
            style={{ width: `${score}%` }}
          />
        </div>
        
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
} 