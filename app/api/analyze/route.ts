import { NextRequest, NextResponse } from 'next/server'
import { fetchContentFromUrl } from '@/lib/contentFetcher'
import { analyzeContent } from '@/lib/contentAnalyzer'

// AWS API Gateway endpoint
const AWS_API_ENDPOINT = 'https://fcfz0pijd5.execute-api.us-east-1.amazonaws.com/prod/analyze';

// Mock data for fallback when analysis fails
function generateFallbackAnalysis(url: string) {
  return {
    url,
    timestamp: new Date().toISOString(),
    scores: {
      readability: 75,
      schema: 60,
      questionAnswerMatch: 70,
      headingsStructure: 80,
      overallScore: 71,
      contentDepth: 65,
      keywordOptimization: 70,
      aiAnalysisScore: 68
    },
    recommendations: [
      "Unable to fully analyze the website due to technical limitations",
      "The website may have anti-bot protection or be slow to respond",
      "Try analyzing a specific page rather than the homepage",
      "Ensure the URL is publicly accessible and not behind authentication"
    ],
    aiRecommendations: [
      {
        title: "Analysis Limitation Notice",
        description: "We encountered difficulties analyzing this website",
        rationale: "The website may have protection mechanisms or be experiencing high load",
        example: "Try analyzing a specific blog post or product page instead",
        expected_impact: "Better analysis results with more accessible pages",
        priority: 'medium' as const
      }
    ],
    quickWins: [
      {
        action: "Try a different page from the same website",
        impact: "May provide better analysis results",
        effort: 'low' as const
      },
      {
        action: "Check if the website is publicly accessible",
        impact: "Ensures our analysis tools can reach the content",
        effort: 'low' as const
      }
    ],
    performance: {
      fetchTimeMs: 0,
      analysisTimeMs: 0,
      totalTimeMs: 0,
      status: 'fallback'
    },
    source: 'fallback'
  };
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  const startTime = Date.now()

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    )
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid URL format. Please provide a valid HTTP or HTTPS URL.' },
      { status: 400 }
    );
  }

  console.log(`[Analyze API] Starting analysis for: ${url}`);

  try {
    // First try to use AWS API Gateway with shorter timeout
    console.log(`[Analyze API] Attempting AWS API Gateway for URL: ${url}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout for AWS API
      
      const awsResponse = await fetch(`${AWS_API_ENDPOINT}?url=${encodeURIComponent(url)}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (awsResponse.ok) {
        const data = await awsResponse.json();
        console.log(`[Analyze API] AWS API success in ${Date.now() - startTime}ms`);
        return NextResponse.json(data);
      } else {
        console.warn(`[Analyze API] AWS API returned status ${awsResponse.status}, falling back to local implementation`);
      }
    } catch (awsError) {
      if (awsError instanceof Error && awsError.name === 'AbortError') {
        console.warn('[Analyze API] AWS API timeout, falling back to local implementation');
      } else {
        console.warn('[Analyze API] AWS API error, falling back to local implementation:', awsError);
      }
    }
    
    // If AWS API fails, fall back to local implementation
    console.log('[Analyze API] Using local implementation for analysis');
    
    let content = null;
    let fetchError = null;
    
    try {
      // Fetch content from the URL with timeout handling
      content = await fetchContentFromUrl(url);
    } catch (error) {
      fetchError = error;
      console.error('[Analyze API] Content fetch failed:', error);
    }
    
    if (!content) {
      // If content fetching failed, return a helpful fallback response
      console.log('[Analyze API] Returning fallback analysis due to fetch failure');
      
      const fallbackResponse = generateFallbackAnalysis(url);
      fallbackResponse.performance.totalTimeMs = Date.now() - startTime;
      
      // Include the original error in the response for debugging
      if (fetchError instanceof Error) {
        fallbackResponse.recommendations.unshift(`Fetch error: ${fetchError.message}`);
      }
      
      return NextResponse.json(fallbackResponse);
    }

    // Add processing time information
    const fetchTime = Date.now() - startTime;
    console.log(`[Analyze API] Content fetch completed in ${fetchTime}ms`);

    let analysisResult;
    try {
      // Analyze the content
      analysisResult = await analyzeContent(content, url);
    } catch (analysisError) {
      console.error('[Analyze API] Content analysis failed:', analysisError);
      
      // Return fallback with the content we did manage to fetch
      const fallbackResponse = generateFallbackAnalysis(url);
      fallbackResponse.performance.fetchTimeMs = fetchTime;
      fallbackResponse.performance.totalTimeMs = Date.now() - startTime;
      
      if (analysisError instanceof Error) {
        fallbackResponse.recommendations.unshift(`Analysis error: ${analysisError.message}`);
      }
      
      return NextResponse.json(fallbackResponse);
    }
    
    // Calculate total processing time
    const totalTime = Date.now() - startTime;
    console.log(`[Analyze API] Analysis completed successfully in ${totalTime}ms`);

    // Return the analysis results with timing info
    return NextResponse.json({
      ...analysisResult,
      performance: {
        fetchTimeMs: fetchTime,
        analysisTimeMs: totalTime - fetchTime,
        totalTimeMs: totalTime,
        status: 'success'
      },
      source: 'local'
    });
    
  } catch (error) {
    console.error('[Analyze API] Unexpected error:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const totalTime = Date.now() - startTime;
    
    // Return fallback response even for unexpected errors
    const fallbackResponse = generateFallbackAnalysis(url);
    fallbackResponse.performance.totalTimeMs = totalTime;
    fallbackResponse.recommendations.unshift(`System error: ${errorMessage}`);
    
    // Return fallback instead of error to provide some value to the user
    return NextResponse.json(fallbackResponse);
  }
} 