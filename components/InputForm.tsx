"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { analyzeUrl, configureApiClient } from "@/lib/apiClient"
import BusinessQuestionnaire, { BusinessInfo } from "./BusinessQuestionnaire"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Globe, ArrowRight } from "lucide-react"

export default function InputForm() {
  const [step, setStep] = useState<'questionnaire' | 'url' | 'analyzing'>('questionnaire')
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Always use AWS API directly
  useEffect(() => {
    configureApiClient({ useDirectApi: true })
  }, [])

  const handleBusinessInfoComplete = (info: BusinessInfo) => {
    setBusinessInfo(info)
    setUrl(info.website) // Pre-fill URL from business info
    setStep('url')
  }

  const handleSkipQuestionnaire = () => {
    setStep('url')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Basic URL validation
    if (!url) {
      setError("Please enter a URL")
      return
    }
    
    let formattedUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = `https://${url}`
    }
    
    try {
      const urlObj = new URL(formattedUrl)
      setIsLoading(true)
      
      // Build query parameters with business info
      const queryParams = new URLSearchParams({ url: formattedUrl })
      
      if (businessInfo) {
        // Add business context to the query
        queryParams.append('businessContext', JSON.stringify({
          companyName: businessInfo.companyName,
          industry: businessInfo.industry,
          companySize: businessInfo.companySize,
          primaryLocation: businessInfo.primaryLocation,
          country: businessInfo.country,
          targetMarkets: businessInfo.targetMarkets,
          businessModel: businessInfo.businessModel,
          targetAudience: businessInfo.targetAudience,
          priceRange: businessInfo.priceRange,
          mainCompetitors: businessInfo.mainCompetitors,
          primaryGoals: businessInfo.primaryGoals,
          currentChallenges: businessInfo.currentChallenges,
          brandPersonality: businessInfo.brandPersonality,
          additionalInfo: businessInfo.additionalInfo
        }))
      }
      
      // Redirect to the results page with the URL and business context
      router.push(`/results?${queryParams.toString()}`)
    } catch (err) {
      setError("Please enter a valid URL")
      setIsLoading(false)
    }
  }

  const handleEditBusinessInfo = () => {
    setStep('questionnaire')
  }

  if (step === 'questionnaire') {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <BusinessQuestionnaire
          onComplete={handleBusinessInfoComplete}
          onSkip={handleSkipQuestionnaire}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Business Info Summary (if provided) */}
      {businessInfo && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Business Context Added</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleEditBusinessInfo}>
                Edit
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-blue-700">Company:</span>
                <span className="font-medium">{businessInfo.companyName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-700">Industry:</span>
                <span className="font-medium">{businessInfo.industry}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-700">Location:</span>
                <span className="font-medium">{businessInfo.primaryLocation}, {businessInfo.country}</span>
              </div>
              {businessInfo.targetAudience && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-700">Audience:</span>
                  <span className="font-medium">{businessInfo.targetAudience.slice(0, 50)}...</span>
                </div>
              )}
            </div>
            <div className="mt-3 p-2 bg-blue-100 rounded-md">
              <p className="text-xs text-blue-800">
                ✨ This context will help provide more relevant AI analysis and recommendations
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* URL Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {businessInfo 
              ? "Confirm your website URL to begin analysis"
              : "Enter your website URL to analyze"
            }
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter website URL (e.g., example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : (
                <>
                  Analyze Website
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Skip Business Info Option */}
      {!businessInfo && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Want better analysis results?
          </p>
          <Button variant="outline" size="sm" onClick={() => setStep('questionnaire')}>
            <Building2 className="h-4 w-4 mr-2" />
            Add Business Context
          </Button>
        </div>
      )}
    </div>
  )
} 