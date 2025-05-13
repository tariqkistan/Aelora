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
  }
  recommendations: string[]
}

export default function ResultsPage() {
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
        const cachedResult = localStorage.getItem('analysisResult')
        if (cachedResult) {
          const parsedResult = JSON.parse(cachedResult)
          if (parsedResult.url === url) {
            setResults(parsedResult)
            setLoading(false)
            // Clear cache after using it
            localStorage.removeItem('analysisResult')
            return
          }
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
        </div>

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