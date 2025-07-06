/**
 * GPT-4 Prompt Template for Brand Visibility Analysis
 * 
 * This template generates structured JSON responses for brand visibility,
 * sentiment analysis, and public perception assessment.
 */

export interface BrandVisibilityPromptOptions {
  brandName: string;
  industry: string;
  domain?: string;
  includeCompetitors?: boolean;
  analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
  timeframe?: 'current' | 'recent' | 'historical';
}

export class BrandVisibilityPromptTemplate {
  
  /**
   * Generate a structured GPT-4 prompt for brand visibility analysis
   */
  static generatePrompt(options: BrandVisibilityPromptOptions): string {
    const {
      brandName,
      industry,
      domain,
      includeCompetitors = false,
      analysisDepth = 'detailed',
      timeframe = 'current'
    } = options;

    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.getUserPrompt(options);
    
    return `${systemPrompt}\n\n${userPrompt}`;
  }

  /**
   * Get the system prompt that defines the AI's role and output format
   */
  private static getSystemPrompt(): string {
    return `You are an expert brand analyst specializing in digital visibility and public perception assessment. Your task is to analyze brand visibility based on publicly available knowledge and provide structured insights.

CRITICAL INSTRUCTIONS:
- Respond ONLY with valid JSON format
- Base analysis on factual public knowledge
- Maintain neutral, analytical tone
- Do not include personal opinions or speculation
- If information is limited, indicate this in your confidence score
- Ensure all numeric values are within specified ranges

REQUIRED JSON OUTPUT FORMAT:
{
  "sentimentScore": <number between -1.0 and 1.0, where -1.0 is very negative, 0.0 is neutral, 1.0 is very positive>,
  "mentions": [
    {
      "keyword": "<relevant keyword or phrase associated with the brand>",
      "tone": "<positive|neutral|negative>",
      "frequency": <estimated frequency score from 1-10 based on common associations>
    }
  ],
  "summary": "<2-3 sentence objective summary of brand's current visibility and public perception>",
  "confidence": <number between 0.0 and 1.0 indicating confidence in this analysis>,
  "dataPoints": <number of key data points or sources this analysis is based on>,
  "lastUpdated": "<current date in YYYY-MM-DD format>"
}`;
  }

  /**
   * Generate the user prompt with specific brand analysis request
   */
  private static getUserPrompt(options: BrandVisibilityPromptOptions): string {
    const {
      brandName,
      industry,
      domain,
      includeCompetitors,
      analysisDepth,
      timeframe
    } = options;

    const timeframeContext = this.getTimeframeContext(timeframe);
    const depthContext = this.getDepthContext(analysisDepth);
    const competitorContext = includeCompetitors ? this.getCompetitorContext() : '';

    return `BRAND VISIBILITY ANALYSIS REQUEST:

What do you know about "${brandName}" in the ${industry} industry?

ANALYSIS PARAMETERS:
- Brand Name: ${brandName}
- Industry: ${industry}
${domain ? `- Domain: ${domain}` : ''}
- Analysis Depth: ${analysisDepth}
- Timeframe: ${timeframeContext}

ANALYSIS FOCUS AREAS:
1. Overall brand reputation and public perception
2. Market position and industry standing
3. Public visibility and recognition levels
4. Common associations and brand attributes
5. Sentiment in news, reviews, and public discourse
6. Digital presence and online reputation
7. Notable achievements, controversies, or developments
8. Consumer feedback and market reception

${depthContext}

${competitorContext}

MENTION GUIDELINES:
- Include 5-8 most relevant keywords/phrases
- Focus on terms commonly associated with the brand
- Consider industry-specific terminology
- Include both positive and negative associations if they exist
- Frequency should reflect how often these terms appear in brand contexts

CONFIDENCE SCORING:
- 0.9-1.0: Extensive public information available
- 0.7-0.8: Good amount of reliable information
- 0.5-0.6: Moderate information available
- 0.3-0.4: Limited information available
- 0.1-0.2: Very limited or uncertain information

Provide your analysis in the exact JSON format specified above. Do not include any additional text, explanations, or formatting outside the JSON structure.`;
  }

  /**
   * Get timeframe-specific context
   */
  private static getTimeframeContext(timeframe: string): string {
    switch (timeframe) {
      case 'current':
        return 'Focus on current brand status and recent developments';
      case 'recent':
        return 'Focus on developments and perception over the past 1-2 years';
      case 'historical':
        return 'Include historical context and evolution of brand perception';
      default:
        return 'Focus on current brand status and recent developments';
    }
  }

