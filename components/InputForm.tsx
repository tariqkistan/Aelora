"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { analyzeUrl } from "@/lib/apiClient"

export default function InputForm() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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