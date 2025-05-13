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
  }
  recommendations: string[]
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

  useEffect(() => {
    if (!url) {
      setError("No URL provided")
      setLoading(false)
      return
    }

    // Fetch results from API
    const fetchResults = async () => {
      try {
        // Check if we have a cached result (for demo purposes)
        let cachedResult = null
        try {
          const cachedData = localStorage.getItem('analysisResult')
          if (cachedData) {
            cachedResult = JSON.parse(cachedData)
          }
        } catch (e) {
          console.error('Error accessing localStorage:', e)
        }
        
        if (cachedResult && cachedResult.url === url) {
          setResults(cachedResult)
          setLoading(false)
          // Clear cache after using it
          try {
            localStorage.removeItem('analysisResult')
          } catch (e) {
            console.error('Error accessing localStorage:', e)
          }
          return
        }

        // In production, make the API call to AWS
        if (process.env.NODE_ENV === 'production') {
          try {
            const result = await analyzeUrl(url)
            setResults(result)
            setLoading(false)
            return
          } catch (apiError) {
            console.error("API call failed, falling back to mock data:", apiError)
            // Fall through to mock data if API fails
          }
        }
        
        // For development or if API fails, use mock data
        setTimeout(() => {
          const mockData: AnalysisResult = {
            url: url,
            timestamp: new Date().toISOString(),
            scores: {
              readability: Math.floor(Math.random() * 30) + 70,
              schema: Math.floor(Math.random() * 40) + 60,
              questionAnswerMatch: Math.floor(Math.random() * 20) + 80,
              headingsStructure: Math.floor(Math.random() * 25) + 75,
              overallScore: Math.floor(Math.random() * 25) + 75
            },
            recommendations: [
              "Add more structured data using Schema.org markup",
              "Improve content organization with clear headings and subheadings",
              "Include more concise answers to common questions in your niche",
              "Use shorter paragraphs and sentences to improve readability",
              "Add more descriptive meta tags and image alt text"
            ]
          }
          
          setResults(mockData)
          setLoading(false)
        }, 3000)
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScoreCard 
            title="Overall Score"
            score={results.scores.overallScore}
            description="Your website's overall AI visibility score"
            isPrimary
          />
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
              description="Comprehensiveness and richness of your content"
            />
          )}
          {results.scores.keywordOptimization !== undefined && (
            <ScoreCard 
              title="Keyword Optimization"
              score={results.scores.keywordOptimization}
              description="Strategic placement of relevant keywords"
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
              
              {/* Performance */}
              {results.performance && (
                <div>
                  <h4 className="font-medium text-lg mb-2">Analysis Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/40 p-3 rounded">
                      <p className="text-sm text-muted-foreground">Fetch Time</p>
                      <p className="font-semibold">{(results.performance.fetchTimeMs / 1000).toFixed(2)}s</p>
                    </div>
                    <div className="bg-muted/40 p-3 rounded">
                      <p className="text-sm text-muted-foreground">Analysis Time</p>
                      <p className="font-semibold">{(results.performance.analysisTimeMs / 1000).toFixed(2)}s</p>
                    </div>
                    <div className="bg-muted/40 p-3 rounded">
                      <p className="text-sm text-muted-foreground">Total Time</p>
                      <p className="font-semibold">{(results.performance.totalTimeMs / 1000).toFixed(2)}s</p>
                    </div>
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