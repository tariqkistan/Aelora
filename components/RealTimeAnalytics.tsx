'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Users, Eye, Clock, Zap } from 'lucide-react'

interface RealTimeAnalyticsProps {
  url: string
  initialScore: number
}

export default function RealTimeAnalytics({ url, initialScore }: RealTimeAnalyticsProps) {
  const [isLive, setIsLive] = useState(false)
  const [metrics, setMetrics] = useState({
    currentScore: initialScore,
    visitors: 0,
    pageViews: 0,
    avgTimeOnPage: 0,
    bounceRate: 0,
    lastUpdated: new Date()
  })

  const [recentActivity, setRecentActivity] = useState<{
    timestamp: Date
    action: string
    impact: 'positive' | 'negative' | 'neutral'
  }[]>([])

  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      // Simulate real-time updates
      setMetrics(prev => ({
        currentScore: Math.max(0, Math.min(100, prev.currentScore + (Math.random() - 0.5) * 2)),
        visitors: prev.visitors + Math.floor(Math.random() * 3),
        pageViews: prev.pageViews + Math.floor(Math.random() * 5),
        avgTimeOnPage: Math.max(0, prev.avgTimeOnPage + (Math.random() - 0.5) * 10),
        bounceRate: Math.max(0, Math.min(100, prev.bounceRate + (Math.random() - 0.5) * 5)),
        lastUpdated: new Date()
      }))

      // Add random activity
      if (Math.random() > 0.7) {
        const activities = [
          { action: 'New visitor from search engine', impact: 'positive' as const },
          { action: 'Page load time improved', impact: 'positive' as const },
          { action: 'User spent 3+ minutes reading', impact: 'positive' as const },
          { action: 'High bounce rate detected', impact: 'negative' as const },
          { action: 'Mobile user engagement up', impact: 'positive' as const },
          { action: 'Schema markup validated', impact: 'neutral' as const }
        ]
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)]
        setRecentActivity(prev => [
          { ...randomActivity, timestamp: new Date() },
          ...prev.slice(0, 4)
        ])
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isLive])

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    icon, 
    trend, 
    color = 'text-primary' 
  }: {
    title: string
    value: number
    unit: string
    icon: React.ReactNode
    trend?: 'up' | 'down' | 'stable'
    color?: string
  }) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold ${color}`}>
                {typeof value === 'number' ? value.toFixed(1) : value}
              </p>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
          </div>
          <div className={`p-3 rounded-full bg-muted/50 ${color}`}>
            {icon}
          </div>
        </div>
        
        {trend && (
          <div className="mt-2">
            <Badge 
              variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {trend === 'up' ? '↗️ Trending up' : trend === 'down' ? '↘️ Trending down' : '➡️ Stable'}
            </Badge>
          </div>
        )}
      </CardContent>
      
      {isLive && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">LIVE</span>
          </div>
        </div>
      )}
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📡 Real-Time Analytics</h2>
          <p className="text-muted-foreground">
            Live performance metrics for {new URL(url).hostname}
          </p>
        </div>
        <Button 
          onClick={() => setIsLive(!isLive)}
          variant={isLive ? 'destructive' : 'default'}
          className="flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          {isLive ? 'Stop Live Updates' : 'Start Live Updates'}
        </Button>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Score"
          value={metrics.currentScore}
          unit="/100"
          icon={<Zap className="w-5 h-5" />}
          trend={metrics.currentScore > initialScore ? 'up' : metrics.currentScore < initialScore ? 'down' : 'stable'}
          color="text-primary"
        />
        
        <MetricCard
          title="Active Visitors"
          value={metrics.visitors}
          unit="users"
          icon={<Users className="w-5 h-5" />}
          trend="up"
          color="text-green-600"
        />
        
        <MetricCard
          title="Page Views"
          value={metrics.pageViews}
          unit="views"
          icon={<Eye className="w-5 h-5" />}
          trend="up"
          color="text-blue-600"
        />
        
        <MetricCard
          title="Avg. Time on Page"
          value={metrics.avgTimeOnPage}
          unit="sec"
          icon={<Clock className="w-5 h-5" />}
          trend="stable"
          color="text-purple-600"
        />
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Recent Activity
            {isLive && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Live Updates
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    activity.impact === 'positive' ? 'bg-green-500' :
                    activity.impact === 'negative' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      activity.impact === 'positive' ? 'default' :
                      activity.impact === 'negative' ? 'destructive' :
                      'secondary'
                    }
                    className="text-xs"
                  >
                    {activity.impact}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-xs">Start live updates to see real-time data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="font-medium">
                Status: {isLive ? 'Live Monitoring Active' : 'Monitoring Paused'}
              </span>
            </div>
            <div className="text-muted-foreground">
              Last updated: {metrics.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 