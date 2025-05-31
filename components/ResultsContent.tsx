"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ScoreCard from "@/components/ScoreCard"
import ReportCard from "@/components/ReportCard"
import PriorityBadge from "@/components/PriorityBadge"
import MiniChart from "@/components/MiniChart"
import Loader from "@/components/Loader"
import { analyzeUrl } from "@/lib/apiClient"

interface AnalysisResult {
  url: string
  timestamp: string
  scores: {
    readability: number
    schema: number
    questionAnswerMatch: number
    headingsStructure: number
    overallScore: number
    contentDepth?: number
    keywordOptimization?: number
    aiAnalysisScore?: number
  }
  recommendations: string[]
  aiRecommendations?: {
    title: string
    description: string
    rationale: string
    example: string
    expected_impact: string
    priority?: 'high' | 'medium' | 'low'
  }[]
  quickWins?: {
    action: string
    impact: string
    effort: 'low' | 'medium' | 'high'
  }[]
  details?: {
    wordCount: number
    hasSchema: boolean
    headingCount: number
    imageCount: number
    imageAltTextRate: number
    readabilityMetrics: {
      sentenceLength: number
      wordLength: number
      fleschKincaidGrade?: number
      smogIndex?: number
      colemanLiauIndex?: number
    }
    headingAnalysis?: {
      hasProperHierarchy: boolean
      nestedStructureScore: number
      keywordInHeadings: number
    }
    schemaDetails?: {
      types: string[]
      isValid: boolean
      completeness: number
    }
    paragraphCount: number
    listsAndTables: number
    faqCount: number
    contentToCodeRatio: number
    keywordsFound: string[]
    aiAnalysis?: {
      content_clarity?: {
        score: number
        observations: string[]
        recommendations: string[]
      }
      semantic_relevance?: {
        score: number
        observations: string[]
        recommendations: string[]
      }
      entity_recognition?: {
        score: number
        observations: string[]
        recommendations: string[]
      }
      information_completeness?: {
        score: number
        observations: string[]
        recommendations: string[]
      }
      factual_accuracy?: {
        score: number
        observations: string[]
        recommendations: string[]
      }
    }
    contentType?: string
    industry?: string
  }
  performance?: {
    fetchTimeMs: number
    analysisTimeMs: number
    totalTimeMs: number
  }
}

export default function ResultsContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get("url")
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Export functionality
  const exportResults = () => {
    if (!results) return
    
    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `aelora-analysis-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (!url) {
      setError("No URL provided")
      setLoading(false)
      return
    }

    // Fetch results from API
    const fetchResults = async () => {
      try {
        setLoading(true)
        
        console.log("Fetching data from AWS API...")
        try {
          const result = await analyzeUrl(url)
          console.log("API returned:", result)
          setResults(result)
          setLoading(false)
        } catch (apiError) {
          console.error("API call failed:", apiError)
          setError("Failed to analyze URL. Please try again later.")
          setLoading(false)
        }
      } catch (err) {
        console.error("Error fetching results:", err)
        setError("Error analyzing the URL. Please try again.")
        setLoading(false)
      }
    }

    fetchResults()
  }, [url])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Analysis Failed</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/analyzer">Try Again</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Results Found</h1>
          <Button asChild>
            <Link href="/analyzer">Start New Analysis</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Mock data for demonstration - in real app this would come from results
  const performanceData = [65, 72, 68, 85, 78, 82, 90]
  const scoreHistory = [results.scores.overallScore - 15, results.scores.overallScore - 8, results.scores.overallScore]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Analysis Results
          </h1>
          <p className="text-muted-foreground mt-2">
            URL: <span className="font-medium">{results.url}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Button onClick={exportResults} variant="outline">
              📊 Export Results
            </Button>
            <Button asChild>
              <Link href="/analyzer">
                🔍 Analyze Another URL
              </Link>
            </Button>
          </div>
        </div>

        {/* Enhanced Score Cards with Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ScoreCard 
            title="Overall Score"
            score={results.scores.overallScore}
            description="Your website's overall AI visibility score"
            isPrimary
            trend="up"
            previousScore={results.scores.overallScore - 8}
          />
          
          {results.scores.aiAnalysisScore !== undefined && (
            <ScoreCard 
              title="AI Analysis Score"
              score={results.scores.aiAnalysisScore}
              description="AI-powered evaluation of your content"
              trend="stable"
            />
          )}

          <ScoreCard 
            title="Content Quality"
            score={results.scores.contentScore || 75}
            description="Quality and relevance of your content"
            trend="up"
            previousScore={(results.scores.contentScore || 75) - 5}
          />
        </div>

        {/* Performance Metrics with Mini Charts */}
        {results.performance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
              <MiniChart 
                type="line" 
                data={performanceData} 
                color="#10b981"
                height={80}
              />
              <p className="text-sm text-muted-foreground mt-2">
                7-day performance trend
              </p>
            </div>
            
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Score History</h3>
              <MiniChart 
                type="bar" 
                data={scoreHistory} 
                labels={['2 weeks ago', '1 week ago', 'Today']}
                color="#3b82f6"
                height={80}
                showValues
              />
            </div>
            
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Analysis Time</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {results.performance.totalTimeMs / 1000}s
                </div>
                <p className="text-sm text-muted-foreground">
                  Total analysis time
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Fetch:</span>
                    <span>{results.performance.fetchTimeMs / 1000}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Analysis:</span>
                    <span>{results.performance.analysisTimeMs / 1000}s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Wins Section with Enhanced Priority Badges */}
        {results.quickWins && results.quickWins.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">⚡ Quick Wins</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.quickWins.map((win, idx) => (
                <div key={idx} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-6 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-green-900">{win.action}</h3>
                    <PriorityBadge 
                      priority={win.effort === 'low' ? 'high' : win.effort === 'medium' ? 'medium' : 'low'} 
                      size="sm"
                      animated={win.effort === 'low'}
                    />
                  </div>
                  <p className="text-sm text-green-700 mb-3">{win.impact}</p>
                  <div className="flex items-center text-xs text-green-600">
                    <span className="font-medium">Effort: {win.effort}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI-Powered Recommendations with Enhanced Priority Display */}
        {results.aiRecommendations && results.aiRecommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">🤖 AI-Powered Recommendations</h2>
            <div className="space-y-6">
              {results.aiRecommendations.map((rec, idx) => (
                <div key={idx} className="bg-muted/50 p-6 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{rec.title}</h3>
                    {rec.priority && (
                      <PriorityBadge 
                        priority={rec.priority} 
                        animated={rec.priority === 'high'}
                      />
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{rec.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">💡 Rationale</h4>
                      <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">📈 Expected Impact</h4>
                      <p className="text-sm text-muted-foreground">{rec.expected_impact}</p>
                    </div>
                  </div>
                  
                  {rec.example && (
                    <div className="bg-background p-4 rounded border">
                      <h4 className="font-medium mb-2">✨ Example</h4>
                      <p className="text-sm font-mono">{rec.example}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.reports.map((report, index) => (
            <ReportCard key={index} report={report} />
          ))}
        </div>
      </div>
    </div>
  )
} 