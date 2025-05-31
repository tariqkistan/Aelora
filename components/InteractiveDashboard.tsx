'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface InteractiveDashboardProps {
  data: {
    scores: {
      overallScore: number
      contentScore?: number
      technicalScore?: number
      aiAnalysisScore?: number
    }
    performance?: {
      fetchTimeMs: number
      analysisTimeMs: number
      totalTimeMs: number
    }
    trends?: {
      weekly: number[]
      monthly: number[]
    }
    breakdown?: {
      categories: string[]
      values: number[]
      colors: string[]
    }
  }
}

export default function InteractiveDashboard({ data }: InteractiveDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationProgress(prev => prev < 100 ? prev + 2 : 100)
    }, 50)
    return () => clearInterval(timer)
  }, [])

  const RadialChart = ({ value, label, color = '#3b82f6', size = 120 }: {
    value: number
    label: string
    color?: string
    size?: number
  }) => {
    const radius = (size - 20) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (value / 100) * circumference * (animationProgress / 100)

    return (
      <div 
        className="relative flex flex-col items-center p-4 rounded-lg transition-all duration-300 hover:bg-muted/50 cursor-pointer"
        onMouseEnter={() => setHoveredElement(label)}
        onMouseLeave={() => setHoveredElement(null)}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{value}</span>
          <span className="text-xs text-muted-foreground">Score</span>
        </div>
        <div className="mt-2 text-center">
          <p className="font-medium text-sm">{label}</p>
          {hoveredElement === label && (
            <div className="absolute z-10 mt-2 p-2 bg-popover border rounded shadow-lg text-xs">
              <p>Current score: {value}/100</p>
              <p>Performance: {value >= 80 ? 'Excellent' : value >= 60 ? 'Good' : 'Needs Improvement'}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const BarChart = ({ data, labels, colors }: {
    data: number[]
    labels: string[]
    colors: string[]
  }) => {
    const maxValue = Math.max(...data)
    
    return (
      <div className="space-y-4">
        {data.map((value, index) => (
          <div 
            key={index}
            className="flex items-center space-x-4 p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer"
            onMouseEnter={() => setHoveredElement(`bar-${index}`)}
            onMouseLeave={() => setHoveredElement(null)}
          >
            <div className="w-20 text-sm font-medium">{labels[index]}</div>
            <div className="flex-1 relative">
              <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${(value / maxValue) * 100 * (animationProgress / 100)}%`,
                    backgroundColor: colors[index]
                  }}
                />
              </div>
              {hoveredElement === `bar-${index}` && (
                <div className="absolute right-0 top-8 z-10 p-2 bg-popover border rounded shadow-lg text-xs">
                  <p>{labels[index]}: {value}%</p>
                  <p>Relative performance: {((value / maxValue) * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>
            <div className="w-12 text-sm text-right">{value}%</div>
          </div>
        ))}
      </div>
    )
  }

  const LineChart = ({ data, label }: { data: number[], label: string }) => {
    const maxValue = Math.max(...data)
    const minValue = Math.min(...data)
    const range = maxValue - minValue
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 300
      const y = 100 - ((value - minValue) / range) * 80
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="p-4">
        <h4 className="text-sm font-medium mb-4">{label}</h4>
        <svg width="300" height="120" className="border rounded">
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={points}
            className="transition-all duration-1000"
            style={{
              strokeDasharray: animationProgress < 100 ? '5,5' : 'none'
            }}
          />
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * 300
            const y = 100 - ((value - minValue) / range) * 80
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
                className="transition-all duration-300 hover:r-6 cursor-pointer"
                onMouseEnter={() => setHoveredElement(`point-${index}`)}
                onMouseLeave={() => setHoveredElement(null)}
              />
            )
          })}
        </svg>
        {hoveredElement?.startsWith('point-') && (
          <div className="mt-2 p-2 bg-muted rounded text-xs">
            Point {parseInt(hoveredElement.split('-')[1]) + 1}: {data[parseInt(hoveredElement.split('-')[1])]}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Score Breakdown
                <Badge variant="secondary">Interactive</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <RadialChart 
                  value={data.scores.overallScore} 
                  label="Overall Score"
                  color="#10b981"
                />
                {data.scores.contentScore && (
                  <RadialChart 
                    value={data.scores.contentScore} 
                    label="Content Quality"
                    color="#3b82f6"
                  />
                )}
                {data.scores.technicalScore && (
                  <RadialChart 
                    value={data.scores.technicalScore} 
                    label="Technical SEO"
                    color="#f59e0b"
                  />
                )}
                {data.scores.aiAnalysisScore && (
                  <RadialChart 
                    value={data.scores.aiAnalysisScore} 
                    label="AI Analysis"
                    color="#8b5cf6"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {data.breakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={data.breakdown.values}
                  labels={data.breakdown.categories}
                  colors={data.breakdown.colors}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {data.performance && (
            <Card>
              <CardHeader>
                <CardTitle>⚡ Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {(data.performance.fetchTimeMs / 1000).toFixed(2)}s
                    </div>
                    <div className="text-sm text-muted-foreground">Fetch Time</div>
                    <Progress 
                      value={(data.performance.fetchTimeMs / data.performance.totalTimeMs) * 100} 
                      className="mt-2"
                    />
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {(data.performance.analysisTimeMs / 1000).toFixed(2)}s
                    </div>
                    <div className="text-sm text-muted-foreground">Analysis Time</div>
                    <Progress 
                      value={(data.performance.analysisTimeMs / data.performance.totalTimeMs) * 100} 
                      className="mt-2"
                    />
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {(data.performance.totalTimeMs / 1000).toFixed(2)}s
                    </div>
                    <div className="text-sm text-muted-foreground">Total Time</div>
                    <Progress value={100} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {data.trends && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>📈 Weekly Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart data={data.trends.weekly} label="Last 7 Days" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>📅 Monthly Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart data={data.trends.monthly} label="Last 30 Days" />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 