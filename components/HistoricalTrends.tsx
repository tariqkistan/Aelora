"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface HistoricalDataPoint {
  date: string
  overallScore: number
  readability: number
  schema: number
  questionAnswerMatch: number
  headingsStructure: number
  url: string
  improvements?: string[]
}

interface TrendAnalysis {
  direction: 'up' | 'down' | 'stable'
  change: number
  period: string
  bestImprovement: string
  consistencyScore: number
}

interface HistoricalTrendsProps {
  data: HistoricalDataPoint[]
  currentScore: number
  className?: string
}

export default function HistoricalTrends({ data, currentScore, className }: HistoricalTrendsProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('overallScore')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // Filter data based on time range
  const getFilteredData = () => {
    if (timeRange === 'all') return data
    
    const now = new Date()
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
    
    return data.filter(point => new Date(point.date) >= cutoffDate)
  }

  const filteredData = getFilteredData()

  // Calculate trend analysis
  const getTrendAnalysis = (): TrendAnalysis => {
    if (filteredData.length < 2) {
      return {
        direction: 'stable',
        change: 0,
        period: timeRange,
        bestImprovement: 'No data available',
        consistencyScore: 0
      }
    }

    const firstScore = filteredData[0].overallScore
    const lastScore = filteredData[filteredData.length - 1].overallScore
    const change = lastScore - firstScore

    // Find best improvement between consecutive points
    let bestImprovement = 'No significant improvements'
    let maxImprovement = 0

    for (let i = 1; i < filteredData.length; i++) {
      const improvement = filteredData[i].overallScore - filteredData[i - 1].overallScore
      if (improvement > maxImprovement) {
        maxImprovement = improvement
        bestImprovement = `+${improvement.toFixed(1)} points on ${new Date(filteredData[i].date).toLocaleDateString()}`
      }
    }

    // Calculate consistency (lower variance = higher consistency)
    const scores = filteredData.map(d => d.overallScore)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length
    const consistencyScore = Math.max(0, 100 - variance)

    return {
      direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
      change,
      period: timeRange,
      bestImprovement,
      consistencyScore
    }
  }

  const trendAnalysis = getTrendAnalysis()

  // Generate SVG path for the trend line
  const generateTrendPath = (metric: string) => {
    if (filteredData.length < 2) return ''

    const width = 300
    const height = 150
    const padding = 20

    const values = filteredData.map(d => d[metric as keyof HistoricalDataPoint] as number)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const range = maxValue - minValue || 1

    const points = filteredData.map((point, index) => {
      const x = padding + (index / (filteredData.length - 1)) * (width - 2 * padding)
      const value = point[metric as keyof HistoricalDataPoint] as number
      const y = height - padding - ((value - minValue) / range) * (height - 2 * padding)
      return `${x},${y}`
    })

    return `M ${points.join(' L ')}`
  }

  const metrics = [
    { key: 'overallScore', label: 'Overall Score', color: 'text-blue-600' },
    { key: 'readability', label: 'Readability', color: 'text-green-600' },
    { key: 'schema', label: 'Schema', color: 'text-purple-600' },
    { key: 'questionAnswerMatch', label: 'Q&A Match', color: 'text-orange-600' },
    { key: 'headingsStructure', label: 'Headings', color: 'text-red-600' }
  ]

  const timeRanges = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: 'all', label: 'All Time' }
  ]

  return (
    <div className={cn("space-y-6", className)}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          {timeRanges.map(range => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key as any)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                timeRange === range.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {metrics.map(metric => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                selectedMetric === metric.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trend Analysis Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "text-2xl",
              trendAnalysis.direction === 'up' ? "text-green-600" :
              trendAnalysis.direction === 'down' ? "text-red-600" : "text-gray-600"
            )}>
              {trendAnalysis.direction === 'up' ? '📈' :
               trendAnalysis.direction === 'down' ? '📉' : '➡️'}
            </div>
            <div>
              <h3 className="font-semibold">Trend Direction</h3>
              <p className="text-sm text-muted-foreground">
                {trendAnalysis.direction === 'up' ? 'Improving' :
                 trendAnalysis.direction === 'down' ? 'Declining' : 'Stable'}
              </p>
            </div>
          </div>
          <div className="text-lg font-bold">
            {trendAnalysis.change > 0 ? '+' : ''}{trendAnalysis.change.toFixed(1)} points
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-2xl">🎯</div>
            <div>
              <h3 className="font-semibold">Consistency</h3>
              <p className="text-sm text-muted-foreground">Score stability</p>
            </div>
          </div>
          <div className="text-lg font-bold">
            {trendAnalysis.consistencyScore.toFixed(0)}%
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-2xl">🚀</div>
            <div>
              <h3 className="font-semibold">Best Improvement</h3>
              <p className="text-sm text-muted-foreground">Biggest single gain</p>
            </div>
          </div>
          <div className="text-sm font-medium">
            {trendAnalysis.bestImprovement}
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          {metrics.find(m => m.key === selectedMetric)?.label} Trend
        </h3>
        
        {filteredData.length >= 2 ? (
          <div className="relative">
            <svg width="100%" height="200" viewBox="0 0 300 150" className="overflow-visible">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="30" height="15" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 15" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/20"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Trend line */}
              <path
                d={generateTrendPath(selectedMetric)}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className={metrics.find(m => m.key === selectedMetric)?.color || 'text-blue-600'}
              />

              {/* Data points */}
              {filteredData.map((point, index) => {
                const width = 300
                const height = 150
                const padding = 20
                const values = filteredData.map(d => d[selectedMetric as keyof HistoricalDataPoint] as number)
                const minValue = Math.min(...values)
                const maxValue = Math.max(...values)
                const range = maxValue - minValue || 1

                const x = padding + (index / (filteredData.length - 1)) * (width - 2 * padding)
                const value = point[selectedMetric as keyof HistoricalDataPoint] as number
                const y = height - padding - ((value - minValue) / range) * (height - 2 * padding)

                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="currentColor"
                    className={metrics.find(m => m.key === selectedMetric)?.color || 'text-blue-600'}
                  >
                    <title>{`${new Date(point.date).toLocaleDateString()}: ${value}`}</title>
                  </circle>
                )
              })}
            </svg>

            {/* Legend */}
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{new Date(filteredData[0]?.date).toLocaleDateString()}</span>
              <span>{new Date(filteredData[filteredData.length - 1]?.date).toLocaleDateString()}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📊</div>
            <p>Not enough data to show trends</p>
            <p className="text-sm">Analyze more URLs to see your progress over time</p>
          </div>
        )}
      </div>

      {/* Recent Analyses */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Analyses</h3>
        
        {filteredData.length > 0 ? (
          <div className="space-y-3">
            {filteredData.slice(-5).reverse().map((analysis, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{analysis.url}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(analysis.date).toLocaleDateString()} • 
                    {analysis.improvements && analysis.improvements.length > 0 && (
                      <span className="ml-1">{analysis.improvements.length} improvements made</span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="font-bold text-lg">{analysis.overallScore}</div>
                  {index < filteredData.length - 1 && (
                    <div className={cn(
                      "text-sm font-medium",
                      analysis.overallScore > filteredData[filteredData.length - 2 - index].overallScore
                        ? "text-green-600" : "text-red-600"
                    )}>
                      {analysis.overallScore > filteredData[filteredData.length - 2 - index].overallScore ? '↗' : '↘'}
                      {Math.abs(analysis.overallScore - filteredData[filteredData.length - 2 - index].overallScore).toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>No analyses in the selected time range</p>
          </div>
        )}
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200">
          📊 Trend Insights
        </h3>
        
        <div className="space-y-3 text-sm">
          {trendAnalysis.direction === 'up' && (
            <div className="flex items-start gap-2">
              <div className="text-green-600">✅</div>
              <p>Great progress! Your scores are trending upward. Keep implementing the recommended improvements to maintain this momentum.</p>
            </div>
          )}
          
          {trendAnalysis.direction === 'down' && (
            <div className="flex items-start gap-2">
              <div className="text-red-600">⚠️</div>
              <p>Your scores have declined recently. Review your recent changes and focus on the high-impact recommendations to get back on track.</p>
            </div>
          )}
          
          {trendAnalysis.direction === 'stable' && (
            <div className="flex items-start gap-2">
              <div className="text-blue-600">ℹ️</div>
              <p>Your scores are stable. Consider implementing more advanced optimizations to break through to the next level.</p>
            </div>
          )}
          
          {trendAnalysis.consistencyScore < 70 && (
            <div className="flex items-start gap-2">
              <div className="text-orange-600">📈</div>
              <p>Your scores show some volatility. Focus on consistent, sustainable improvements rather than quick fixes.</p>
            </div>
          )}
          
          {filteredData.length >= 5 && (
            <div className="flex items-start gap-2">
              <div className="text-purple-600">🎯</div>
              <p>You're building a solid optimization history! Regular monitoring helps identify what works best for your content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 