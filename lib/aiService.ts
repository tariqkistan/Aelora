import OpenAI from 'openai';

// Configuration for OpenRouter
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Default model to use - Claude 3 Sonnet is a good balance of speed and quality
const DEFAULT_MODEL = 'anthropic/claude-3-sonnet@20240229';

// Configure OpenAI client to use OpenRouter - only if API key is available
const openai = typeof window === 'undefined' && OPENROUTER_API_KEY ? new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: OPENROUTER_BASE_URL,
  defaultHeaders: {
    'HTTP-Referer': 'https://aelora-xi.vercel.app', // Replace with your site URL
    'X-Title': 'Aelora - AI Visibility Analyzer'
  }
}) : null;

/**
 * Analyze content using an AI model for AI search optimization recommendations
 * @param content The website content to analyze
 * @param url The URL of the website being analyzed
 */
export async function analyzeContentWithAI(contentHtml: string, url: string): Promise<any> {
  try {
    // If OpenAI client is not initialized, throw an error
    if (!openai) {
      throw new Error('OpenAI client not initialized - OPENROUTER_API_KEY may be missing');
    }
    
    // Trim content if it's too large to avoid token limits
    const contentStr: string = contentHtml || '';
    const trimmedContent = contentStr.length > 12000 
      ? contentStr.substring(0, 12000) + '...' 
      : contentStr;
    
    // Create a system prompt that guides the AI to analyze the content
    const systemPrompt = `
      You are an expert in AI search engine optimization (AEO) analyzing web content.
      Evaluate the provided website content for its potential visibility to AI search engines.
      Focus on the following key areas:
      1. Semantic clarity and coherence
      2. Information structure and hierarchy
      3. Entity recognition and relationships
      4. Content completeness and depth
      5. Technical optimization for AI crawlers

      Provide a comprehensive analysis with:
      - An overall AI visibility score (0-100)
      - Scores for each key area (0-100)
      - Specific recommendations for improvement
      - Examples of what works well
      - Priority action items
      
      Format your response as a structured JSON object with the following properties:
      {
        "overall_score": number,
        "key_areas": {
          "semantic_clarity": { "score": number, "analysis": string },
          "information_structure": { "score": number, "analysis": string },
          "entity_recognition": { "score": number, "analysis": string },
          "content_completeness": { "score": number, "analysis": string },
          "technical_optimization": { "score": number, "analysis": string }
        },
        "strengths": [string],
        "improvement_areas": [
          { "title": string, "description": string, "priority": "high"|"medium"|"low" }
        ],
        "summary": string
      }

      Be thorough but concise in your analysis.
    `;

    // Create a user prompt with the content to analyze
    const userPrompt = `
      URL: ${url}
      
      Website Content:
      ${trimmedContent}
      
      Please analyze this content for AI search engine optimization and provide recommendations.
    `;

    // Call the AI model
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2, // Lower temperature for more consistent analysis
      max_tokens: 2500, // Allow for detailed analysis
      response_format: { type: 'json_object' }
    });

    // Parse the JSON response
    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error('AI model returned empty response');
    }
    
    const result = JSON.parse(responseContent);
    
    console.log('AI analysis completed successfully');
    return result;
  } catch (error) {
    console.error('Error in AI content analysis:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Unknown error occurred during AI analysis');
  }
} 