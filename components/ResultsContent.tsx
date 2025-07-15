"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ScoreCard from "@/components/ScoreCard"
import ReportCard from "@/components/ReportCard"
import Loader from "@/components/Loader"
import { analyzeUrl, ApiError, TimeoutError, NetworkError, AccessError, ValidationError } from "@/lib/apiClient"
import AIRankingVisualization from "@/components/AIRankingVisualization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Users, Target, Globe, AlertCircle, RefreshCw, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

interface ErrorState {
  message: string;
  type: string;
}

export default function ResultsContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get("url")
  const businessContextParam = searchParams.get("businessContext")
  const [businessContext, setBusinessContext] = useState<BusinessContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<ErrorState | null>(null)
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

  // Get error icon based on error type
  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case 'TimeoutError':
        return '⏱️';
      case 'NetworkError':
        return '🌐';
      case 'AccessError':
        return '🔒';
      case 'ValidationError':
        return '⚠️';
      default:
        return '❌';
    }
  }

  // Get troubleshooting tips based on error type
  const getTroubleshootingTips = (errorType: string) => {
    switch (errorType) {
      case 'TimeoutError':
        return [
          'Try analyzing a specific page instead of the homepage',
          'The website might be too large or complex',
          'Try again during off-peak hours',
          'Check if the website has heavy JavaScript that slows analysis'
        ];
      case 'NetworkError':
        return [
          'Check your internet connection',
          'The website might be temporarily down',
          'Try again in a few minutes',
          'Verify that the website is publicly accessible'
        ];
      case 'AccessError':
        return [
          'Ensure the URL is publicly accessible (not behind login)',
          'Check if the website has anti-bot protection',
          'Verify that the website exists and is online',
          'Try using a different page from the same website'
        ];
      case 'ValidationError':
        return [
          'Check that the URL format is correct',
          'Make sure to include http:// or https://',
          'Try removing any query parameters',
          'Verify that you entered the domain correctly'
        ];
      default:
        return [
          'Try analyzing a specific page instead of the homepage',
          'Ensure the URL is publicly accessible (not behind login)',
          'Check if the website has anti-bot protection',
          'Try again during off-peak hours'
        ];
    }
  }

  // Retry functionality
  const handleRetry = async () => {
    if (retryCount >= 3) {
      setError({
        message: "Maximum retry attempts reached. Please try a different URL or contact support.",
        type: "MaxRetryError"
      });
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
      
      if (apiError instanceof TimeoutError) {
        setError({
          message: `Analysis timed out (attempt ${retryCount + 1}/3). ${apiError.message}`,
          type: 'TimeoutError'
        });
      } else if (apiError instanceof NetworkError) {
        setError({
          message: `Network error (attempt ${retryCount + 1}/3). ${apiError.message}`,
          type: 'NetworkError'
        });
      } else if (apiError instanceof AccessError) {
        setError({
          message: `Access error (attempt ${retryCount + 1}/3). ${apiError.message}`,
          type: 'AccessError'
        });
      } else if (apiError instanceof ValidationError) {
        setError({
          message: `Validation error (attempt ${retryCount + 1}/3). ${apiError.message}`,
          type: 'ValidationError'
        });
      } else if (apiError instanceof ApiError) {
        setError({
          message: `API error (attempt ${retryCount + 1}/3). ${apiError.message}`,
          type: 'ApiError'
        });
      } else if (apiError instanceof Error) {
        setError({
          message: `Error (attempt ${retryCount + 1}/3): ${apiError.message}`,
          type: apiError.name || 'UnknownError'
        });
      } else {
        setError({
          message: `Unknown error (attempt ${retryCount + 1}/3)`,
          type: 'UnknownError'
        });
      }
    }
  };

  useEffect(() => {
    if (!url) {
      setError({
        message: "No URL provided. Please enter a URL to analyze.",
        type: "ValidationError"
      });
      setLoading(false);
      return;
    }

    // Fetch results from API
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching data from analysis API...");
        const result = await analyzeUrl(url);
        console.log("API returned:", result);
        
        // Check if this is a fallback response
        if (result.source === 'fallback') {
          console.log("Received fallback response");
          // Still show results but with a warning
          setResults(result);
          setError({
            message: "Limited analysis due to website access issues. Results may be incomplete.",
            type: "FallbackError"
          });
        } else {
          setResults(result);
        }
        
        setLoading(false);
      } catch (apiError) {
        console.error("API call failed:", apiError);
        setLoading(false);
        
        // Provide specific error messages based on error type
        if (apiError instanceof TimeoutError) {
          setError({
            message: apiError.message,
            type: 'TimeoutError'
          });
        } else if (apiError instanceof NetworkError) {
          setError({
            message: apiError.message,
            type: 'NetworkError'
          });
        } else if (apiError instanceof AccessError) {
          setError({
            message: apiError.message,
            type: 'AccessError'
          });
        } else if (apiError instanceof ValidationError) {
          setError({
            message: apiError.message,
            type: 'ValidationError'
          });
        } else if (apiError instanceof ApiError) {
          setError({
            message: apiError.message,
            type: 'ApiError'
          });
        } else if (apiError instanceof Error) {
          setError({
            message: apiError.message,
            type: apiError.name || 'UnknownError'
          });
        } else {
          setError({
            message: "An unexpected error occurred. Please try again or contact support.",
            type: 'UnknownError'
          });
        }
      }
    };

    fetchResults();
  }, [url]);

  if (loading || isRetrying) {
    return (
      <div className="container max-w-4xl py-24 flex items-center justify-center">
        <Loader message={
          isRetrying 
            ? `Retrying analysis (attempt ${retryCount + 1}/3)...` 
            : "Analyzing your website..."
        } />
      </div>
    );
  }

  if (error && !results) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-bold mb-4">Analysis Error</h1>
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="whitespace-pre-line">
              {getErrorIcon(error.type)} {error.message}
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {retryCount < 3 && (
              <Button onClick={handleRetry} disabled={isRetrying} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {isRetrying ? "Retrying..." : `Retry Analysis (${retryCount}/3)`}
              </Button>
            )}
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link href="/analyzer">
                <ExternalLink className="h-4 w-4" />
                Try Different URL
              </Link>
            </Button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Troubleshooting Tips:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              {getTroubleshootingTips(error.type).map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
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
    );
  }

  return (
    <div className="container max-w-4xl py-12">
      <div className="flex flex-col space-y-8">
        {/* Warning banner for fallback/limited results */}
        {error && results && (
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-800" />
            <AlertDescription className="text-amber-800">
              {getErrorIcon(error.type)} {error.message}
            </AlertDescription>
          </Alert>
        )}
        
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ScoreCard
            title="Overall Score"
            score={results.scores.overallScore}
            description="Combined AI visibility score"
            isPrimary
          />
          <ScoreCard
            title="Readability"
            score={results.scores.readability}
            description="How easily AI can parse your content"
          />
          <ScoreCard
            title="Structure"
            score={results.scores.headingsStructure}
            description="Heading organization and hierarchy"
          />
          <ScoreCard
            title="Schema"
            score={results.scores.schema}
            description="Structured data for AI understanding"
          />
        </div>

        {/* AI Ranking Visualization */}
        <AIRankingVisualization 
          url={results.url}
          brandName={businessContext?.companyName}
          industry={businessContext?.industry}
          businessContext={businessContext || undefined}
        />

        {/* Recommendations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Recommendations</h2>
          <div className="grid grid-cols-1 gap-4">
            {results.aiRecommendations ? (
              results.aiRecommendations.map((rec, index) => (
                <ReportCard
                  key={index}
                  title="AI Recommendation"
                  items={[rec]}
                  type="ai-recommendations"
                />
              ))
            ) : (
              <ReportCard
                title="Recommendations"
                items={results.recommendations}
                type="recommendations"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 