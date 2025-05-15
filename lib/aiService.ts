import { OpenRouterClient } from 'openrouter-sdk';

// Initialize OpenRouter client
const client = new OpenRouterClient({
  // API key will be loaded from environment variables
  apiKey: process.env.OPENROUTER_API_KEY || '',
  // Identify your application
  applicationId: 'Aelora',
  defaultModel: 'anthropic/claude-3-sonnet-20240229',
});

/**
 * Analyze text content and provide AI insights
 */
export async function analyzeContentWithAI(content: string, url: string): Promise<any> {
  try {
    const prompt = `
    You are an expert in AI search engine optimization. Analyze the following website content 
    from ${url} and provide insights on how it could be improved for AI search engines.
    
    Focus on these key areas:
    1. Content clarity and structure
    2. Semantic relevance to likely search intent
    3. Entity recognition and contextual understanding
    4. Information completeness
    5. Factual accuracy and authority
    
    For each area, provide:
    - A score from 1-10
    - Key observations
    - Specific, actionable recommendations
    
    Format your response as JSON with this structure:
    {
      "overall_score": number,
      "areas": {
        "content_clarity": {
          "score": number,
          "observations": string[],
          "recommendations": string[]
        },
        "semantic_relevance": {
          "score": number,
          "observations": string[],
          "recommendations": string[]
        },
        "entity_recognition": {
          "score": number,
          "observations": string[],
          "recommendations": string[]
        },
        "information_completeness": {
          "score": number,
          "observations": string[],
          "recommendations": string[]
        },
        "factual_accuracy": {
          "score": number,
          "observations": string[],
          "recommendations": string[]
        }
      },
      "priority_actions": string[]
    }
    
    Website content:
    ${content.substring(0, 15000)} // Limit content length
    `;

    const response = await client.chat({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2, // Lower temperature for more consistent results
      format: 'json', // Request JSON format
    });

    // Parse the response
    const responseText = response.choices[0]?.message.content || '';
    try {
      // Try to parse as JSON
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fall back to returning the raw text
      return {
        raw_response: responseText,
        error: 'Failed to parse structured data'
      };
    }
  } catch (error) {
    console.error('Error in AI content analysis:', error);
    throw error;
  }
}

/**
 * Generate improvement suggestions based on content analysis
 */
export async function generateSuggestions(analysisResult: any, content: string, url: string): Promise<any> {
  try {
    const prompt = `
    Based on this analysis of the website at ${url}, generate 5 specific, high-impact improvements 
    that would most improve the content's visibility to AI search engines.
    
    Analysis results:
    ${JSON.stringify(analysisResult)}
    
    For each suggestion:
    1. Describe the specific change
    2. Explain why it would help
    3. Provide an example implementation
    
    Format your response as JSON with this structure:
    {
      "suggestions": [
        {
          "title": string,
          "description": string,
          "rationale": string,
          "example": string,
          "expected_impact": string
        }
      ]
    }
    `;

    const response = await client.chat({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      format: 'json',
    });

    // Parse the response
    const responseText = response.choices[0]?.message.content || '';
    try {
      // Try to parse as JSON
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI suggestions as JSON:', parseError);
      // Fall back to returning the raw text
      return {
        raw_response: responseText,
        error: 'Failed to parse structured data'
      };
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    throw error;
  }
} 