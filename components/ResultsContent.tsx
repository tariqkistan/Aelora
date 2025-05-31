"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import ScoreCard from "@/components/ScoreCard"
import ReportCard from "@/components/ReportCard"
import PriorityBadge from "@/components/PriorityBadge"
import MiniChart from "@/components/MiniChart"
import InteractiveDashboard from "@/components/InteractiveDashboard"
import ComparisonView from "@/components/ComparisonView"
import RealTimeAnalytics from "@/components/RealTimeAnalytics"
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
    contentScore?: number
    technicalScore?: number
    userExperience?: number
    performance?: number
    accessibility?: number
  }
  recommendations: string[]
  reports?: {
    title: string
    recommendations: string[]
  }[]
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
  const [activeView, setActiveView] = useState('overview')

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

  // Prepare data for interactive components
  const dashboardData = {
    scores: {
      overallScore: results.scores.overallScore,
      contentScore: results.scores.contentScore || 75,
      technicalScore: results.scores.technicalScore || 70,
      aiAnalysisScore: results.scores.aiAnalysisScore
    },
    performance: results.performance ? {
      fetchTimeMs: results.performance.fetchTimeMs || 0,
      analysisTimeMs: results.performance.analysisTimeMs || 0,
      totalTimeMs: results.performance.totalTimeMs || 0
    } : undefined,
    trends: {
      weekly: [65, 72, 68, 85, 78, 82, results.scores.overallScore],
      monthly: [60, 65, 70, 75, 80, 85, results.scores.overallScore]
    },
    breakdown: {
      categories: ['Content Quality', 'Technical SEO', 'User Experience', 'Performance', 'Accessibility'],
      values: [
        results.scores.contentScore || 75,
        results.scores.technicalScore || 70,
        results.scores.userExperience || 80,
        results.scores.performance || 85,
        results.scores.accessibility || 78
      ],
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444']
    }
  }

  const comparisonData = {
    current: {
      overallScore: results.scores.overallScore,
      contentScore: results.scores.contentScore || 75,
      technicalScore: results.scores.technicalScore || 70,
      date: new Date().toLocaleDateString()
    },
    previous: {
      overallScore: results.scores.overallScore - 8,
      contentScore: (results.scores.contentScore || 75) - 5,
      technicalScore: (results.scores.technicalScore || 70) - 3,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
    },
    improvements: [
      {
        category: 'Content Optimization',
        change: 8,
        description: 'Improved keyword density and semantic relevance',
        impact: 'high' as const
      },
      {
        category: 'Technical SEO',
        change: 3,
        description: 'Enhanced meta descriptions and schema markup',
        impact: 'medium' as const
      },
      {
        category: 'User Experience',
        change: -2,
        description: 'Page load time slightly increased',
        impact: 'low' as const
      }
    ]
  }

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

        {/* Enhanced Navigation Tabs */}
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="interactive">Interactive</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
            <TabsTrigger value="real-time">Real-Time</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Enhanced Score Cards with Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* Quick Wins Section */}
            {results.quickWins && results.quickWins.length > 0 && (
              <div>
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
          </TabsContent>

          <TabsContent value="interactive" className="space-y-8">
            <InteractiveDashboard data={dashboardData} />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-8">
            <ComparisonView data={comparisonData} />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-8">
            {/* AI-Powered Recommendations */}
            {results.aiRecommendations && results.aiRecommendations.length > 0 && (
              <div>
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
              {results.reports?.map((report, index) => (
                <ReportCard key={index} report={report} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="real-time" className="space-y-8">
            <RealTimeAnalytics url={results.url} initialScore={results.scores.overallScore} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 