import { NextRequest, NextResponse } from 'next/server'
import { fetchContentFromUrl } from '@/lib/contentFetcher'
import { analyzeContent } from '@/lib/contentAnalyzer'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  const startTime = Date.now()

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Fetch content from the URL
    const content = await fetchContentFromUrl(url)
    
    if (!content) {
      return NextResponse.json(
        { error: 'Failed to fetch content from URL', url },
        { status: 404 }
      )
    }

    // Add processing time information
    const fetchTime = Date.now() - startTime

    // Analyze the content
    const analysisResult = await analyzeContent(content, url)
    
    // Calculate total processing time
    const totalTime = Date.now() - startTime

    // Return the analysis results with timing info
    return NextResponse.json({
      ...analysisResult,
      performance: {
        fetchTimeMs: fetchTime,
        analysisTimeMs: totalTime - fetchTime,
        totalTimeMs: totalTime
      }
    })
  } catch (error) {
    console.error('Error analyzing content:', error)
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze content', 
        message: errorMessage,
        url 
      },
      { status: 500 }
    )
  }
} 