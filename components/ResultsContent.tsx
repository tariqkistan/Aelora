"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ScoreCard from "@/components/ScoreCard"
import ReportCard from "@/components/ReportCard"
import Loader from "@/components/Loader"
import { analyzeUrl } from "@/lib/apiClient"
import AIRankingVisualization from "@/components/AIRankingVisualization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Users, Target, Globe } from "lucide-react"

interface BusinessContext {
  companyName: string;
  industry: string;
  companySize: string;
  primaryLocation: string;
  country: string;
  targetMarkets: string[];
  businessModel: string;
  targetAudience: string;
  priceRange: string;
  mainCompetitors: string[];
  primaryGoals: string[];
  currentChallenges: string[];
  brandPersonality: string;
  additionalInfo: string;
}

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
    status?: string
  }
  source?: string // Added for fallback handling
}

export default function ResultsContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get("url")
  const businessContextParam = searchParams.get("businessContext")
  const [businessContext, setBusinessContext] = useState<BusinessContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  // Parse business context from URL params
  useEffect(() => {
    if (businessContextParam) {
      try {
        const parsed = JSON.parse(businessContextParam) as BusinessContext
        setBusinessContext(parsed)
      } catch (error) {
        console.error("Failed to parse business context:", error)
      }
    }
  }, [businessContextParam])

  // Export functionality
  const exportResults = () => {
    if (!results) return
    
    const exportData = {
      ...results,
      businessContext,
      exportedAt: new Date().toISOString(),
      exportedBy: 'Aelora AI Search Optimizer'
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `aelora-analysis-${new URL(results.url).hostname}-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Retry functionality
  const handleRetry = async () => {
    if (retryCount >= 3) {
      setError("Maximum retry attempts reached. Please try a different URL or contact support.");
      return;
    }

    setIsRetrying(true);
    setError(null);
    setRetryCount(prev => prev + 1);
    
    try {
      console.log(`Retrying analysis (attempt ${retryCount + 1}/3)...`);
      const result = await analyzeUrl(url!);
      console.log("Retry successful:", result);
      setResults(result);
      setIsRetrying(false);
    } catch (apiError) {
      console.error("Retry failed:", apiError);
      setIsRetrying(false);
      
      if (apiError instanceof Error) {
        if (apiError.name === 'TimeoutError') {
          setError(`Analysis timed out (attempt ${retryCount + 1}/3). ${apiError.message}`);
        } else if (apiError.name === 'NetworkError') {
          setError(`Network error (attempt ${retryCount + 1}/3). ${apiError.message}`);
        } else {
          setError(`Error (attempt ${retryCount + 1}/3): ${apiError.message}`);
        }
      } else {
        setError(`Unknown error occurred (attempt ${retryCount + 1}/3). Please try again.`);
      }
    }
  };

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
        setError(null)
        
        console.log("Fetching data from analysis API...")
        const result = await analyzeUrl(url)
        console.log("API returned:", result)
        
        // Check if this is a fallback response
        if (result.source === 'fallback') {
          console.log("Received fallback response");
          // Still show results but with a warning
          setResults(result);
          setError("⚠️ Limited analysis due to website access issues. Results may be incomplete.");
        } else {
          setResults(result);
        }
        
        setLoading(false)
      } catch (apiError) {
        console.error("API call failed:", apiError)
        setLoading(false)
        
        // Provide specific error messages based on error type
        if (apiError instanceof Error) {
          if (apiError.name === 'TimeoutError') {
            setError(`⏱️ Analysis timed out. This usually happens with very large websites or during high server load. ${apiError.message}`);
          } else if (apiError.name === 'NetworkError') {
            setError(`🌐 Network connection failed. ${apiError.message}`);
          } else if (apiError.message.includes('not found') || apiError.message.includes('not accessible')) {
            setError(`🔍 Website not accessible. ${apiError.message}`);
          } else {
            setError(`❌ Analysis failed: ${apiError.message}`);
          }
        } else {
          setError("❌ An unexpected error occurred. Please try again or contact support.");
        }
      }
    }

    fetchResults()
  }, [url])

  if (loading || isRetrying) {
    return (
      <div className="container max-w-4xl py-24 flex items-center justify-center">
        <Loader message={
          isRetrying 
            ? `Retrying analysis (attempt ${retryCount + 1}/3)...` 
            : "Analyzing your website..."
        } />
      </div>
    )
  }

  if (error && !results) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-bold mb-4">Analysis Error</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-red-800 whitespace-pre-line">{error}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {retryCount < 3 && (
              <Button onClick={handleRetry} disabled={isRetrying}>
                {isRetrying ? "Retrying..." : `🔄 Retry Analysis (${retryCount}/3)`}
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/analyzer">🔍 Try Different URL</Link>
            </Button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Troubleshooting Tips:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Try analyzing a specific page instead of the homepage</li>
              <li>• Ensure the URL is publicly accessible (not behind login)</li>
              <li>• Check if the website has anti-bot protection</li>
              <li>• Try again during off-peak hours</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="container max-w-4xl py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">No Results Found</h1>
        <p className="text-muted-foreground mb-6">No analysis results available.</p>
        <Button asChild>
          <Link href="/analyzer">Try Another URL</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-12">
      <div className="flex flex-col space-y-8">
        {/* Business Context Display */}
        {businessContext && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Business Context Applied
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                This analysis is tailored to your business information for more relevant insights
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Company Details</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-muted-foreground">Name:</span> {businessContext.companyName}</div>
                    <div><span className="text-muted-foreground">Industry:</span> {businessContext.industry}</div>
                    <div><span className="text-muted-foreground">Size:</span> {businessContext.companySize}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Location & Market</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-muted-foreground">Location:</span> {businessContext.primaryLocation}</div>
                    <div><span className="text-muted-foreground">Country:</span> {businessContext.country}</div>
                    <div><span className="text-muted-foreground">Model:</span> {businessContext.businessModel}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Goals & Challenges</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Goals:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {businessContext.primaryGoals.slice(0, 3).map((goal, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {goal}
                          </Badge>
                        ))}
                        {businessContext.primaryGoals.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{businessContext.primaryGoals.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {businessContext.targetAudience && (
                <div className="mt-4 p-3 bg-white/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Target Audience</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{businessContext.targetAudience}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Warning banner for fallback/limited results */}
        {error && results && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-amber-600 mr-3">⚠️</div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Limited Analysis</h3>
                <p className="text-amber-800 text-sm">{error}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleRetry} disabled={isRetrying || retryCount >= 3}>
                    {isRetrying ? "Retrying..." : "🔄 Retry Full Analysis"}
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/analyzer">🔍 Try Different URL</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Analysis Results
            {businessContext && (
              <span className="text-lg font-normal text-muted-foreground ml-2">
                for {businessContext.companyName}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            URL: <span className="font-medium">{results.url}</span>
          </p>
          {results.source && (
            <p className="text-sm text-muted-foreground mt-1">
              Source: <span className="font-medium capitalize">{results.source}</span>
              {results.performance?.status && ` • Status: ${results.performance.status}`}
            </p>
          )}
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

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ScoreCard
            title="Overall Score"
            score={results.scores.overallScore}
            description="Combined analysis score"
          />
          <ScoreCard
            title="Readability"
            score={results.scores.readability}
            description="Content clarity and structure"
          />
          <ScoreCard
            title="Schema Markup"
            score={results.scores.schema}
            description="Structured data implementation"
          />
          <ScoreCard
            title="Q&A Match"
            score={results.scores.questionAnswerMatch}
            description="Content answers common questions"
          />
          <ScoreCard
            title="Headings Structure"
            score={results.scores.headingsStructure}
            description="Proper heading hierarchy"
          />
          {results.scores.aiAnalysisScore && (
            <ScoreCard
              title="AI Analysis"
              score={results.scores.aiAnalysisScore}
              description="AI-powered content assessment"
            />
          )}
        </div>

        {/* AI Ranking Visualization */}
        <AIRankingVisualization 
          url={results.url} 
          brandName={businessContext?.companyName}
          industry={businessContext?.industry}
          businessContext={businessContext || undefined}
        />

        {/* Report Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportCard
            title="Recommendations"
            items={results.recommendations}
            type="recommendations"
          />
          {results.aiRecommendations && results.aiRecommendations.length > 0 && (
            <ReportCard
              title="AI-Powered Recommendations"
              items={results.aiRecommendations}
              type="ai-recommendations"
            />
          )}
          {results.quickWins && results.quickWins.length > 0 && (
            <ReportCard
              title="Quick Wins"
              items={results.quickWins}
              type="quick-wins"
            />
          )}
        </div>

        {/* Detailed Analysis */}
        {results.details && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Detailed Analysis</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-muted-foreground text-sm">Word Count</p>
                <p className="text-2xl font-bold">{results.details.wordCount}</p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-muted-foreground text-sm">Headings</p>
                <p className="text-2xl font-bold">{results.details.headingCount}</p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-muted-foreground text-sm">Images</p>
                <p className="text-2xl font-bold">{results.details.imageCount}</p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-muted-foreground text-sm">Img Alt Text</p>
                <p className="text-2xl font-bold">{results.details?.imageAltTextRate || 0}%</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-8">
          <Button asChild variant="outline">
            <Link href="/analyzer">
              Analyze Another URL
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 