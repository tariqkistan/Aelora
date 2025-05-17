"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { analyzeUrl, configureApiClient } from "@/lib/apiClient"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function InputForm() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useDirectApi, setUseDirectApi] = useState(false)
  const router = useRouter()

  // Configure API client when direct API toggle changes
  const handleApiToggle = (checked: boolean) => {
    setUseDirectApi(checked)
    configureApiClient({ useDirectApi: checked })
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
      
      // For MVP, we'll just redirect to the results page with the URL
      // In the production version, we could call the API directly here
      // and only redirect after getting a response
      router.push(`/results?url=${encodeURIComponent(formattedUrl)}`)
      
      // Alternatively, to call the API directly:
      // try {
      //   const result = await analyzeUrl(formattedUrl);
      //   // Store result in local storage or context
      //   localStorage.setItem('analysisResult', JSON.stringify(result));
      //   router.push(`/results?url=${encodeURIComponent(formattedUrl)}`);
      // } catch (apiError) {
      //   setError("Error analyzing URL. Please try again.");
      //   setIsLoading(false);
      // }
    } catch (err) {
      setError("Please enter a valid URL")
      setIsLoading(false)
    }
  }

  return (
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
      
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-direct-api"
                  checked={useDirectApi}
                  onCheckedChange={handleApiToggle}
                  disabled={isLoading}
                />
                <Label htmlFor="use-direct-api" className="text-sm cursor-pointer">
                  Use AWS API directly
                </Label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[200px]">
                Toggle between using the Next.js API proxy (default) or making direct calls to the AWS API Gateway
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Analyze Website"}
      </Button>
    </form>
  )
} 