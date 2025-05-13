import { NextRequest, NextResponse } from 'next/server'
import { fetchContentFromUrl } from '@/lib/contentFetcher'
import { analyzeContent } from '@/lib/contentAnalyzer'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

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
        { error: 'Failed to fetch content from URL' },
        { status: 404 }
      )
    }

    // Analyze the content
    const analysisResult = await analyzeContent(content, url)

    // Return the analysis results
    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error('Error analyzing content:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
} 