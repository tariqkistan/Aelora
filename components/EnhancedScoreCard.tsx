"use client"

import { cn } from "@/lib/utils"

interface EnhancedScoreCardProps {
  title: string
  score: number
  description: string
  isPrimary?: boolean
  showDetails?: boolean
  trend?: 'up' | 'down' | 'stable'
  benchmark?: number
}

export default function EnhancedScoreCard({ 
  title, 
  score, 
  description, 
  isPrimary = false,
  showDetails = true,
  trend,
  benchmark
}: EnhancedScoreCardProps) {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 dark:text-emerald-400"
    if (score >= 70) return "text-green-600 dark:text-green-400"
    if (score >= 50) return "text-amber-600 dark:text-amber-400"
    if (score >= 30) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  // Determine stroke color for circular progress
  const getStrokeColor = (score: number) => {
    if (score >= 90) return "stroke-emerald-500"
    if (score >= 70) return "stroke-green-500"
    if (score >= 50) return "stroke-amber-500"
    if (score >= 30) return "stroke-orange-500"
    return "stroke-red-500"
  }

  // Calculate circle properties
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  // Get performance label
  const getPerformanceLabel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 70) return "Good"
    if (score >= 50) return "Fair"
    if (score >= 30) return "Poor"
    return "Critical"
  }

  // Trend icon
  const TrendIcon = () => {
    if (!trend) return null
    
    const iconClass = "w-4 h-4 ml-1"
    if (trend === 'up') {
      return (
        <svg className={cn(iconClass, "text-green-500")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      )
    }
    if (trend === 'down') {
      return (
        <svg className={cn(iconClass, "text-red-500")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      )
    }
    return (
      <svg className={cn(iconClass, "text-gray-400")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    )
  }

  return (
    <div 
      className={cn(
        "rounded-xl border p-6 shadow-sm transition-all hover:shadow-md", 
        isPrimary ? "border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10" : "bg-card"
      )}
    >
      <div className="flex items-start justify-between">
        {/* Left side - Text content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center">
            <h3 className="font-semibold text-lg">{title}</h3>
            <TrendIcon />
          </div>
          
          <div className="flex items-baseline space-x-2">
            <span className={cn("text-3xl font-bold", getScoreColor(score))}>
              {score}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
            <span className={cn("text-sm font-medium", getScoreColor(score))}>
              {getPerformanceLabel(score)}
            </span>
          </div>
          
          {showDetails && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}

          {/* Benchmark comparison */}
          {benchmark && (
            <div className="text-xs text-muted-foreground">
              Industry avg: {benchmark} 
              <span className={cn("ml-1 font-medium", score >= benchmark ? "text-green-600" : "text-red-600")}>
                ({score >= benchmark ? '+' : ''}{score - benchmark})
              </span>
            </div>
          )}
        </div>

        {/* Right side - Circular progress */}
        <div className="relative w-24 h-24 ml-4">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn("transition-all duration-1000 ease-out", getStrokeColor(score))}
            />
          </svg>
          
          {/* Center percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-lg font-bold", getScoreColor(score))}>
              {score}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 