  /**
   * Get analysis depth context
   */
  private static getDepthContext(depth: string): string {
    switch (depth) {
      case 'basic':
        return `BASIC ANALYSIS: Focus on fundamental brand recognition and general sentiment.`;
      case 'detailed':
        return `DETAILED ANALYSIS: Include comprehensive reputation assessment, market positioning, and stakeholder perspectives.`;
      case 'comprehensive':
        return `COMPREHENSIVE ANALYSIS: Provide in-depth analysis including competitive positioning, trend analysis, and strategic implications.`;
      default:
        return `DETAILED ANALYSIS: Include comprehensive reputation assessment, market positioning, and stakeholder perspectives.`;
    }
  }

  /**
   * Get competitor analysis context
   */
  private static getCompetitorContext(): string {
    return `
COMPETITIVE CONTEXT:
- Consider brand's position relative to key competitors
- Note any competitive advantages or disadvantages in public perception
- Include comparative sentiment if relevant`;
  }

  /**
   * Generate a simple prompt for basic use cases
   */
  static generateSimplePrompt(brandName: string, industry: string): string {
    return this.generatePrompt({
      brandName,
      industry,
      analysisDepth: 'basic',
      timeframe: 'current'
    });
  }

  /**
   * Generate a comprehensive prompt for detailed analysis
   */
  static generateComprehensivePrompt(
    brandName: string, 
    industry: string, 
    domain?: string
  ): string {
    return this.generatePrompt({
      brandName,
      industry,
      domain,
      analysisDepth: 'comprehensive',
      timeframe: 'recent',
      includeCompetitors: true
    });
  }

  /**
   * Validate the JSON response structure
   */
  static validateResponse(response: any): boolean {
    const required = ['sentimentScore', 'mentions', 'summary', 'confidence', 'dataPoints', 'lastUpdated'];
    
    // Check required fields
    for (const field of required) {
      if (!(field in response)) {
        return false;
      }
    }

    // Validate sentiment score range
    if (response.sentimentScore < -1 || response.sentimentScore > 1) {
      return false;
    }

    // Validate confidence range
    if (response.confidence < 0 || response.confidence > 1) {
      return false;
    }

    // Validate mentions array
    if (!Array.isArray(response.mentions)) {
      return false;
    }

    // Validate mention structure
    for (const mention of response.mentions) {
      if (!mention.keyword || !mention.tone || typeof mention.frequency !== 'number') {
        return false;
      }
      if (!['positive', 'neutral', 'negative'].includes(mention.tone)) {
        return false;
      }
      if (mention.frequency < 1 || mention.frequency > 10) {
        return false;
      }
    }

    return true;
  }
}

/**
 * Export ready-to-use prompt examples
 */
export const BRAND_VISIBILITY_PROMPTS = {
  
  /**
   * Basic brand analysis prompt
   */
  basic: (brandName: string, industry: string) => 
    BrandVisibilityPromptTemplate.generateSimplePrompt(brandName, industry),

  /**
   * Detailed brand analysis prompt
   */
  detailed: (brandName: string, industry: string, domain?: string) => 
    BrandVisibilityPromptTemplate.generatePrompt({
      brandName,
      industry,
      domain,
      analysisDepth: 'detailed'
    }),

  /**
   * Comprehensive brand analysis prompt
   */
  comprehensive: (brandName: string, industry: string, domain?: string) => 
    BrandVisibilityPromptTemplate.generateComprehensivePrompt(brandName, industry, domain),

  /**
   * Competitive analysis prompt
   */
  competitive: (brandName: string, industry: string) => 
    BrandVisibilityPromptTemplate.generatePrompt({
      brandName,
      industry,
      analysisDepth: 'comprehensive',
      includeCompetitors: true,
      timeframe: 'recent'
    })
};

/**
 * Usage Examples:
 * 
 * // Basic usage
 * const prompt = BRAND_VISIBILITY_PROMPTS.basic('Tesla', 'Automotive');
 * 
 * // Detailed analysis
 * const prompt = BRAND_VISIBILITY_PROMPTS.detailed('Apple', 'Technology', 'apple.com');
 * 
 * // Custom configuration
 * const prompt = BrandVisibilityPromptTemplate.generatePrompt({
 *   brandName: 'Netflix',
 *   industry: 'Entertainment',
 *   analysisDepth: 'comprehensive',
 *   timeframe: 'recent',
 *   includeCompetitors: true
 * });
 */ 