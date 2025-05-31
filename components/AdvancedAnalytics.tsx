'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Lightbulb, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'

interface AdvancedAnalyticsProps {
  data: {
    scores: {
      overallScore: number
      contentScore?: number
      technicalScore?: number
      aiAnalysisScore?: number
    }
    recommendations?: any[]
    quickWins?: any[]
  }
}

export default function AdvancedAnalytics({ data }: AdvancedAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('insights')
  const [predictions, setPredictions] = useState({
    scoreImprovement: 0,
    timeToTarget: 0,
    impactForecast: [] as any[]
  })

  useEffect(() => {
    // Simulate AI-powered predictions
    const currentScore = data.scores.overallScore
    const targetScore = 90
    const improvement = Math.min(25, targetScore - currentScore)
    const timeEstimate = Math.ceil(improvement / 3) // weeks
    
    setPredictions({
      scoreImprovement: improvement,
      timeToTarget: timeEstimate,
      impactForecast: [
        { metric: 'Search Visibility', current: 65, predicted: 85, confidence: 92 },
        { metric: 'User Engagement', current: 72, predicted: 88, confidence: 87 },
        { metric: 'Content Quality', current: data.scores.contentScore || 75, predicted: 90, confidence: 95 },
        { metric: 'Technical Performance', current: data.scores.technicalScore || 70, predicted: 85, confidence: 89 }
      ]
    })
  }, [data])

  const InsightCard = ({ 
    title, 
    value, 
    change, 
    icon, 
    color = 'blue',
    description 
  }: {
    title: string
    value: string | number
    change?: number
    icon: React.ReactNode
    color?: string
    description: string
  }) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-full bg-${color}-100`}>
            {icon}
          </div>
          {change !== undefined && (
            <Badge 
              variant={change > 0 ? 'default' : change < 0 ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {change > 0 ? '+' : ''}{change}%
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <div className={`text-3xl font-bold text-${color}-600`}>{value}</div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )

  const PredictionChart = ({ forecast }: { forecast: any[] }) => (
    <div className="space-y-4">
      {forecast.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{item.metric}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{item.current}%</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">{item.predicted}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <Progress value={item.predicted} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Current: {item.current}%</span>
              <span>Confidence: {item.confidence}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const AIInsight = ({ 
    type, 
    title, 
    description, 
    action, 
    priority 
  }: {
    type: 'opportunity' | 'warning' | 'success'
    title: string
    description: string
    action: string
    priority: 'high' | 'medium' | 'low'
  }) => {
    const getIcon = () => {
      switch (type) {
        case 'opportunity': return <Lightbulb className="w-5 h-5 text-yellow-600" />
        case 'warning': return <AlertTriangle className="w-5 h-5 text-red-600" />
        case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />
      }
    }

    const getBgColor = () => {
      switch (type) {
        case 'opportunity': return 'bg-yellow-50 border-yellow-200'
        case 'warning': return 'bg-red-50 border-red-200'
        case 'success': return 'bg-green-50 border-green-200'
      }
    }

    return (
      <Card className={`${getBgColor()} border`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {getIcon()}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{title}</h4>
                <Badge 
                  variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {priority} priority
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
              <Button variant="outline" size="sm" className="mt-2">
                {action}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const aiInsights = [
    {
      type: 'opportunity' as const,
      title: 'Content Gap Detected',
      description: 'Your content lacks depth in key topic areas. Adding 500+ words on core subjects could boost rankings.',
      action: 'Expand Content',
      priority: 'high' as const
    },
    {
      type: 'warning' as const,
      title: 'Mobile Performance Issue',
      description: 'Page load time on mobile devices is 23% slower than optimal. This affects user experience and rankings.',
      action: 'Optimize Mobile',
      priority: 'high' as const
    },
    {
      type: 'success' as const,
      title: 'Schema Markup Excellent',
      description: 'Your structured data implementation is comprehensive and well-optimized for AI search engines.',
      action: 'Maintain Quality',
      priority: 'low' as const
    },
    {
      type: 'opportunity' as const,
      title: 'Semantic Enhancement Opportunity',
      description: 'Adding related keywords and entities could improve topical authority by an estimated 15%.',
      action: 'Enhance Semantics',
      priority: 'medium' as const
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🧠 Advanced AI Analytics</h2>
        <p className="text-muted-foreground">
          Deep insights and predictive analytics powered by machine learning
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InsightCard
              title="AI Readiness Score"
              value={`${Math.round(data.scores.aiAnalysisScore || 78)}%`}
              change={12}
              icon={<Brain className="w-6 h-6 text-purple-600" />}
              color="purple"
              description="How well optimized for AI search engines"
            />
            <InsightCard
              title="Improvement Potential"
              value={`+${predictions.scoreImprovement}`}
              icon={<Target className="w-6 h-6 text-blue-600" />}
              color="blue"
              description="Points you could gain with optimizations"
            />
            <InsightCard
              title="Time to Target"
              value={`${predictions.timeToTarget} weeks`}
              icon={<Clock className="w-6 h-6 text-green-600" />}
              color="green"
              description="Estimated time to reach 90% score"
            />
            <InsightCard
              title="Quick Wins Available"
              value={data.quickWins?.length || 0}
              icon={<Zap className="w-6 h-6 text-yellow-600" />}
              color="yellow"
              description="Low-effort, high-impact improvements"
            />
          </div>

          {/* AI-Generated Insights */}
          <Card>
            <CardHeader>
              <CardTitle>🤖 AI-Generated Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {aiInsights.map((insight, index) => (
                  <AIInsight key={index} {...insight} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📈 Performance Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <PredictionChart forecast={predictions.impactForecast} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Goal Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Target Score: 90%</span>
                  <span className="text-sm text-muted-foreground">
                    Current: {data.scores.overallScore}%
                  </span>
                </div>
                <Progress value={(data.scores.overallScore / 90) * 100} className="h-3" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(((90 - data.scores.overallScore) / 90) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Remaining</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {predictions.timeToTarget}
                    </div>
                    <div className="text-xs text-muted-foreground">Weeks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(predictions.scoreImprovement / predictions.timeToTarget * 10) / 10}
                    </div>
                    <div className="text-xs text-muted-foreground">Points/Week</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>⚡ Optimization Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { phase: 'Phase 1', title: 'Quick Wins', duration: '1-2 weeks', impact: 'High', status: 'ready' },
                  { phase: 'Phase 2', title: 'Content Enhancement', duration: '3-4 weeks', impact: 'High', status: 'planned' },
                  { phase: 'Phase 3', title: 'Technical Optimization', duration: '2-3 weeks', impact: 'Medium', status: 'planned' },
                  { phase: 'Phase 4', title: 'Advanced Features', duration: '4-6 weeks', impact: 'Medium', status: 'future' }
                ].map((phase, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        phase.status === 'ready' ? 'bg-green-500' :
                        phase.status === 'planned' ? 'bg-yellow-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <h4 className="font-medium">{phase.phase}: {phase.title}</h4>
                        <p className="text-sm text-muted-foreground">{phase.duration}</p>
                      </div>
                    </div>
                    <Badge variant={phase.impact === 'High' ? 'default' : 'secondary'}>
                      {phase.impact} Impact
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🏆 Competitive Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-6 border rounded-lg bg-muted/50">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Competitive Intelligence</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced competitive analysis features coming soon. This will include:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>• Competitor score comparison</div>
                    <div>• Market positioning analysis</div>
                    <div>• Content gap identification</div>
                    <div>• Keyword opportunity mapping</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 