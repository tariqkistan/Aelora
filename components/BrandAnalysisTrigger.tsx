"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Play, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface BrandAnalysisResult {
  success: boolean
  data?: {
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
  error?: string
}

export default function BrandAnalysisTrigger() {
  const [brandName, setBrandName] = useState('')
  const [domain, setDomain] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BrandAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Entertainment',
    'Automotive', 'Food & Beverage', 'Education', 'Real Estate', 'Travel'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!brandName.trim()) {
      setError('Brand name is required')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('Triggering Lambda analysis for:', { brandName, domain, industry })
      
      const response = await fetch('/api/visibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandName: brandName.trim(),
          domain: domain.trim() || undefined,
          industry: industry || 'Technology'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
        console.log('Lambda analysis completed:', data)
      } else {
        throw new Error(data.error || 'Failed to analyze brand')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Brand analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setBrandName('')
    setDomain('')
    setIndustry('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Lambda Brand Analysis Trigger
          </CardTitle>
          <CardDescription>
            Test the integration between Next.js frontend and AWS Lambda via API Gateway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name *</Label>
                <Input
                  id="brandName"
                  type="text"
                  placeholder="e.g., Apple, Microsoft, Tesla"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="domain">Domain (Optional)</Label>
                <Input
                  id="domain"
                  type="text"
                  placeholder="e.g., apple.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Trigger Lambda Analysis
                  </>
                )}
              </Button>
              
              <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Success Result Display */}
      {result && result.success && result.data && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Analysis Complete
            </CardTitle>
            <CardDescription>
              Lambda function executed successfully for {result.data.brand}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {(result.data.averageSentiment * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Sentiment</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{result.data.totalMentions}</div>
                <div className="text-sm text-muted-foreground">Total Mentions</div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{result.data.sentimentHistory.length}</div>
                <div className="text-sm text-muted-foreground">Data Points</div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <h4 className="font-medium mb-2">AI Analysis Summary</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.data.summary}
              </p>
            </div>

            {/* Mentions */}
            <div>
              <h4 className="font-medium mb-2">Key Mentions</h4>
              <div className="flex flex-wrap gap-2">
                {result.data.mentions.map((mention, index) => {
                  const variant = mention.tone === 'positive' ? 'default' : 
                                mention.tone === 'negative' ? 'destructive' : 'secondary'
                  return (
                    <Badge key={index} variant={variant} className="text-xs">
                      {mention.keyword} ({mention.frequency})
                    </Badge>
                  )
                })}
              </div>
            </div>

            {/* Metadata */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p>Last updated: {new Date(result.data.lastUpdated).toLocaleString()}</p>
              <p>Sentiment history: {result.data.sentimentHistory.length} days</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed Result Display */}
      {result && !result.success && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Lambda Analysis Failed</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {result.error || 'Unknown error occurred'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 