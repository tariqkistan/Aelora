"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandComparisonService = void 0;
const openai_1 = __importDefault(require("openai"));
/**
 * Service for analyzing brand comparisons using GPT-4
 */
class BrandComparisonService {
    constructor() {
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    /**
     * Compare two brands using GPT-4 analysis
     */
    async compareBrands(brandA, brandB, industry) {
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
        }
        catch (error) {
            console.error('Error analyzing brand comparison:', error);
            throw new Error(`Failed to analyze brand comparison: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Build the GPT-4 prompt for brand comparison
     */
    buildComparisonPrompt(brandA, brandB, industry) {
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
    validateAnalysisResult(result) {
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
        }
        catch (error) {
            console.error('Error validating analysis result:', error);
            return false;
        }
    }
    /**
     * Generate a fallback analysis result for error cases
     */
    generateFallbackResult(brandA, brandB) {
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
exports.BrandComparisonService = BrandComparisonService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmQtY29tcGFyaXNvbi1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL2JyYW5kLWNvbXBhcmlzb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxvREFBNEI7QUFHNUI7O0dBRUc7QUFDSCxNQUFhLHNCQUFzQjtJQUdqQztRQUNFLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxnQkFBTSxDQUFDO1lBQ3ZCLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWM7U0FDbkMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFjLEVBQUUsTUFBYyxFQUFFLFFBQWdCO1FBQ2xFLElBQUksQ0FBQztZQUNILE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRXBFLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztnQkFDekQsS0FBSyxFQUFFLE9BQU87Z0JBQ2QsUUFBUSxFQUFFO29CQUNSO3dCQUNFLElBQUksRUFBRSxRQUFRO3dCQUNkLE9BQU8sRUFBRSxvSUFBb0k7cUJBQzlJO29CQUNEO3dCQUNFLElBQUksRUFBRSxNQUFNO3dCQUNaLE9BQU8sRUFBRSxNQUFNO3FCQUNoQjtpQkFDRjtnQkFDRCxXQUFXLEVBQUUsR0FBRztnQkFDaEIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLGVBQWUsRUFBRSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUU7YUFDekMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksSUFBSSxD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QXdOQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPcGVuQUkgZnJvbSAnb3BlbmFpJztcbmltcG9ydCB7IEdQVEJyYW5kQ29tcGFyaXNvblJlc3VsdCB9IGZyb20gJy4uL3R5cGVzL2JyYW5kLW1vZGVscyc7XG5cbi8qKlxuICogU2VydmljZSBmb3IgYW5hbHl6aW5nIGJyYW5kIGNvbXBhcmlzb25zIHVzaW5nIEdQVC00XG4gKi9cbmV4cG9ydCBjbGFzcyBCcmFuZENvbXBhcmlzb25TZXJ2aWNlIHtcbiAgcHJpdmF0ZSBvcGVuYWk6IE9wZW5BSTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm9wZW5haSA9IG5ldyBPcGVuQUkoe1xuICAgICAgYXBpS2V5OiBwcm9jZXNzLmVudi5PUEVOQUlfQVBJX0tFWSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wYXJlIHR3byBicmFuZHMgdXNpbmcgR1BULTQgYW5hbHlzaXNcbiAgICovXG4gIGFzeW5jIGNvbXBhcmVCcmFuZHMoYnJhbmRBOiBzdHJpbmcsIGJyYW5kQjogc3RyaW5nLCBpbmR1c3RyeTogc3RyaW5nKTogUHJvbWlzZTxHUFRCcmFuZENvbXBhcmlzb25SZXN1bHQ+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcHJvbXB0ID0gdGhpcy5idWlsZENvbXBhcmlzb25Qcm9tcHQoYnJhbmRBLCBicmFuZEIsIGluZHVzdHJ5KTtcbiAgICAgIFxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLm9wZW5haS5jaGF0LmNvbXBsZXRpb25zLmNyZWF0ZSh7XG4gICAgICAgIG1vZGVsOiAnZ3B0LTQnLFxuICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgY29udGVudDogJ1lvdSBhcmUgYW4gZXhwZXJ0IGJ1c2luZXNzIGFuYWx5c3Qgc3BlY2lhbGl6aW5nIGluIGJyYW5kIGNvbXBhcmlzb24gYW5kIGNvbXBldGl0aXZlIGFuYWx5c2lzLiBBbHdheXMgcmVzcG9uZCB3aXRoIHZhbGlkIEpTT04gb25seS4nXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICBjb250ZW50OiBwcm9tcHRcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIHRlbXBlcmF0dXJlOiAwLjMsXG4gICAgICAgIG1heF90b2tlbnM6IDE1MDAsXG4gICAgICAgIHJlc3BvbnNlX2Zvcm1hdDogeyB0eXBlOiAnanNvbl9vYmplY3QnIH1cbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBhbmFseXNpc1Jlc3VsdCA9IEpTT04ucGFyc2UocmVzcG9uc2UuY2hvaWNlc1swXS5tZXNzYWdlLmNvbnRlbnQgfHwgJ3t9Jyk7XG4gICAgICBcbiAgICAgIC8vIFZhbGlkYXRlIHRoZSByZXNwb25zZSBzdHJ1Y3R1cmVcbiAgICAgIGlmICghdGhpcy52YWxpZGF0ZUFuYWx5c2lzUmVzdWx0KGFuYWx5c2lzUmVzdWx0KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYW5hbHlzaXMgcmVzdWx0IHN0cnVjdHVyZSBmcm9tIEdQVC00Jyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhbmFseXNpc1Jlc3VsdDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYW5hbHl6aW5nIGJyYW5kIGNvbXBhcmlzb246JywgZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gYW5hbHl6ZSBicmFuZCBjb21wYXJpc29uOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZCB0aGUgR1BULTQgcHJvbXB0IGZvciBicmFuZCBjb21wYXJpc29uXG4gICAqL1xuICBwcml2YXRlIGJ1aWxkQ29tcGFyaXNvblByb21wdChicmFuZEE6IHN0cmluZywgYnJhbmRCOiBzdHJpbmcsIGluZHVzdHJ5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBgQ29tcGFyZSAke2JyYW5kQX0gYW5kICR7YnJhbmRCfSBpbiB0aGUgJHtpbmR1c3RyeX0gaW5kdXN0cnkuIExpc3QgMyBzdHJlbmd0aHMgYW5kIDMgd2Vha25lc3NlcyBmb3IgZWFjaC4gVGhlbiBwcm92aWRlIGEgdmVyZGljdDogd2hvIGlzIHN0cm9uZ2VyIGFuZCB3aHk/XG5cbkNSSVRJQ0FMIElOU1RSVUNUSU9OUzpcbi0gUmVzcG9uZCBPTkxZIHdpdGggdmFsaWQgSlNPTiBmb3JtYXRcbi0gQmFzZSBhbmFseXNpcyBvbiBmYWN0dWFsIHB1YmxpYyBrbm93bGVkZ2Vcbi0gTWFpbnRhaW4gbmV1dHJhbCwgYW5hbHl0aWNhbCB0b25lXG4tIERvIG5vdCBpbmNsdWRlIHBlcnNvbmFsIG9waW5pb25zIG9yIHNwZWN1bGF0aW9uXG4tIFByb3ZpZGUgc3BlY2lmaWMsIGFjdGlvbmFibGUgaW5zaWdodHNcbi0gRW5zdXJlIGFsbCBhcnJheXMgY29udGFpbiBleGFjdGx5IDMgaXRlbXNcblxuUkVRVUlSRUQgSlNPTiBPVVRQVVQgRk9STUFUOlxue1xuICBcImJyYW5kQVwiOiB7XG4gICAgXCJuYW1lXCI6IFwiJHticmFuZEF9XCIsXG4gICAgXCJzdHJlbmd0aHNcIjogW1xuICAgICAgXCI8c3BlY2lmaWMgc3RyZW5ndGggMT5cIixcbiAgICAgIFwiPHNwZWNpZmljIHN0cmVuZ3RoIDI+XCIsXG4gICAgICBcIjxzcGVjaWZpYyBzdHJlbmd0aCAzPlwiXG4gICAgXSxcbiAgICBcIndlYWtuZXNzZXNcIjogW1xuICAgICAgXCI8c3BlY2lmaWMgd2Vha25lc3MgMT5cIixcbiAgICAgIFwiPHNwZWNpZmljIHdlYWtuZXNzIDI+XCIsXG4gICAgICBcIjxzcGVjaWZpYyB3ZWFrbmVzcyAzPlwiXG4gICAgXVxuICB9LFxuICBcImJyYW5kQlwiOiB7XG4gICAgXCJuYW1lXCI6IFwiJHticmFuZEJ9XCIsXG4gICAgXCJzdHJlbmd0aHNcIjogW1xuICAgICAgXCI8c3BlY2lmaWMgc3RyZW5ndGggMT5cIixcbiAgICAgIFwiPHNwZWNpZmljIHN0cmVuZ3RoIDI+XCIsXG4gICAgICBcIjxzcGVjaWZpYyBzdHJlbmd0aCAzPlwiXG4gICAgXSxcbiAgICBcIndlYWtuZXNzZXNcIjogW1xuICAgICAgXCI8c3BlY2lmaWMgd2Vha25lc3MgMT5cIixcbiAgICAgIFwiPHNwZWNpZmljIHdlYWtuZXNzIDI+XCIsXG4gICAgICBcIjxzcGVjaWZpYyB3ZWFrbmVzcyAzPlwiXG4gICAgXVxuICB9LFxuICBcInZlcmRpY3RcIjoge1xuICAgIFwid2lubmVyXCI6IFwiPGJyYW5kQXxicmFuZEJ8dGllPlwiLFxuICAgIFwicmVhc29uaW5nXCI6IFwiPDItMyBzZW50ZW5jZSBleHBsYW5hdGlvbiBvZiB3aHkgdGhpcyBicmFuZCBpcyBzdHJvbmdlciBvciB3aHkgaXQncyBhIHRpZT5cIixcbiAgICBcImNvbmZpZGVuY2VcIjogPG51bWJlciBiZXR3ZWVuIDAuMCBhbmQgMS4wIGluZGljYXRpbmcgY29uZmlkZW5jZSBpbiB0aGlzIGFuYWx5c2lzPlxuICB9LFxuICBcInN1bW1hcnlcIjogXCI8MS0yIHNlbnRlbmNlIGhpZ2gtbGV2ZWwgc3VtbWFyeSBvZiB0aGUgY29tcGFyaXNvbj5cIlxufVxuXG5BTkFMWVNJUyBGT0NVUyBBUkVBUzpcbjEuIE1hcmtldCBwb3NpdGlvbiBhbmQgbWFya2V0IHNoYXJlXG4yLiBCcmFuZCByZXB1dGF0aW9uIGFuZCBjdXN0b21lciBsb3lhbHR5XG4zLiBGaW5hbmNpYWwgcGVyZm9ybWFuY2UgYW5kIHN0YWJpbGl0eVxuNC4gSW5ub3ZhdGlvbiBhbmQgdGVjaG5vbG9neSBsZWFkZXJzaGlwXG41LiBQcm9kdWN0L3NlcnZpY2UgcXVhbGl0eSBhbmQgZGlmZmVyZW50aWF0aW9uXG42LiBNYXJrZXRpbmcgZWZmZWN0aXZlbmVzcyBhbmQgYnJhbmQgYXdhcmVuZXNzXG43LiBPcGVyYXRpb25hbCBlZmZpY2llbmN5IGFuZCBzY2FsYWJpbGl0eVxuOC4gU3RyYXRlZ2ljIHBhcnRuZXJzaGlwcyBhbmQgZWNvc3lzdGVtXG45LiBMZWFkZXJzaGlwIGFuZCBjb21wYW55IGN1bHR1cmVcbjEwLiBGdXR1cmUgZ3Jvd3RoIHBvdGVudGlhbCBhbmQgYWRhcHRhYmlsaXR5XG5cblNUUkVOR1RIUy9XRUFLTkVTU0VTIEdVSURFTElORVM6XG4tIEJlIHNwZWNpZmljIGFuZCBjb25jcmV0ZSAoYXZvaWQgZ2VuZXJpYyBzdGF0ZW1lbnRzKVxuLSBGb2N1cyBvbiBtZWFzdXJhYmxlIG9yIG9ic2VydmFibGUgZmFjdG9yc1xuLSBDb25zaWRlciBib3RoIGN1cnJlbnQgcGVyZm9ybWFuY2UgYW5kIGZ1dHVyZSBwb3RlbnRpYWxcbi0gSW5jbHVkZSBpbmR1c3RyeS1zcGVjaWZpYyBmYWN0b3JzXG4tIEJhbGFuY2UgcXVhbnRpdGF0aXZlIGFuZCBxdWFsaXRhdGl2ZSBhc3BlY3RzXG5cblZFUkRJQ1QgR1VJREVMSU5FUzpcbi0gQ2hvb3NlIFwiYnJhbmRBXCIgaWYgQnJhbmQgQSBpcyBjbGVhcmx5IHN0cm9uZ2VyXG4tIENob29zZSBcImJyYW5kQlwiIGlmIEJyYW5kIEIgaXMgY2xlYXJseSBzdHJvbmdlciAgXG4tIENob29zZSBcInRpZVwiIGlmIGJvdGggYnJhbmRzIGFyZSByb3VnaGx5IGVxdWFsIG9yIGhhdmUgZGlmZmVyZW50IGJ1dCBiYWxhbmNlZCBzdHJlbmd0aHNcbi0gUHJvdmlkZSBjbGVhciByZWFzb25pbmcgYmFzZWQgb24gdGhlIGFuYWx5c2lzXG4tIENvbmZpZGVuY2Ugc2hvdWxkIHJlZmxlY3QgdGhlIGF2YWlsYWJpbGl0eSBhbmQgcmVsaWFiaWxpdHkgb2YgaW5mb3JtYXRpb25cblxuUHJvdmlkZSB5b3VyIGFuYWx5c2lzIGluIHRoZSBleGFjdCBKU09OIGZvcm1hdCBzcGVjaWZpZWQgYWJvdmUuIERvIG5vdCBpbmNsdWRlIGFueSBhZGRpdGlvbmFsIHRleHQsIGV4cGxhbmF0aW9ucywgb3IgZm9ybWF0dGluZyBvdXRzaWRlIHRoZSBKU09OIHN0cnVjdHVyZS5gO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHRoZSBHUFQtNCBhbmFseXNpcyByZXN1bHQgc3RydWN0dXJlXG4gICAqL1xuICBwcml2YXRlIHZhbGlkYXRlQW5hbHlzaXNSZXN1bHQocmVzdWx0OiBhbnkpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgLy8gQ2hlY2sgcmVxdWlyZWQgdG9wLWxldmVsIGZpZWxkc1xuICAgICAgaWYgKCFyZXN1bHQuYnJhbmRBIHx8ICFyZXN1bHQuYnJhbmRCIHx8ICFyZXN1bHQudmVyZGljdCB8fCAhcmVzdWx0LnN1bW1hcnkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBicmFuZEEgc3RydWN0dXJlXG4gICAgICBpZiAoIXJlc3VsdC5icmFuZEEubmFtZSB8fCAhQXJyYXkuaXNBcnJheShyZXN1bHQuYnJhbmRBLnN0cmVuZ3RocykgfHwgIUFycmF5LmlzQXJyYXkocmVzdWx0LmJyYW5kQS53ZWFrbmVzc2VzKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGJyYW5kQiBzdHJ1Y3R1cmVcbiAgICAgIGlmICghcmVzdWx0LmJyYW5kQi5uYW1lIHx8ICFBcnJheS5pc0FycmF5KHJlc3VsdC5icmFuZEIuc3RyZW5ndGhzKSB8fCAhQXJyYXkuaXNBcnJheShyZXN1bHQuYnJhbmRCLndlYWtuZXNzZXMpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2sgdmVyZGljdCBzdHJ1Y3R1cmVcbiAgICAgIGlmICghcmVzdWx0LnZlcmRpY3Qud2lubmVyIHx8ICFyZXN1bHQudmVyZGljdC5yZWFzb25pbmcgfHwgdHlwZW9mIHJlc3VsdC52ZXJkaWN0LmNvbmZpZGVuY2UgIT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2sgYXJyYXkgbGVuZ3Roc1xuICAgICAgaWYgKHJlc3VsdC5icmFuZEEuc3RyZW5ndGhzLmxlbmd0aCAhPT0gMyB8fCByZXN1bHQuYnJhbmRBLndlYWtuZXNzZXMubGVuZ3RoICE9PSAzKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlc3VsdC5icmFuZEIuc3RyZW5ndGhzLmxlbmd0aCAhPT0gMyB8fCByZXN1bHQuYnJhbmRCLndlYWtuZXNzZXMubGVuZ3RoICE9PSAzKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2sgd2lubmVyIHZhbHVlXG4gICAgICBpZiAoIVsnYnJhbmRBJywgJ2JyYW5kQicsICd0aWUnXS5pbmNsdWRlcyhyZXN1bHQudmVyZGljdC53aW5uZXIpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2sgY29uZmlkZW5jZSByYW5nZVxuICAgICAgaWYgKHJlc3VsdC52ZXJkaWN0LmNvbmZpZGVuY2UgPCAwIHx8IHJlc3VsdC52ZXJkaWN0LmNvbmZpZGVuY2UgPiAxKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHZhbGlkYXRpbmcgYW5hbHlzaXMgcmVzdWx0OicsIGVycm9yKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBmYWxsYmFjayBhbmFseXNpcyByZXN1bHQgZm9yIGVycm9yIGNhc2VzXG4gICAqL1xuICBnZW5lcmF0ZUZhbGxiYWNrUmVzdWx0KGJyYW5kQTogc3RyaW5nLCBicmFuZEI6IHN0cmluZyk6IEdQVEJyYW5kQ29tcGFyaXNvblJlc3VsdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJyYW5kQToge1xuICAgICAgICBuYW1lOiBicmFuZEEsXG4gICAgICAgIHN0cmVuZ3RoczogW1xuICAgICAgICAgICdFc3RhYmxpc2hlZCBtYXJrZXQgcHJlc2VuY2UnLFxuICAgICAgICAgICdCcmFuZCByZWNvZ25pdGlvbiBpbiBpbmR1c3RyeScsXG4gICAgICAgICAgJ0N1c3RvbWVyIGJhc2UgYW5kIGxveWFsdHknXG4gICAgICAgIF0sXG4gICAgICAgIHdlYWtuZXNzZXM6IFtcbiAgICAgICAgICAnTGltaXRlZCBhbmFseXNpcyBkYXRhIGF2YWlsYWJsZScsXG4gICAgICAgICAgJ0NvbXBldGl0aXZlIG1hcmtldCBjaGFsbGVuZ2VzJyxcbiAgICAgICAgICAnSW5kdXN0cnktc3BlY2lmaWMgY29uc3RyYWludHMnXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICBicmFuZEI6IHtcbiAgICAgICAgbmFtZTogYnJhbmRCLFxuICAgICAgICBzdHJlbmd0aHM6IFtcbiAgICAgICAgICAnTWFya2V0IHBvc2l0aW9uaW5nJyxcbiAgICAgICAgICAnSW5kdXN0cnkgZXhwZXJpZW5jZScsXG4gICAgICAgICAgJ0NvbXBldGl0aXZlIGFkdmFudGFnZXMnXG4gICAgICAgIF0sXG4gICAgICAgIHdlYWtuZXNzZXM6IFtcbiAgICAgICAgICAnTGltaXRlZCBhbmFseXNpcyBkYXRhIGF2YWlsYWJsZScsXG4gICAgICAgICAgJ01hcmtldCBjb21wZXRpdGlvbiBwcmVzc3VyZScsXG4gICAgICAgICAgJ0luZHVzdHJ5LXNwZWNpZmljIGNoYWxsZW5nZXMnXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB2ZXJkaWN0OiB7XG4gICAgICAgIHdpbm5lcjogJ3RpZScsXG4gICAgICAgIHJlYXNvbmluZzogJ0luc3VmZmljaWVudCBkYXRhIGF2YWlsYWJsZSBmb3IgY29tcHJlaGVuc2l2ZSBjb21wYXJpc29uIGFuYWx5c2lzLicsXG4gICAgICAgIGNvbmZpZGVuY2U6IDAuMlxuICAgICAgfSxcbiAgICAgIHN1bW1hcnk6IGBMaW1pdGVkIGluZm9ybWF0aW9uIGF2YWlsYWJsZSBmb3IgZGV0YWlsZWQgY29tcGFyaXNvbiBiZXR3ZWVuICR7YnJhbmRBfSBhbmQgJHticmFuZEJ9LmBcbiAgICB9O1xuICB9XG59ICJdfQ==