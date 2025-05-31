'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown } from 'lucide-react'

interface ComparisonData {
  current: {
    overallScore: number
    contentScore: number
    technicalScore: number
    date: string
  }
  previous?: {
    overallScore: number
    contentScore: number
    technicalScore: number
    date: string
  }
  improvements?: {
    category: string
    change: number
    description: string
    impact: 'high' | 'medium' | 'low'
  }[]
}

interface ComparisonViewProps {
  data: ComparisonData
}

export default function ComparisonView({ data }: ComparisonViewProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-600" />
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getChangeBadge = (change: number) => {
    if (change > 0) return <Badge className="bg-green-100 text-green-800">Improved</Badge>
    if (change < 0) return <Badge className="bg-red-100 text-red-800">Declined</Badge>
    return <Badge className="bg-gray-100 text-gray-800">No Change</Badge>
  }

  const ScoreComparison = ({ 
    title, 
    current, 
    previous, 
    icon 
  }: { 
    title: string
    current: number
    previous?: number
    icon: React.ReactNode
  }) => {
    const change = previous ? current - previous : 0
    const changePercent = previous ? ((change / previous) * 100) : 0

    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Score */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">{current}</div>
              <div className="text-sm text-muted-foreground">Current Score</div>
            </div>

            {/* Comparison */}
            {previous && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Previous: {previous}</span>
                  <div className={`flex items-center gap-1 font-medium ${getChangeColor(change)}`}>
                    {getChangeIcon(change)}
                    {Math.abs(change)} pts
                  </div>
                </div>
                
                {changePercent !== 0 && (
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${getChangeColor(change)}`}>
                      {change > 0 ? '+' : ''}{changePercent.toFixed(1)}% change
                    </div>
                  </div>
                )}

                <div className="mt-3 flex justify-center">
                  {getChangeBadge(change)}
                </div>
              </div>
            )}

            {!previous && (
              <div className="text-center text-sm text-muted-foreground border-t pt-4">
                No previous data available
              </div>
            )}
          </div>
        </CardContent>

        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div 
            className="h-full bg-primary transition-all duration-1000"
            style={{ width: `${current}%` }}
          />
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📊 Performance Comparison</h2>
          <p className="text-muted-foreground">
            Compare your current analysis with previous results
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
      </div>

      {/* Score Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreComparison
          title="Overall Score"
          current={data.current.overallScore}
          previous={data.previous?.overallScore}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <ScoreComparison
          title="Content Quality"
          current={data.current.contentScore}
          previous={data.previous?.contentScore}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <ScoreComparison
          title="Technical SEO"
          current={data.current.technicalScore}
          previous={data.previous?.technicalScore}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Timeline */}
      {data.previous && (
        <Card>
          <CardHeader>
            <CardTitle>📅 Analysis Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Previous Analysis</div>
                    <div className="text-sm text-muted-foreground">{data.previous.date}</div>
                    <div className="text-sm">Overall Score: {data.previous.overallScore}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Current Analysis</div>
                    <div className="text-sm text-muted-foreground">{data.current.date}</div>
                    <div className="text-sm">Overall Score: {data.current.overallScore}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Improvements */}
      {showDetails && data.improvements && data.improvements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🎯 Detailed Improvements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.improvements.map((improvement, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {improvement.change > 0 ? (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <ArrowDown className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{improvement.category}</h4>
                      <Badge 
                        variant={improvement.impact === 'high' ? 'destructive' : 
                                improvement.impact === 'medium' ? 'default' : 'secondary'}
                      >
                        {improvement.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {improvement.description}
                    </p>
                    <div className={`text-sm font-medium ${getChangeColor(improvement.change)}`}>
                      {improvement.change > 0 ? '+' : ''}{improvement.change} point change
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Previous Data Message */}
      {!data.previous && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Previous Analysis Found</h3>
            <p className="text-muted-foreground mb-4">
              Run another analysis in the future to see comparison data and track your improvements.
            </p>
            <Button asChild>
              <a href="/analyzer">Run New Analysis</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 