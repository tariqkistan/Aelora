"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import EnhancedScoreCard from "@/components/EnhancedScoreCard"
import ReportCard from "@/components/ReportCard"
import CollapsibleSection from "@/components/CollapsibleSection"
import ViewModeToggle from "@/components/ViewModeToggle"
import RecommendationMatrix from "@/components/RecommendationMatrix"
import ScoreRadarChart from "@/components/ScoreRadarChart"
import ContentStructureViz from "@/components/ContentStructureViz"
import ExportManager from "@/components/ExportManager"
import GamificationPanel from "@/components/GamificationPanel"
import HistoricalTrends from "@/components/HistoricalTrends"
import { useViewMode } from "@/components/ViewModeProvider"
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

export default function EnhancedResultsContent() {
  const searchParams = useSearchParams()
  const { isSimpleMode, isExpertMode } = useViewMode()
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = searchParams.get('url')
    if (!url) {
      setError('No URL provided')
      setLoading(false)
      return
    }

    const fetchResults = async () => {
      try {
        setLoading(true)
        const data = await analyzeUrl(url)
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchParams])

  if (loading) {
    return (
      <div className="container max-w-6xl py-12">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Analysis Failed</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/analyzer">
            <Button>Try Again</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Results</h1>
          <Link href="/analyzer">
            <Button>Start New Analysis</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get top 3 recommendations for simple mode
  const topRecommendations = results.recommendations.slice(0, 3)
  const topQuickWins = results.quickWins?.slice(0, 3) || []

  // Sample benchmark data (in a real app, this would come from your backend)
  const benchmarks = {
    readability: 75,
    schema: 60,
    questionAnswerMatch: 70,
    headingsStructure: 80,
    overallScore: 72
  }

  // Sample historical data for demonstration
  const sampleHistoricalData = [
    {
      date: '2024-01-15',
      overallScore: 65,
      readability: 70,
      schema: 45,
      questionAnswerMatch: 60,
      headingsStructure: 75,
      url: 'example.com/page1',
      improvements: ['Added meta description', 'Improved headings']
    },
    {
      date: '2024-01-20',
      overallScore: 72,
      readability: 75,
      schema: 55,
      questionAnswerMatch: 68,
      headingsStructure: 80,
      url: 'example.com/page2',
      improvements: ['Added schema markup']
    },
    {
      date: '2024-01-25',
      overallScore: results.scores.overallScore,
      readability: results.scores.readability,
      schema: results.scores.schema,
      questionAnswerMatch: results.scores.questionAnswerMatch,
      headingsStructure: results.scores.headingsStructure,
      url: results.url,
      improvements: []
    }
  ]

  // Sample user stats for gamification
  const sampleUserStats = {
    totalAnalyses: 3,
    averageScore: 69,
    bestScore: Math.max(results.scores.overallScore, 72),
    improvementStreak: results.scores.overallScore > 72 ? 1 : 0,
    lastAnalysisDate: new Date().toISOString(),
    totalImprovements: 3,
    quickWinsCompleted: 5
  }

  // Export data structure
  const exportData = {
    url: results.url,
    timestamp: results.timestamp,
    scores: results.scores,
    recommendations: results.recommendations,
    quickWins: results.quickWins,
    details: results.details
  }

  return (
    <div className="container max-w-6xl py-8">
      {/* Header with View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analysis Results</h1>
          <p className="text-muted-foreground">
            Analysis for: <span className="font-medium">{results.url}</span>
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <ViewModeToggle />
        </div>
      </div>

      <div className="space-y-8">
        {/* Overall Score - Always Visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnhancedScoreCard
            title="Overall AI Visibility Score"
            score={results.scores.overallScore}
            description="Your website's overall optimization for AI search engines"
            isPrimary
            benchmark={benchmarks.overallScore}
          />
          
          {results.scores.aiAnalysisScore !== undefined && (
            <EnhancedScoreCard
              title="AI Analysis Score"
              score={results.scores.aiAnalysisScore}
              description="AI-powered evaluation of your content quality"
              isPrimary
              benchmark={75}
            />
          )}
        </div>

        {/* Quick Wins - Always Visible */}
        {topQuickWins.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="mr-2">🚀</span>
              Quick Wins
            </h2>
            <p className="text-muted-foreground mb-6">
              Simple actions you can take right now to improve your AI search visibility
            </p>
            <div className="grid gap-4">
              {topQuickWins.map((win, idx) => (
                <div key={idx} className="bg-white/80 dark:bg-gray-900/80 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">{win.action}</h3>
                      <p className="text-green-700 dark:text-green-300 text-sm">{win.impact}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                      win.effort === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      win.effort === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {win.effort} effort
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {isSimpleMode && results.quickWins && results.quickWins.length > 3 && (
              <p className="text-sm text-muted-foreground mt-4">
                Switch to Expert mode to see {results.quickWins.length - 3} more quick wins
              </p>
            )}
          </div>
        )}

        {/* Core Metrics */}
        <CollapsibleSection
          title="Core Metrics"
          defaultOpen={isSimpleMode}
          badge={`${Object.keys(results.scores).length - 1} metrics`}
          description="Key performance indicators"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedScoreCard
              title="Readability"
              score={results.scores.readability}
              description="How easy your content is to read and understand"
              showDetails={isExpertMode}
              benchmark={benchmarks.readability}
            />
            <EnhancedScoreCard
              title="Schema Structure"
              score={results.scores.schema}
              description="Usage of structured data markup"
              showDetails={isExpertMode}
              benchmark={benchmarks.schema}
            />
            <EnhancedScoreCard
              title="Question-Answer Match"
              score={results.scores.questionAnswerMatch}
              description="How well your content answers common questions"
              showDetails={isExpertMode}
              benchmark={benchmarks.questionAnswerMatch}
            />
            <EnhancedScoreCard
              title="Headings Structure"
              score={results.scores.headingsStructure}
              description="Organization and hierarchy of your content"
              showDetails={isExpertMode}
              benchmark={benchmarks.headingsStructure}
            />
            
            {isExpertMode && results.scores.contentDepth !== undefined && (
              <EnhancedScoreCard
                title="Content Depth"
                score={results.scores.contentDepth}
                description="Comprehensiveness and detail of your content"
                showDetails={isExpertMode}
                benchmark={70}
              />
            )}
            
            {isExpertMode && results.scores.keywordOptimization !== undefined && (
              <EnhancedScoreCard
                title="Keyword Optimization"
                score={results.scores.keywordOptimization}
                description="Strategic use of relevant keywords"
                showDetails={isExpertMode}
                benchmark={65}
              />
            )}
          </div>
        </CollapsibleSection>

        {/* Score Visualization - Expert Mode */}
        {isExpertMode && (
          <CollapsibleSection
            title="Score Visualization"
            description="Multi-dimensional performance overview"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Radar Chart */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Performance Radar</h4>
                <ScoreRadarChart
                  scores={[
                    { label: 'Readability', score: results.scores.readability, maxScore: 100 },
                    { label: 'Schema', score: results.scores.schema, maxScore: 100 },
                    { label: 'Q&A Match', score: results.scores.questionAnswerMatch, maxScore: 100 },
                    { label: 'Headings', score: results.scores.headingsStructure, maxScore: 100 },
                    ...(results.scores.contentDepth !== undefined ? [{ label: 'Content Depth', score: results.scores.contentDepth, maxScore: 100 }] : []),
                    ...(results.scores.keywordOptimization !== undefined ? [{ label: 'Keywords', score: results.scores.keywordOptimization, maxScore: 100 }] : [])
                  ]}
                  size={280}
                />
              </div>

              {/* Content Structure Visualization */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Content Structure</h4>
                <ContentStructureViz
                  structure={[
                    {
                      id: 'h1-1',
                      type: 'h1',
                      text: 'Main Title',
                      hasKeywords: true,
                      children: [
                        {
                          id: 'h2-1',
                          type: 'h2',
                          text: 'Introduction',
                          hasKeywords: false,
                          children: [
                            { id: 'content-1', type: 'content', text: 'Opening paragraph', wordCount: 45 },
                            { id: 'image-1', type: 'image', text: 'Hero image' }
                          ]
                        },
                        {
                          id: 'h2-2',
                          type: 'h2',
                          text: 'Main Content',
                          hasKeywords: true,
                          children: [
                            { id: 'content-2', type: 'content', text: 'Main content block', wordCount: 120 },
                            { id: 'list-1', type: 'list', text: 'Feature list' }
                          ]
                        }
                      ]
                    }
                  ]}
                />
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Recommendations */}
        <CollapsibleSection
          title="Recommendations"
          defaultOpen={true}
          badge={isSimpleMode ? topRecommendations.length : results.recommendations.length}
          description="Actionable improvements"
        >
          {isExpertMode ? (
            <RecommendationMatrix
              recommendations={[
                {
                  id: '1',
                  title: 'Add Meta Description',
                  description: 'Create compelling meta descriptions for better AI search visibility',
                  impact: 'high',
                  effort: 'low',
                  category: 'technical',
                  estimatedTimeHours: 1,
                  potentialScoreIncrease: 8
                },
                {
                  id: '2',
                  title: 'Improve Heading Structure',
                  description: 'Reorganize headings to follow proper H1-H6 hierarchy',
                  impact: 'medium',
                  effort: 'medium',
                  category: 'structure',
                  estimatedTimeHours: 3,
                  potentialScoreIncrease: 5
                },
                {
                  id: '3',
                  title: 'Add Schema Markup',
                  description: 'Implement structured data for better AI understanding',
                  impact: 'high',
                  effort: 'high',
                  category: 'technical',
                  estimatedTimeHours: 8,
                  potentialScoreIncrease: 12
                },
                {
                  id: '4',
                  title: 'Optimize Content Length',
                  description: 'Expand thin content sections to provide more value',
                  impact: 'medium',
                  effort: 'high',
                  category: 'content',
                  estimatedTimeHours: 6,
                  potentialScoreIncrease: 7
                },
                {
                  id: '5',
                  title: 'Add FAQ Section',
                  description: 'Create FAQ section to answer common user questions',
                  impact: 'high',
                  effort: 'medium',
                  category: 'ai',
                  estimatedTimeHours: 4,
                  potentialScoreIncrease: 10
                },
                {
                  id: '6',
                  title: 'Improve Readability',
                  description: 'Simplify complex sentences and improve text flow',
                  impact: 'low',
                  effort: 'low',
                  category: 'content',
                  estimatedTimeHours: 2,
                  potentialScoreIncrease: 3
                }
              ]}
              onRecommendationClick={(rec) => {
                console.log('Clicked recommendation:', rec.title)
              }}
            />
          ) : (
            <>
              <ReportCard
                title=""
                recommendations={topRecommendations}
              />
              {results.recommendations.length > 3 && (
                <p className="text-sm text-muted-foreground mt-4">
                  Switch to Expert mode to see {results.recommendations.length - 3} more recommendations and interactive prioritization
                </p>
              )}
            </>
          )}
        </CollapsibleSection>

        {/* AI-Powered Recommendations - Expert Mode Only */}
        {isExpertMode && results.aiRecommendations && results.aiRecommendations.length > 0 && (
          <CollapsibleSection
            title="AI-Powered Recommendations"
            badge={results.aiRecommendations.length}
            description="Detailed AI analysis and suggestions"
          >
            <div className="space-y-6">
              {results.aiRecommendations.map((rec, idx) => (
                <div key={idx} className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{rec.title}</h3>
                    {rec.priority && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {rec.priority} priority
                      </span>
                    )}
                  </div>
                  <p className="mb-3">{rec.description}</p>
                  
                  <div className="mt-3 pt-3 border-t border-border">
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Why this helps:</h4>
                    <p className="text-sm mb-3">{rec.rationale}</p>
                    
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Example:</h4>
                    <div className="bg-background p-3 rounded text-sm mb-3">
                      <code className="whitespace-pre-wrap">{rec.example}</code>
                    </div>
                    
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Expected Impact:</h4>
                    <p className="text-sm">{rec.expected_impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Technical Details - Expert Mode Only */}
        {isExpertMode && results.details && (
          <CollapsibleSection
            title="Technical Analysis"
            description="Detailed technical metrics and insights"
          >
            <div className="space-y-6">
              {/* Performance Metrics */}
              {results.performance && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Analysis Performance</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-muted/40 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {results.performance.fetchTimeMs}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Fetch Time</div>
                    </div>
                    <div className="bg-muted/40 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {results.performance.analysisTimeMs}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Analysis Time</div>
                    </div>
                    <div className="bg-muted/40 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {results.performance.totalTimeMs}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Total Time</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Structure */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Content Structure</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/40 p-3 rounded">
                    <p className="text-sm text-muted-foreground">Word Count</p>
                    <p className="font-semibold">{results.details.wordCount}</p>
                  </div>
                  <div className="bg-muted/40 p-3 rounded">
                    <p className="text-sm text-muted-foreground">Headings</p>
                    <p className="font-semibold">{results.details.headingCount}</p>
                  </div>
                  <div className="bg-muted/40 p-3 rounded">
                    <p className="text-sm text-muted-foreground">Paragraphs</p>
                    <p className="font-semibold">{results.details.paragraphCount}</p>
                  </div>
                  <div className="bg-muted/40 p-3 rounded">
                    <p className="text-sm text-muted-foreground">FAQs</p>
                    <p className="font-semibold">{results.details.faqCount}</p>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              {results.details.keywordsFound && results.details.keywordsFound.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Detected Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.details.keywordsFound.slice(0, 15).map((keyword, index) => (
                      <div key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {keyword}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Gamification Panel - Expert Mode */}
        {isExpertMode && (
          <CollapsibleSection
            title="Progress & Achievements"
            description="Track your optimization journey"
          >
            <GamificationPanel
              currentScore={results.scores.overallScore}
              previousScore={72} // Sample previous score
              userStats={sampleUserStats}
            />
          </CollapsibleSection>
        )}

        {/* Historical Trends - Expert Mode */}
        {isExpertMode && (
          <CollapsibleSection
            title="Historical Trends"
            description="Track your progress over time"
          >
            <HistoricalTrends
              data={sampleHistoricalData}
              currentScore={results.scores.overallScore}
            />
          </CollapsibleSection>
        )}

        {/* Export & Sharing */}
        <CollapsibleSection
          title="Export & Share"
          description="Save and share your analysis results"
        >
          <ExportManager data={exportData} />
        </CollapsibleSection>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
          <Link href="/analyzer" className="flex-1">
            <Button variant="outline" className="w-full">
              Analyze Another URL
            </Button>
          </Link>
          <Button 
            onClick={() => window.location.reload()}
            variant="secondary" 
            className="flex-1"
          >
            Re-analyze This URL
          </Button>
        </div>
      </div>
    </div>
  )
} 