import { OpenAIBrandAnalysis, BrandMention } from '../types/brand-models';

/**
 * Brand Analysis Service using OpenAI GPT-4
 */
export class BrandAnalysisService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Analyze brand visibility using GPT-4
   */
  async analyzeBrandVisibility(
    brandName: string, 
    domain: string, 
    industry: string
  ): Promise<OpenAIBrandAnalysis> {
    try {
      console.log(`Starting brand analysis for: ${brandName} in ${industry} industry`);

      const prompt = this.buildAnalysisPrompt(brandName, domain, industry);
      const response = await this.callOpenAI(prompt);
      
      console.log('Raw OpenAI response received, parsing...');
      const analysis = this.parseAnalysisResponse(response);
      
      console.log(`Brand analysis completed with sentiment score: ${analysis.sentimentScore}`);
      return analysis;

    } catch (error) {
      console.error('Error in brand analysis:', error);
      
      // Return fallback analysis if OpenAI fails
      return this.getFallbackAnalysis(brandName, industry);
    }
  }

  /**
   * Build structured prompt for brand analysis
   */
  private buildAnalysisPrompt(brandName: string, domain: string, industry: string): string {
    return `You are a brand visibility and sentiment analysis expert. Analyze the brand "${brandName}" (domain: ${domain}) in the ${industry} industry.

Please provide a comprehensive analysis in the following JSON format:

{
  "sentimentScore": <number between -1 and 1, where -1 is very negative, 0 is neutral, 1 is very positive>,
  "mentions": [
    {
      "keyword": "<relevant keyword or phrase>",
      "tone": "<positive|neutral|negative>",
      "frequency": <estimated frequency score 1-10>
    }
  ],
  "summary": "<2-3 sentence plain English summary of the brand's current visibility and reputation>",
  "confidence": <number between 0 and 1 indicating your confidence in this analysis>
}

Consider:
1. Overall brand reputation and public perception
2. Recent news, reviews, or mentions
3. Industry position and competitive landscape
4. Social media presence and sentiment
5. Customer feedback and reviews
6. Any controversies or positive developments

Provide at least 5 relevant mentions/keywords with their associated tone and estimated frequency.

Brand to analyze: "${brandName}"
Domain: "${domain}"
Industry: "${industry}"

Respond ONLY with valid JSON - no additional text or explanation.`;
  }

  /**
   * Call OpenAI API with the analysis prompt
   */
  private async callOpenAI(prompt: string): Promise<any> {
    const requestBody = {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a brand analysis expert. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 1000,
      response_format: { type: 'json_object' } // Ensure JSON response
    };

    console.log('Calling OpenAI API with GPT-4...');
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI');
    }

    return data.choices[0].message.content;
  }

  /**
   * Parse and validate OpenAI response
   */
  private parseAnalysisResponse(responseText: string): OpenAIBrandAnalysis {
    try {
      const parsed = JSON.parse(responseText);
      
      // Validate required fields
      if (typeof parsed.sentimentScore !== 'number' || 
          parsed.sentimentScore < -1 || 
          parsed.sentimentScore > 1) {
        throw new Error('Invalid sentiment score');
      }

      if (!Array.isArray(parsed.mentions)) {
        throw new Error('Invalid mentions array');
      }

      if (typeof parsed.summary !== 'string' || parsed.summary.length < 10) {
        throw new Error('Invalid summary');
      }

      // Validate mentions structure
      const validMentions: BrandMention[] = parsed.mentions
        .filter((mention: any) => 
          mention.keyword && 
          ['positive', 'neutral', 'negative'].includes(mention.tone) &&
          typeof mention.frequency === 'number'
        )
        .map((mention: any) => ({
          keyword: mention.keyword,
          tone: mention.tone,
          frequency: Math.max(1, Math.min(10, mention.frequency)) // Clamp to 1-10
        }));

      return {
        sentimentScore: Math.max(-1, Math.min(1, parsed.sentimentScore)), // Clamp to -1 to 1
        mentions: validMentions,
        summary: parsed.summary,
        confidence: parsed.confidence || 0.7 // Default confidence if not provided
      };

    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse analysis response');
    }
  }

  /**
   * Provide fallback analysis if OpenAI fails
   */
  private getFallbackAnalysis(brandName: string, industry: string): OpenAIBrandAnalysis {
    console.log('Using fallback analysis for:', brandName);
    
    return {
      sentimentScore: 0, // Neutral sentiment as fallback
      mentions: [
        { keyword: brandName.toLowerCase(), tone: 'neutral', frequency: 5 },
        { keyword: `${industry} company`, tone: 'neutral', frequency: 3 },
        { keyword: 'business', tone: 'neutral', frequency: 4 },
        { keyword: 'services', tone: 'neutral', frequency: 3 },
        { keyword: 'brand', tone: 'neutral', frequency: 2 }
      ],
      summary: `Limited information available for ${brandName}. This analysis uses fallback data due to API limitations. A more comprehensive analysis may be available with a successful API connection.`,
      confidence: 0.2 // Low confidence for fallback
    };
  }
} 