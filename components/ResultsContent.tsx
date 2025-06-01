"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ScoreCard from "@/components/ScoreCard"
import ReportCard from "@/components/ReportCard"
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
    
    const exportData = {
      ...results,
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
      <div className="container max-w-4xl py-24 flex items-center justify-center">
        <Loader message="Analyzing your website..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild>
          <Link href="/analyzer">Try Again</Link>
        </Button>
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
        <div className="text-center">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScoreCard 
            title="Overall Score"
            score={results.scores.overallScore}
            description="Your website's overall AI visibility score"
            isPrimary
          />
          
          {/* Add AI Score Card if available */}
          {results.scores.aiAnalysisScore !== undefined && (
            <ScoreCard 
              title="AI Analysis Score"
              score={results.scores.aiAnalysisScore}
              description="AI-powered evaluation of your content"
              isPrimary
            />
          )}
          
          {/* Performance Metrics Card */}
          {results.performance && (
            <div className="col-span-1 md:col-span-2">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Analysis Performance</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {results.performance.fetchTimeMs}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Fetch Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {results.performance.analysisTimeMs}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Analysis Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {results.performance.totalTimeMs}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Total Time</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Content Type & Industry Detection */}
          {results.details?.contentType && (
            <div className="col-span-1 md:col-span-2">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Content Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Content Type</div>
                    <div className="font-medium capitalize">{results.details.contentType}</div>
                  </div>
                  {results.details.industry && (
                    <div>
                      <div className="text-sm text-muted-foreground">Industry</div>
                      <div className="font-medium">{results.details.industry}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-muted-foreground">Word Count</div>
                    <div className="font-medium">{results.details.wordCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Headings</div>
                    <div className="font-medium">{results.details.headingCount}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <ScoreCard 
            title="Readability"
            score={results.scores.readability}
            description="How easy your content is to read and understand"
          />
          <ScoreCard 
            title="Schema Structure"
            score={results.scores.schema}
            description="Usage of structured data markup"
          />
          <ScoreCard 
            title="Question-Answer Match"
            score={results.scores.questionAnswerMatch}
            description="How well your content answers relevant questions"
          />
          <ScoreCard 
            title="Headings Structure"
            score={results.scores.headingsStructure}
            description="Organization and clarity of content structure"
          />
          {results.scores.contentDepth !== undefined && (
            <ScoreCard 
              title="Content Depth"
              score={results.scores.contentDepth}
              description="The thoroughness and detail of your content"
            />
          )}
          {results.scores.keywordOptimization !== undefined && (
            <ScoreCard 
              title="Keyword Optimization"
              score={results.scores.keywordOptimization}
              description="How well your content uses relevant keywords"
            />
          )}
        </div>

        {results.details && (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Detailed Analysis</h3>
            
            <div className="space-y-6">
              {/* Readability Metrics */}
              <div>
                <h4 className="font-medium text-lg mb-2">Readability Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-muted/40 p-3 rounded">
                    <p className="text-sm text-muted-foreground">Average Sentence Length</p>
                    <p className="font-semibold">{results.details.readabilityMetrics.sentenceLength} words</p>
                  </div>
                  
                  {results.details.readabilityMetrics.fleschKincaidGrade !== undefined && (
                    <div className="bg-muted/40 p-3 rounded">
                      <p className="text-sm text-muted-foreground">Flesch-Kincaid Grade</p>
                      <p className="font-semibold">{results.details.readabilityMetrics.fleschKincaidGrade}</p>
                    </div>
                  )}
                  
                  {results.details.readabilityMetrics.smogIndex !== undefined && (
                    <div className="bg-muted/40 p-3 rounded">
                      <p className="text-sm text-muted-foreground">SMOG Index</p>
                      <p className="font-semibold">{results.details.readabilityMetrics.smogIndex}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Heading Analysis */}
              {results.details.headingAnalysis && (
                <div>
                  <h4 className="font-medium text-lg mb-2">Heading Structure</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/40 p-3 rounded">
                      <p className="text-sm text-muted-foreground">Proper Hierarchy</p>
                      <p className="font-semibold">{results.details.headingAnalysis.hasProperHierarchy ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="bg-muted/40 p-3 rounded">
                      <p className="text-sm text-muted-foreground">Structure Score</p>
                      <p className="font-semibold">{results.details.headingAnalysis.nestedStructureScore}/30</p>
                    </div>
                    <div className="bg-muted/40 p-3 rounded">
                      <p className="text-sm text-muted-foreground">Keywords in Headings</p>
                      <p className="font-semibold">{results.details.headingAnalysis.keywordInHeadings}%</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Schema Details */}
              {results.details.schemaDetails && (
                <div>
                  <h4 className="font-medium text-lg mb-2">Schema Markup</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/40 p-3 rounded">
                      <p className="text-sm text-muted-foreground">Detected Types</p>
                      <p className="font-semibold">
                        {results.details.schemaDetails.types.length > 0 
                          ? results.details.schemaDetails.types.join(', ') 
                          : 'None detected'}
                      </p>
                    </div>
                    <div className="bg-muted/40 p-3 rounded">
                      <p className="text-sm text-muted-foreground">Completeness</p>
                      <p className="font-semibold">{results.details.schemaDetails.completeness}%</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Content Stats */}
              <div>
                <h4 className="font-medium text-lg mb-2">Content Statistics</h4>
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
                    <p className="text-sm text-muted-foreground">Images</p>
                    <p className="font-semibold">{results.details.imageCount}</p>
                  </div>
                  <div className="bg-muted/40 p-3 rounded">
                    <p className="text-sm text-muted-foreground">Alt Text Coverage</p>
                    <p className="font-semibold">{results.details.imageAltTextRate}%</p>
                  </div>
                </div>
              </div>
              
              {/* Content Structure */}
              {results.details.paragraphCount !== undefined && (
                <div>
                  <h4 className="font-medium text-lg mb-2">Content Structure</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted/40 p-3 rounded">
                      <p className="text-sm text-muted-foreground">Paragraphs</p>
                      <p className="font-semibold">{results.details.paragraphCount}</p>
                    </div>
                    <div className="bg-muted/40 p-3 rounded">
                      <p className="text-sm text-muted-foreground">Lists & Tables</p>
                      <p className="font-semibold">{results.details.listsAndTables || 0}</p>
                    </div>
                    <div className="bg-muted/40 p-3 rounded">
                      <p className="text-sm text-muted-foreground">FAQs</p>
                      <p className="font-semibold">{results.details.faqCount || 0}</p>
                    </div>
                    <div className="bg-muted/40 p-3 rounded">
                      <p className="text-sm text-muted-foreground">Content/Code Ratio</p>
                      <p className="font-semibold">{Math.round((results.details.contentToCodeRatio || 0) * 100)}%</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Keywords */}
              {results.details.keywordsFound && results.details.keywordsFound.length > 0 && (
                <div>
                  <h4 className="font-medium text-lg mb-2">Detected Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.details.keywordsFound.slice(0, 10).map((keyword, index) => (
                      <div key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {keyword}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <ReportCard 
          title="Recommendations"
          recommendations={results.recommendations}
        />

        {/* AI-Powered Recommendations Section */}
        {results.aiRecommendations && results.aiRecommendations.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">AI-Powered Recommendations</h2>
            <div className="space-y-6">
              {results.aiRecommendations.map((rec, idx) => (
                <div key={idx} className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{rec.title}</h3>
                    {rec.priority && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
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
          </div>
        )}

        {/* Quick Wins Section */}
        {results.quickWins && results.quickWins.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">🚀 Quick Wins</h2>
            <p className="text-muted-foreground mb-6">
              Simple actions you can take right now to improve your AI search visibility
            </p>
            <div className="grid gap-4">
              {results.quickWins.map((win, idx) => (
                <div key={idx} className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-800 mb-2">{win.action}</h3>
                      <p className="text-green-700 text-sm mb-2">{win.impact}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                      win.effort === 'low' ? 'bg-green-100 text-green-800' :
                      win.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {win.effort} effort
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* AI Analysis Details Section */}
        {results.details?.aiAnalysis && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Detailed AI Analysis</h2>
            
            <div className="space-y-6">
              {/* Content Clarity */}
              {results.details.aiAnalysis.content_clarity && (
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Content Clarity & Structure</h3>
                    <span className="text-lg font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                      {results.details.aiAnalysis.content_clarity.score}/10
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Key Observations:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {results.details.aiAnalysis.content_clarity.observations.map((obs, i) => (
                        <li key={i}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {results.details.aiAnalysis.content_clarity.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Semantic Relevance */}
              {results.details.aiAnalysis.semantic_relevance && (
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Semantic Relevance</h3>
                    <span className="text-lg font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                      {results.details.aiAnalysis.semantic_relevance.score}/10
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Key Observations:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {results.details.aiAnalysis.semantic_relevance.observations.map((obs, i) => (
                        <li key={i}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {results.details.aiAnalysis.semantic_relevance.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Entity Recognition */}
              {results.details.aiAnalysis.entity_recognition && (
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Entity Recognition</h3>
                    <span className="text-lg font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                      {results.details.aiAnalysis.entity_recognition.score}/10
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Key Observations:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {results.details.aiAnalysis.entity_recognition.observations.map((obs, i) => (
                        <li key={i}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {results.details.aiAnalysis.entity_recognition.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Information Completeness */}
              {results.details.aiAnalysis.information_completeness && (
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Information Completeness</h3>
                    <span className="text-lg font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                      {results.details.aiAnalysis.information_completeness.score}/10
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Key Observations:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {results.details.aiAnalysis.information_completeness.observations.map((obs, i) => (
                        <li key={i}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {results.details.aiAnalysis.information_completeness.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Factual Accuracy */}
              {results.details.aiAnalysis.factual_accuracy && (
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Factual Accuracy & Authority</h3>
                    <span className="text-lg font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                      {results.details.aiAnalysis.factual_accuracy.score}/10
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Key Observations:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {results.details.aiAnalysis.factual_accuracy.observations.map((obs, i) => (
                        <li key={i}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {results.details.aiAnalysis.factual_accuracy.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-muted/50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Page Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
            <div>
              <p className="text-muted-foreground text-sm">Word Count</p>
              <p className="text-xl font-semibold">{results.details?.wordCount || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Headings</p>
              <p className="text-xl font-semibold">{results.details?.headingCount || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Images</p>
              <p className="text-xl font-semibold">{results.details?.imageCount || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Paragraphs</p>
              <p className="text-xl font-semibold">{results.details?.paragraphCount || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Lists & Tables</p>
              <p className="text-xl font-semibold">{results.details?.listsAndTables || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">FAQs</p>
              <p className="text-xl font-semibold">{results.details?.faqCount || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Schema</p>
              <p className="text-xl font-semibold">{results.details?.hasSchema ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Content/Code Ratio</p>
              <p className="text-xl font-semibold">{(results.details?.contentToCodeRatio || 0) * 100}%</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Img Alt Text</p>
              <p className="text-xl font-semibold">{results.details?.imageAltTextRate || 0}%</p>
            </div>
          </div>
        </div>

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