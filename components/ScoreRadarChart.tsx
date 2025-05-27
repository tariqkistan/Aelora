"use client"

import { cn } from '@/lib/utils'

interface ScoreData {
  label: string
  score: number
  maxScore: number
  color?: string
}

interface ScoreRadarChartProps {
  scores: ScoreData[]
  size?: number
  showLabels?: boolean
  showGrid?: boolean
  className?: string
}

export default function ScoreRadarChart({
  scores,
  size = 300,
  showLabels = true,
  showGrid = true,
  className
}: ScoreRadarChartProps) {
  const center = size / 2
  const radius = size * 0.35
  const labelRadius = size * 0.45

  // Calculate points for each score
  const getPoint = (index: number, value: number, maxValue: number, radiusMultiplier = 1) => {
    const angle = (index * 2 * Math.PI) / scores.length - Math.PI / 2
    const normalizedValue = value / maxValue
    const pointRadius = radius * normalizedValue * radiusMultiplier
    
    return {
      x: center + pointRadius * Math.cos(angle),
      y: center + pointRadius * Math.sin(angle)
    }
  }

  // Calculate label positions
  const getLabelPoint = (index: number) => {
    const angle = (index * 2 * Math.PI) / scores.length - Math.PI / 2
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle)
    }
  }

  // Generate grid circles
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]
  
  // Generate axis lines
  const axisLines = scores.map((_, index) => {
    const point = getPoint(index, 1, 1)
    return `M ${center} ${center} L ${point.x} ${point.y}`
  })

  // Generate score polygon
  const scorePoints = scores.map((score, index) => {
    const point = getPoint(index, score.score, score.maxScore)
    return `${point.x},${point.y}`
  }).join(' ')

  // Generate benchmark polygon (if available)
  const benchmarkPoints = scores.map((score, index) => {
    // Use 70% as default benchmark
    const benchmarkValue = 70
    const point = getPoint(index, benchmarkValue, score.maxScore)
    return `${point.x},${point.y}`
  }).join(' ')

  // Get overall performance color
  const getOverallColor = () => {
    const avgScore = scores.reduce((sum, score) => sum + (score.score / score.maxScore), 0) / scores.length
    if (avgScore >= 0.9) return 'text-emerald-600'
    if (avgScore >= 0.7) return 'text-green-600'
    if (avgScore >= 0.5) return 'text-amber-600'
    if (avgScore >= 0.3) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const normalized = score / maxScore
    if (normalized >= 0.9) return '#10b981' // emerald-500
    if (normalized >= 0.7) return '#22c55e' // green-500
    if (normalized >= 0.5) return '#f59e0b' // amber-500
    if (normalized >= 0.3) return '#f97316' // orange-500
    return '#ef4444' // red-500
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid circles */}
        {showGrid && gridLevels.map((level, index) => (
          <circle
            key={index}
            cx={center}
            cy={center}
            r={radius * level}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground/20"
          />
        ))}

        {/* Axis lines */}
        {showGrid && axisLines.map((line, index) => (
          <path
            key={index}
            d={line}
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground/30"
          />
        ))}

        {/* Benchmark polygon */}
        <polygon
          points={benchmarkPoints}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted-foreground/20 fill-muted-foreground/10"
        />

        {/* Score polygon */}
        <polygon
          points={scorePoints}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="3"
          className="text-primary/30 fill-primary/20 stroke-primary"
        />

        {/* Score points */}
        {scores.map((score, index) => {
          const point = getPoint(index, score.score, score.maxScore)
          return (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={getScoreColor(score.score, score.maxScore)}
              stroke="white"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
          )
        })}

        {/* Labels */}
        {showLabels && scores.map((score, index) => {
          const labelPoint = getLabelPoint(index)
          const isLeft = labelPoint.x < center
          const isTop = labelPoint.y < center
          
          return (
            <g key={index}>
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor={isLeft ? 'end' : 'start'}
                dominantBaseline={isTop ? 'auto' : 'hanging'}
                className="text-xs font-medium fill-current"
                dx={isLeft ? -5 : 5}
                dy={isTop ? -5 : 5}
              >
                {score.label}
              </text>
              <text
                x={labelPoint.x}
                y={labelPoint.y + (isTop ? -15 : 15)}
                textAnchor={isLeft ? 'end' : 'start'}
                dominantBaseline={isTop ? 'auto' : 'hanging'}
                className="text-xs font-bold fill-current"
                dx={isLeft ? -5 : 5}
                dy={isTop ? -5 : 5}
                fill={getScoreColor(score.score, score.maxScore)}
              >
                {score.score}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary/20 border-2 border-primary rounded-sm"></div>
            <span>Your Score</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-muted-foreground/10 border-2 border-muted-foreground/20 rounded-sm"></div>
            <span>Industry Average</span>
          </div>
        </div>
        
        {/* Overall performance indicator */}
        <div className="text-sm">
          <span className="text-muted-foreground">Overall Performance: </span>
          <span className={cn("font-semibold", getOverallColor())}>
            {(() => {
              const avgScore = scores.reduce((sum, score) => sum + (score.score / score.maxScore), 0) / scores.length
              if (avgScore >= 0.9) return 'Excellent'
              if (avgScore >= 0.7) return 'Good'
              if (avgScore >= 0.5) return 'Fair'
              if (avgScore >= 0.3) return 'Poor'
              return 'Critical'
            })()}
          </span>
        </div>
      </div>
    </div>
  )
} 