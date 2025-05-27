"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Recommendation {
  id: string
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  category: 'technical' | 'content' | 'structure' | 'ai'
  estimatedTimeHours?: number
  potentialScoreIncrease?: number
}

interface RecommendationMatrixProps {
  recommendations: Recommendation[]
  onRecommendationClick?: (recommendation: Recommendation) => void
}

export default function RecommendationMatrix({ 
  recommendations, 
  onRecommendationClick 
}: RecommendationMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hoveredRec, setHoveredRec] = useState<string | null>(null)

  // Convert string values to numeric for positioning
  const getImpactValue = (impact: string) => {
    switch (impact) {
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
      default: return 1
    }
  }

  const getEffortValue = (effort: string) => {
    switch (effort) {
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
      default: return 1
    }
  }

  // Filter recommendations by category
  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory)

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(recommendations.map(rec => rec.category)))]

  // Color mapping for categories
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-500'
      case 'content': return 'bg-green-500'
      case 'structure': return 'bg-purple-500'
      case 'ai': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryColorLight = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'content': return 'bg-green-100 border-green-300 text-green-800'
      case 'structure': return 'bg-purple-100 border-purple-300 text-purple-800'
      case 'ai': return 'bg-orange-100 border-orange-300 text-orange-800'
      default: return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  // Position calculation for the matrix
  const getPosition = (rec: Recommendation) => {
    const impact = getImpactValue(rec.impact)
    const effort = getEffortValue(rec.effort)
    
    // Convert to percentage positions (with some padding)
    const x = ((4 - effort) / 3) * 80 + 10 // Invert effort (low effort = right side)
    const y = ((4 - impact) / 3) * 80 + 10 // Invert impact (high impact = top)
    
    return { x, y }
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-full transition-all",
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Matrix Visualization */}
      <div className="bg-card border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Impact vs Effort Matrix</h3>
          <p className="text-sm text-muted-foreground">
            Recommendations positioned by their potential impact and required effort. 
            Top-right quadrant shows high-impact, low-effort "quick wins".
          </p>
        </div>

        <div className="relative h-96 bg-gradient-to-tr from-red-50 via-yellow-50 to-green-50 dark:from-red-950/20 dark:via-yellow-950/20 dark:to-green-950/20 rounded-lg border">
          {/* Axis Labels */}
          <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90">
            <span className="text-sm font-medium text-muted-foreground">Impact</span>
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <span className="text-sm font-medium text-muted-foreground">← More Effort | Less Effort →</span>
          </div>

          {/* Quadrant Labels */}
          <div className="absolute top-4 right-4 text-xs font-medium text-green-700 dark:text-green-300">
            Quick Wins
          </div>
          <div className="absolute top-4 left-4 text-xs font-medium text-yellow-700 dark:text-yellow-300">
            Major Projects
          </div>
          <div className="absolute bottom-4 right-4 text-xs font-medium text-blue-700 dark:text-blue-300">
            Fill-ins
          </div>
          <div className="absolute bottom-4 left-4 text-xs font-medium text-red-700 dark:text-red-300">
            Thankless Tasks
          </div>

          {/* Grid Lines */}
          <div className="absolute inset-0">
            {/* Vertical lines */}
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-border opacity-30"></div>
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-border opacity-30"></div>
            {/* Horizontal lines */}
            <div className="absolute top-1/3 left-0 right-0 h-px bg-border opacity-30"></div>
            <div className="absolute top-2/3 left-0 right-0 h-px bg-border opacity-30"></div>
          </div>

          {/* Recommendations */}
          {filteredRecommendations.map((rec) => {
            const position = getPosition(rec)
            const isHovered = hoveredRec === rec.id
            
            return (
              <div
                key={rec.id}
                className={cn(
                  "absolute w-4 h-4 rounded-full cursor-pointer transition-all duration-200 transform -translate-x-1/2 -translate-y-1/2",
                  getCategoryColor(rec.category),
                  isHovered ? "scale-150 z-10" : "hover:scale-125"
                )}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`
                }}
                onMouseEnter={() => setHoveredRec(rec.id)}
                onMouseLeave={() => setHoveredRec(null)}
                onClick={() => onRecommendationClick?.(rec)}
                title={rec.title}
              />
            )
          })}

          {/* Tooltip */}
          {hoveredRec && (
            <div className="absolute z-20 bg-popover border rounded-lg shadow-lg p-3 max-w-xs pointer-events-none">
              {(() => {
                const rec = recommendations.find(r => r.id === hoveredRec)
                if (!rec) return null
                const position = getPosition(rec)
                
                return (
                  <div
                    className="transform -translate-x-1/2"
                    style={{
                      left: `${position.x}%`,
                      top: `${Math.max(10, position.y - 15)}%`
                    }}
                  >
                    <h4 className="font-semibold text-sm mb-1">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={cn("px-2 py-1 rounded-full", getCategoryColorLight(rec.category))}>
                        {rec.category}
                      </span>
                      <span className="text-muted-foreground">
                        {rec.impact} impact • {rec.effort} effort
                      </span>
                    </div>
                    {rec.estimatedTimeHours && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Est. {rec.estimatedTimeHours}h
                      </p>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Technical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Content</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Structure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>AI Optimization</span>
          </div>
        </div>
      </div>

      {/* Quick Wins List */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">
          🎯 Recommended Quick Wins (High Impact, Low Effort)
        </h4>
        <div className="space-y-2">
          {filteredRecommendations
            .filter(rec => rec.impact === 'high' && rec.effort === 'low')
            .slice(0, 3)
            .map(rec => (
              <div 
                key={rec.id} 
                className="flex items-center justify-between bg-white/80 dark:bg-gray-900/80 p-3 rounded border border-green-200 dark:border-green-700"
              >
                <div>
                  <h5 className="font-medium text-sm">{rec.title}</h5>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                </div>
                {rec.potentialScoreIncrease && (
                  <div className="text-xs font-medium text-green-600 dark:text-green-400">
                    +{rec.potentialScoreIncrease} pts
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
} 