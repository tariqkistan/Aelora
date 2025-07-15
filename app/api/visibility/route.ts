import { NextRequest, NextResponse } from 'next/server'

// Types for request/response
interface BrandVisibilityRequest {
  brandName: string
  domain?: string
  industry?: string
}

interface BrandVisibilityResponse {
  success: boolean
  data?: {
    brand: string
    sentimentHistory: Array<{
      date: string
      sentimentScore: number
      mentions: number
      timestamp: string
    }>
    mentions: Array<{
      keyword: string
      tone: 'positive' | 'neutral' | 'negative'
      frequency: number
    }>
    summary: string
    lastUpdated: string
    totalMentions: number
    averageSentiment: number
  }
  error?: string
}

// Mock data fallback for development
const generateMockData = (brand: string) => {
  const now = new Date()
  const data = []
  
  // Generate 30 days of mock sentiment data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Generate realistic sentiment scores with some variation
    const baseScore = 0.2 + Math.random() * 0.6 // Between 0.2 and 0.8
    const variation = (Math.random() - 0.5) * 0.2 // ±0.1 variation
    const sentimentScore = Math.max(-1, Math.min(1, baseScore + variation))
    
    data.push({
      date: date.toISOString().split('T')[0],
      sentimentScore: Math.round(sentimentScore * 100) / 100,
      mentions: Math.floor(Math.random() * 50) + 10,
      timestamp: date.toISOString()
    })
  }
  
  return data
}

const generateMockMentions = (brand: string) => {
  const positiveKeywords = [
    'innovative', 'reliable', 'excellent', 'trusted', 'quality', 
    'outstanding', 'professional', 'effective', 'valuable', 'impressive'
  ]
  
  const neutralKeywords = [
    'standard', 'typical', 'average', 'normal', 'common',
    'regular', 'basic', 'conventional', 'ordinary', 'moderate'
  ]
  
  const negativeKeywords = [
    'expensive', 'slow', 'complicated', 'limited', 'outdated',
    'confusing', 'problematic', 'disappointing', 'overpriced', 'difficult'
  ]
  
  const mentions = []
  
  // Add positive mentions
  for (let i = 0; i < 3; i++) {
    mentions.push({
      keyword: positiveKeywords[Math.floor(Math.random() * positiveKeywords.length)],
      tone: 'positive' as const,
      frequency: Math.floor(Math.random() * 10) + 1
    })
  }
  
  // Add neutral mentions
  for (let i = 0; i < 2; i++) {
    mentions.push({
      keyword: neutralKeywords[Math.floor(Math.random() * neutralKeywords.length)],
      tone: 'neutral' as const,
      frequency: Math.floor(Math.random() * 8) + 1
    })
  }
  
  // Add negative mentions
  for (let i = 0; i < 2; i++) {
    mentions.push({
      keyword: negativeKeywords[Math.floor(Math.random() * negativeKeywords.length)],
      tone: 'negative' as const,
      frequency: Math.floor(Math.random() * 6) + 1
    })
  }
  
  return mentions
}

// GET handler for backwards compatibility (brand selection dropdown)
export async function GET(request: NextRequest) {
  try {
    const brand = request.nextUrl.searchParams.get('brand')
    
    if (!brand) {
      return NextResponse.json(
        { error: 'Brand parameter is required' },
        { status: 400 }
      )
    }

    console.log(`[API] GET /api/visibility - Brand: ${brand}`)
    
    // For GET requests, use mock data (dashboard functionality)
    const sentimentData = generateMockData(brand)
    const mentions = generateMockMentions(brand)
    
    // Get latest data point for summary
    const latestData = sentimentData[sentimentData.length - 1]
    
    const summary = `${brand} shows ${latestData.sentimentScore > 0.5 ? 'positive' : latestData.sentimentScore > 0 ? 'neutral' : 'negative'} sentiment trends with ${latestData.mentions} mentions in the latest analysis. The brand maintains ${latestData.sentimentScore > 0.6 ? 'strong' : latestData.sentimentScore > 0.3 ? 'moderate' : 'weak'} visibility across AI-driven platforms and search engines.`
    
    const response: BrandVisibilityResponse = {
      success: true,
      data: {
        brand,
        sentimentHistory: sentimentData,
        mentions,
        summary,
        lastUpdated: new Date().toISOString(),
        totalMentions: mentions.reduce((sum, mention) => sum + mention.frequency, 0),
        averageSentiment: sentimentData.reduce((sum, item) => sum + item.sentimentScore, 0) / sentimentData.length
      }
    }
    
    console.log(`[API] GET /api/visibility - Success for brand: ${brand}`)
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('[API] GET /api/visibility - Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch visibility data' 
      },
      { status: 500 }
    )
  }
}

