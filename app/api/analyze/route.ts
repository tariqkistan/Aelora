import { NextRequest, NextResponse } from 'next/server'
import { fetchContentFromUrl } from '@/lib/contentFetcher'
import { analyzeContent } from '@/lib/contentAnalyzer'

// AWS API Gateway endpoint
const AWS_API_ENDPOINT = 'https://fcfz0pijd5.execute-api.us-east-1.amazonaws.com/prod/analyze';

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
    // First try to use AWS API Gateway
    console.log(`Proxying request to AWS API Gateway for URL: ${url}`);
    
    try {
      const awsResponse = await fetch(`${AWS_API_ENDPOINT}?url=${encodeURIComponent(url)}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        // Set a reasonable timeout
        signal: AbortSignal.timeout(15000)
      });
      
      if (awsResponse.ok) {
        const data = await awsResponse.json();
        console.log('Successfully retrieved data from AWS API');
        return NextResponse.json(data);
      } else {
        console.warn(`AWS API returned status ${awsResponse.status}, falling back to local implementation`);
      }
    } catch (awsError) {
      console.warn('Error calling AWS API, falling back to local implementation:', awsError);
    }
    
    // If AWS API fails, fall back to local implementation
    console.log('Using local implementation for analysis');
    
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