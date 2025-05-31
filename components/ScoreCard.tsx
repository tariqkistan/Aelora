"use client"

import { cn } from "@/lib/utils"

interface ScoreCardProps {
  title: string
  score: number
  description: string
  isPrimary?: boolean
  trend?: 'up' | 'down' | 'stable'
  previousScore?: number
}

export default function ScoreCard({ 
  title, 
  score, 
  description, 
  isPrimary = false,
  trend,
  previousScore 
}: ScoreCardProps) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'stroke-green-500'
    if (score >= 60) return 'stroke-yellow-500'
    return 'stroke-red-500'
  }
  
  const getTrendIcon = () => {
    if (!trend) return null
    
    switch (trend) {
      case 'up':
        return (
          <div className="flex items-center text-green-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {previousScore && `+${(score - previousScore).toFixed(1)}`}
          </div>
        )
      case 'down':
        return (
          <div className="flex items-center text-red-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {previousScore && `${(score - previousScore).toFixed(1)}`}
          </div>
        )
      case 'stable':
        return (
          <div className="flex items-center text-gray-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            No change
          </div>
        )
    }
  }

  return (
    <div className={`rounded-lg border shadow-sm p-6 ${
      isPrimary 
        ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20' 
        : 'bg-card'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {getTrendIcon()}
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
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
              className={`${getProgressColor(score)} transition-all duration-1000 ease-out`}
              style={{
                animation: 'progress 1.5s ease-out forwards'
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground text-center">{description}</p>
      
      <style jsx>{`
        @keyframes progress {
          from {
            stroke-dashoffset: ${circumference};
          }
          to {
            stroke-dashoffset: ${strokeDashoffset};
          }
        }
      `}</style>
    </div>
  )
} 