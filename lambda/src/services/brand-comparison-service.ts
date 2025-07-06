import OpenAI from 'openai';
import { GPTBrandComparisonResult } from '../types/brand-models';

/**
 * Service for analyzing brand comparisons using GPT-4
 */
export class BrandComparisonService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Compare two brands using GPT-4 analysis
   */
  async compareBrands(brandA: string, brandB: string, industry: string): Promise<GPTBrandComparisonResult> {
    try {
      const prompt = this.buildComparisonPrompt(brandA, brandB, industry);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert business analyst specializing in brand comparison and competitive analysis. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const analysisResult = JSON.parse(response.choices[0].message.content || '{}');
      
      // Validate the response structure
      if (!this.validateAnalysisResult(analysisResult)) {
        throw new Error('Invalid analysis result structure from GPT-4');
      }

      return analysisResult;
    } catch (error) {
      console.error('Error analyzing brand comparison:', error);
      throw new Error(`Failed to analyze brand comparison: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build the GPT-4 prompt for brand comparison
   */
  private buildComparisonPrompt(brandA: string, brandB: string, industry: string): string {
    return `Compare ${brandA} and ${brandB} in the ${industry} industry. List 3 strengths and 3 weaknesses for each. Then provide a verdict: who is stronger and why?

CRITICAL INSTRUCTIONS:
- Respond ONLY with valid JSON format
- Base analysis on factual public knowledge
- Maintain neutral, analytical tone
- Do not include personal opinions or speculation
- Provide specific, actionable insights
- Ensure all arrays contain exactly 3 items

REQUIRED JSON OUTPUT FORMAT:
{
  "brandA": {
    "name": "${brandA}",
    "strengths": [
      "<specific strength 1>",
      "<specific strength 2>",
      "<specific strength 3>"
    ],
    "weaknesses": [
      "<specific weakness 1>",
      "<specific weakness 2>",
      "<specific weakness 3>"
    ]
  },
  "brandB": {
    "name": "${brandB}",
    "strengths": [
      "<specific strength 1>",
      "<specific strength 2>",
      "<specific strength 3>"
    ],
    "weaknesses": [
      "<specific weakness 1>",
      "<specific weakness 2>",
      "<specific weakness 3>"
    ]
  },
  "verdict": {
    "winner": "<brandA|brandB|tie>",
    "reasoning": "<2-3 sentence explanation of why this brand is stronger or why it's a tie>",
    "confidence": <number between 0.0 and 1.0 indicating confidence in this analysis>
  },
  "summary": "<1-2 sentence high-level summary of the comparison>"
}

ANALYSIS FOCUS AREAS:
1. Market position and market share
2. Brand reputation and customer loyalty
3. Financial performance and stability
4. Innovation and technology leadership
5. Product/service quality and differentiation
6. Marketing effectiveness and brand awareness
7. Operational efficiency and scalability
8. Strategic partnerships and ecosystem
9. Leadership and company culture
10. Future growth potential and adaptability

STRENGTHS/WEAKNESSES GUIDELINES:
- Be specific and concrete (avoid generic statements)
- Focus on measurable or observable factors
- Consider both current performance and future potential
- Include industry-specific factors
- Balance quantitative and qualitative aspects

VERDICT GUIDELINES:
- Choose "brandA" if Brand A is clearly stronger
- Choose "brandB" if Brand B is clearly stronger  
- Choose "tie" if both brands are roughly equal or have different but balanced strengths
- Provide clear reasoning based on the analysis
- Confidence should reflect the availability and reliability of information

Provide your analysis in the exact JSON format specified above. Do not include any additional text, explanations, or formatting outside the JSON structure.`;
  }

  /**
   * Validate the GPT-4 analysis result structure
   */
  private validateAnalysisResult(result: any): boolean {
    try {
      // Check required top-level fields
      if (!result.brandA || !result.brandB || !result.verdict || !result.summary) {
        return false;
      }

      // Check brandA structure
      if (!result.brandA.name || !Array.isArray(result.brandA.strengths) || !Array.isArray(result.brandA.weaknesses)) {
        return false;
      }

      // Check brandB structure
      if (!result.brandB.name || !Array.isArray(result.brandB.strengths) || !Array.isArray(result.brandB.weaknesses)) {
        return false;
      }

      // Check verdict structure
      if (!result.verdict.winner || !result.verdict.reasoning || typeof result.verdict.confidence !== 'number') {
        return false;
      }

      // Check array lengths
      if (result.brandA.strengths.length !== 3 || result.brandA.weaknesses.length !== 3) {
        return false;
      }

      if (result.brandB.strengths.length !== 3 || result.brandB.weaknesses.length !== 3) {
        return false;
      }

      // Check winner value
      if (!['brandA', 'brandB', 'tie'].includes(result.verdict.winner)) {
        return false;
      }

      // Check confidence range
      if (result.verdict.confidence < 0 || result.verdict.confidence > 1) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating analysis result:', error);
      return false;
    }
  }

  /**
   * Generate a fallback analysis result for error cases
   */
  generateFallbackResult(brandA: string, brandB: string): GPTBrandComparisonResult {
    return {
      brandA: {
        name: brandA,
        strengths: [
          'Established market presence',
          'Brand recognition in industry',
          'Customer base and loyalty'
        ],
        weaknesses: [
          'Limited analysis data available',
          'Competitive market challenges',
          'Industry-specific constraints'
        ]
      },
      brandB: {
        name: brandB,
        strengths: [
          'Market positioning',
          'Industry experience',
          'Competitive advantages'
        ],
        weaknesses: [
          'Limited analysis data available',
          'Market competition pressure',
          'Industry-specific challenges'
        ]
      },
      verdict: {
        winner: 'tie',
        reasoning: 'Insufficient data available for comprehensive comparison analysis.',
        confidence: 0.2
      },
      summary: `Limited information available for detailed comparison between ${brandA} and ${brandB}.`
    };
  }
} 