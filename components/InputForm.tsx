"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { analyzeUrl, configureApiClient } from "@/lib/apiClient"

export default function InputForm() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Always use AWS API directly
  useEffect(() => {
    configureApiClient({ useDirectApi: true })
  }, [])

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
      
      // Redirect to the results page with the URL
      router.push(`/results?url=${encodeURIComponent(formattedUrl)}`)
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