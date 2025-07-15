import { NextRequest, NextResponse } from 'next/server';

interface CompareRequest {
  brandA: string;
  brandB: string;
  industry: string;
}

interface ComparisonResult {
  brandA: {
    name: string;
    strengths: string[];
    weaknesses: string[];
  };
  brandB: {
    name: string;
    strengths: string[];
    weaknesses: string[];
  };
  verdict: {
    winner: string;
    reasoning: string;
    recommendation: string;
  };
  generatedAt: string;
}

// Mock data for development/fallback
const generateMockComparison = (brandA: string, brandB: string, industry: string): ComparisonResult => {
  return {
    brandA: {
      name: brandA,
      strengths: [
        "Strong brand recognition and loyalty",
        "Innovative product development",
        "Excellent customer service",
        "Premium quality products"
      ],
      weaknesses: [
        "Higher price point than competitors",
        "Limited market presence in some regions",
        "Slower adoption of new technologies"
      ]
    },
    brandB: {
      name: brandB,
      strengths: [
        "Competitive pricing strategy",
        "Wide market distribution",
        "Strong technical capabilities",
        "Rapid innovation cycle"
      ],
      weaknesses: [
        "Brand perception challenges",
        "Quality consistency issues",
        "Limited premium offerings",
        "Customer service gaps"
      ]
    },
    verdict: {
      winner: Math.random() > 0.5 ? brandA : brandB,
      reasoning: `Both brands have distinct advantages in the ${industry} industry. ${brandA} excels in brand strength and quality, while ${brandB} offers better value and accessibility.`,
      recommendation: `Choose ${brandA} for premium quality and brand prestige, or ${brandB} for value and wide availability. Consider your specific needs and budget.`
    },
    generatedAt: new Date().toISOString()
  };
};

// GPT-4 prompt for brand comparison
const generateComparisonPrompt = (brandA: string, brandB: string, industry: string): string => {
  return `You are a market research expert analyzing brand competition. Compare ${brandA} vs ${brandB} in the ${industry} industry.

Provide a detailed comparison in the following JSON format:

{
  "brandA": {
    "name": "${brandA}",
    "strengths": [
      "List 3-5 key strengths of ${brandA}",
      "Focus on competitive advantages",
      "Include market position, quality, innovation, etc."
    ],
    "weaknesses": [
      "List 3-4 main weaknesses or challenges",
      "Areas where competitors have advantages",
      "Market limitations or concerns"
    ]
  },
  "brandB": {
    "name": "${brandB}",
    "strengths": [
      "List 3-5 key strengths of ${brandB}",
      "Focus on competitive advantages",
      "Include market position, quality, innovation, etc."
    ],
    "weaknesses": [
      "List 3-4 main weaknesses or challenges",
      "Areas where competitors have advantages",
      "Market limitations or concerns"
    ]
  },
  "verdict": {
    "winner": "Choose ${brandA} or ${brandB} based on overall analysis",
    "reasoning": "2-3 sentence explanation of why this brand has the edge",
    "recommendation": "Practical advice for consumers choosing between these brands"
  }
}

Consider factors like:
- Market share and brand recognition
- Product quality and innovation
- Pricing and value proposition
- Customer satisfaction and reviews
- Distribution and availability
- Financial performance and stability
- Future outlook and trends

Return ONLY the JSON object, no additional text or explanations.`;
};

export async function POST(request: NextRequest) {
  try {
    const body: CompareRequest = await request.json();
    const { brandA, brandB, industry } = body;

    // Validate input
    if (!brandA || !brandB || !industry) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: brandA, brandB, and industry are required' 
        },
        { status: 400 }
      );
    }

    if (brandA.toLowerCase() === brandB.toLowerCase()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please select two different brands for comparison' 
        },
        { status: 400 }
      );
    }

    console.log(`[Compare API] Comparing ${brandA} vs ${brandB} in ${industry}`);

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.log('[Compare API] OpenAI API key not configured, using mock data');
      const mockResult = generateMockComparison(brandA, brandB, industry);
      
      return NextResponse.json({
        success: true,
        data: mockResult,
        source: 'mock'
      });
    }

    // Generate GPT-4 prompt
    const prompt = generateComparisonPrompt(brandA, brandB, industry);

    try {
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a market research expert. Always respond with valid JSON only, no additional text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const gptResponse = data.choices[0].message.content;

      // Parse GPT response
      let comparisonResult: ComparisonResult;
      try {
        comparisonResult = JSON.parse(gptResponse);
        comparisonResult.generatedAt = new Date().toISOString();
      } catch (parseError) {
        console.error('[Compare API] Failed to parse GPT response:', parseError);
        console.log('[Compare API] Raw GPT response:', gptResponse);
        
        // Fallback to mock data if parsing fails
        comparisonResult = generateMockComparison(brandA, brandB, industry);
      }

      console.log(`[Compare API] Successfully generated comparison for ${brandA} vs ${brandB}`);

      return NextResponse.json({
        success: true,
        data: comparisonResult,
        source: 'gpt'
      });

    } catch (apiError) {
      console.error('[Compare API] OpenAI API error:', apiError);
      
      // Fallback to mock data on API error
      const mockResult = generateMockComparison(brandA, brandB, industry);
      
      return NextResponse.json({
        success: true,
        data: mockResult,
        source: 'mock',
        warning: 'Used fallback data due to API error'
      });
    }

  } catch (error) {
    console.error('[Compare API] Unexpected error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again.' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Compare API endpoint. Use POST with brandA, brandB, and industry.' 
    },
    { status: 200 }
  );
} 