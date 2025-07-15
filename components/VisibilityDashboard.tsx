"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import SentimentChart from '@/components/SentimentChart'
import MentionsList from '@/components/MentionsList'
import { Badge } from '@/components/ui/badge'

interface VisibilityData {
  brand: string
  sentimentHistory: Array<{
    date: string
    sentimentScore: number
    mentions: number
    timestamp: string
  }>
  mentions: Array<{
    keyword: string
    tone: 'positive' | 'neutral' | 'negative'
    frequency: number
  }>
  summary: string
  lastUpdated: string
  totalMentions: number
  averageSentiment: number
}

export default function VisibilityDashboard() {
  const searchParams = useSearchParams()
  const initialBrand = searchParams.get('brand') || 'Apple'
  
  const [selectedBrand, setSelectedBrand] = useState(initialBrand)
  const [data, setData] = useState<VisibilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const popularBrands = [
    'Apple', 'Microsoft', 'Google', 'Amazon', 'Tesla', 
    'Netflix', 'Meta', 'OpenAI', 'Spotify', 'Adobe'
  ]

  const fetchData = async (brand: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/visibility?brand=${encodeURIComponent(brand)}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch visibility data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(selectedBrand)
  }, [selectedBrand])

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand)
    // Update URL without page reload
    const url = new URL(window.location.href)
    url.searchParams.set('brand', brand)
    window.history.pushState({}, '', url.toString())
  }

  const handleRefresh = () => {
    fetchData(selectedBrand)
  }

  const getSentimentTrend = () => {
    if (!data || data.sentimentHistory.length < 2) return null
    
    const recent = data.sentimentHistory.slice(-7) // Last 7 days
    const older = data.sentimentHistory.slice(-14, -7) // Previous 7 days
    
    const recentAvg = recent.reduce((sum, item) => sum + item.sentimentScore, 0) / recent.length
    const olderAvg = older.reduce((sum, item) => sum + item.sentimentScore, 0) / older.length
    
    const change = recentAvg - olderAvg
    
    if (Math.abs(change) < 0.05) return { type: 'stable', change: 0 }
    return { type: change > 0 ? 'positive' : 'negative', change }
  }

  const sentimentTrend = getSentimentTrend()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-48 bg-muted animate-pulse rounded" />
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-destructive">Error Loading Dashboard</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Brand Selection and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Select Brand</label>
            <Select value={selectedBrand} onValueChange={handleBrandChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {popularBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {(data.averageSentiment * 100).toFixed(1)}%
              </div>
              {sentimentTrend && (
                <div className="flex items-center">
                  {sentimentTrend.type === 'positive' && (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                  {sentimentTrend.type === 'negative' && (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  {sentimentTrend.type === 'stable' && (
                    <Minus className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {sentimentTrend?.type === 'positive' && 'Trending up'}
              {sentimentTrend?.type === 'negative' && 'Trending down'}
              {sentimentTrend?.type === 'stable' && 'Stable trend'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalMentions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all keywords
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Brand Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              variant={data.averageSentiment > 0.6 ? 'default' : data.averageSentiment > 0.3 ? 'secondary' : 'destructive'}
              className="text-sm"
            >
              {data.averageSentiment > 0.6 ? 'Strong' : data.averageSentiment > 0.3 ? 'Moderate' : 'Weak'} Visibility
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              AI platform presence
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Over Time</CardTitle>
          <CardDescription>
            Track how sentiment for {selectedBrand} has changed over the past 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SentimentChart data={data.sentimentHistory} />
        </CardContent>
      </Card>

      {/* Summary and Mentions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Summary</CardTitle>
            <CardDescription>
              Latest insights from AI-powered brand analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{data.summary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Mentions</CardTitle>
            <CardDescription>
              Most frequent keywords associated with {selectedBrand}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MentionsList mentions={data.mentions} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 