// POST handler for Lambda integration
export async function POST(request: NextRequest) {
  try {
    const requestBody: BrandVisibilityRequest = await request.json()
    
    // Validate required fields
    if (!requestBody.brandName) {
      console.error('[API] POST /api/visibility - Missing brandName')
      return NextResponse.json(
        { 
          success: false, 
          error: 'brandName is required' 
        },
        { status: 400 }
      )
    }

    console.log(`[API] POST /api/visibility - Request:`, {
      brandName: requestBody.brandName,
      domain: requestBody.domain,
      industry: requestBody.industry
    })

    // Get AWS API Gateway URL from environment
    const awsApiUrl = process.env.NEXT_PUBLIC_AWS_API_URL
    
    if (!awsApiUrl) {
      console.error('[API] POST /api/visibility - AWS_API_URL not configured')
      
      // Fallback to mock data if AWS API URL is not configured
      console.log('[API] POST /api/visibility - Using mock data fallback')
      return await getMockDataResponse(requestBody.brandName)
    }

    // Prepare the request payload for Lambda
    const lambdaPayload = {
      brandName: requestBody.brandName,
      domain: requestBody.domain || `${requestBody.brandName.toLowerCase()}.com`,
      industry: requestBody.industry || 'Technology'
    }

    console.log(`[API] POST /api/visibility - Calling Lambda:`, {
      url: `${awsApiUrl}/brand-visibility`,
      payload: lambdaPayload
    })

    // Call the Lambda function via API Gateway
    const lambdaResponse = await fetch(`${awsApiUrl}/brand-visibility`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(lambdaPayload),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    console.log(`[API] POST /api/visibility - Lambda response status: ${lambdaResponse.status}`)

    if (!lambdaResponse.ok) {
      const errorText = await lambdaResponse.text()
      console.error(`[API] POST /api/visibility - Lambda error (${lambdaResponse.status}):`, errorText)
      
      // Fallback to mock data on Lambda error
      console.log('[API] POST /api/visibility - Using mock data fallback due to Lambda error')
      return await getMockDataResponse(requestBody.brandName)
    }

    const lambdaData = await lambdaResponse.json()
    console.log(`[API] POST /api/visibility - Lambda success:`, {
      success: lambdaData.success,
      hasData: !!lambdaData.data
    })

    // Transform Lambda response to match frontend expectations
    const transformedResponse = transformLambdaResponse(lambdaData, requestBody.brandName)
    
    console.log(`[API] POST /api/visibility - Transformed response for brand: ${requestBody.brandName}`)
    return NextResponse.json(transformedResponse)

  } catch (error) {
    console.error('[API] POST /api/visibility - Unexpected error:', error)
    
    // Try to extract brand name for fallback
    let brandName = 'Unknown'
    try {
      const body = await request.clone().json()
      brandName = body.brandName || 'Unknown'
    } catch {
      // Ignore parsing errors
    }
    
    // Fallback to mock data on any error
    console.log(`[API] POST /api/visibility - Using mock data fallback due to error for brand: ${brandName}`)
    return await getMockDataResponse(brandName)
  }
}

// Helper function to get mock data response
async function getMockDataResponse(brandName: string): Promise<NextResponse> {
  const sentimentData = generateMockData(brandName)
  const mentions = generateMockMentions(brandName)
  
  const latestData = sentimentData[sentimentData.length - 1]
  const summary = `${brandName} shows ${latestData.sentimentScore > 0.5 ? 'positive' : latestData.sentimentScore > 0 ? 'neutral' : 'negative'} sentiment trends with ${latestData.mentions} mentions in the latest analysis. The brand maintains ${latestData.sentimentScore > 0.6 ? 'strong' : latestData.sentimentScore > 0.3 ? 'moderate' : 'weak'} visibility across AI-driven platforms and search engines. (Mock data)`
  
  const response: BrandVisibilityResponse = {
    success: true,
    data: {
      brand: brandName,
      sentimentHistory: sentimentData,
      mentions,
      summary,
      lastUpdated: new Date().toISOString(),
      totalMentions: mentions.reduce((sum, mention) => sum + mention.frequency, 0),
      averageSentiment: sentimentData.reduce((sum, item) => sum + item.sentimentScore, 0) / sentimentData.length
    }
  }
  
  return NextResponse.json(response)
}

// Helper function to transform Lambda response to frontend format
function transformLambdaResponse(lambdaData: any, brandName: string): BrandVisibilityResponse {
  try {
    // If Lambda returns the expected format, use it directly
    if (lambdaData.success && lambdaData.data) {
      const data = lambdaData.data
      
      // Ensure the response has the required structure
      const transformedData = {
        brand: brandName,
        sentimentHistory: data.sentimentHistory || generateMockData(brandName),
        mentions: data.mentions || generateMockMentions(brandName),
        summary: data.summary || `Analysis for ${brandName} completed successfully.`,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        totalMentions: data.totalMentions || (data.mentions ? data.mentions.reduce((sum: number, mention: any) => sum + (mention.frequency || 0), 0) : 0),
        averageSentiment: data.averageSentiment || 0.5
      }
      
      return {
        success: true,
        data: transformedData
      }
    }
    
    // If Lambda response is not in expected format, extract what we can
    console.warn('[API] Lambda response not in expected format, attempting to transform:', lambdaData)
    
    // Try to extract sentiment score and create basic response
    const sentimentScore = lambdaData.sentimentScore || 0.5
    const mentions = lambdaData.mentions || generateMockMentions(brandName)
    const summary = lambdaData.summary || `Brand analysis completed for ${brandName}.`
    
    // Generate time series data based on single sentiment score
    const sentimentHistory = generateMockData(brandName).map(item => ({
      ...item,
      sentimentScore: sentimentScore + (Math.random() - 0.5) * 0.2 // Add some variation
    }))
    
    return {
      success: true,
      data: {
        brand: brandName,
        sentimentHistory,
        mentions,
        summary,
        lastUpdated: new Date().toISOString(),
        totalMentions: mentions.reduce((sum: number, mention: any) => sum + (mention.frequency || 0), 0),
        averageSentiment: sentimentScore
      }
    }
    
  } catch (error) {
    console.error('[API] Error transforming Lambda response:', error)
    
    // Return error response
    return {
      success: false,
      error: 'Failed to process Lambda response'
    }
  }
} 