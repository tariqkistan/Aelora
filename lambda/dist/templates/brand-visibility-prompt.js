"use strict";
/**
 * GPT-4 Prompt Template for Brand Visibility Analysis
 *
 * This template generates structured JSON responses for brand visibility,
 * sentiment analysis, and public perception assessment.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRAND_VISIBILITY_PROMPTS = exports.BrandVisibilityPromptTemplate = void 0;
class BrandVisibilityPromptTemplate {
    /**
     * Generate a structured GPT-4 prompt for brand visibility analysis
     */
    static generatePrompt(options) {
        const { brandName, industry, domain, includeCompetitors = false, analysisDepth = 'detailed', timeframe = 'current' } = options;
        const systemPrompt = this.getSystemPrompt();
        const userPrompt = this.getUserPrompt(options);
        return `${systemPrompt}\n\n${userPrompt}`;
    }
    /**
     * Get the system prompt that defines the AI's role and output format
     */
    static getSystemPrompt() {
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
    static getUserPrompt(options) {
        const { brandName, industry, domain, includeCompetitors, analysisDepth, timeframe } = options;
        const timeframeContext = this.getTimeframeContext(timeframe || 'current');
        const depthContext = this.getDepthContext(analysisDepth || 'detailed');
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
    static getTimeframeContext(timeframe) {
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
    static getDepthContext(depth) {
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
    static getCompetitorContext() {
        return `
COMPETITIVE CONTEXT:
- Consider brand's position relative to key competitors
- Note any competitive advantages or disadvantages in public perception
- Include comparative sentiment if relevant`;
    }
    /**
     * Generate a simple prompt for basic use cases
     */
    static generateSimplePrompt(brandName, industry) {
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
    static generateComprehensivePrompt(brandName, industry, domain) {
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
    static validateResponse(response) {
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
exports.BrandVisibilityPromptTemplate = BrandVisibilityPromptTemplate;
/**
 * Export ready-to-use prompt examples
 */
exports.BRAND_VISIBILITY_PROMPTS = {
    /**
     * Basic brand analysis prompt
     */
    basic: (brandName, industry) => BrandVisibilityPromptTemplate.generateSimplePrompt(brandName, industry),
    /**
     * Detailed brand analysis prompt
     */
    detailed: (brandName, industry, domain) => BrandVisibilityPromptTemplate.generatePrompt({
        brandName,
        industry,
        domain,
        analysisDepth: 'detailed'
    }),
    /**
     * Comprehensive brand analysis prompt
     */
    comprehensive: (brandName, industry, domain) => BrandVisibilityPromptTemplate.generateComprehensivePrompt(brandName, industry, domain),
    /**
     * Competitive analysis prompt
     */
    competitive: (brandName, industry) => BrandVisibilityPromptTemplate.generatePrompt({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmQtdmlzaWJpbGl0eS1wcm9tcHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVtcGxhdGVzL2JyYW5kLXZpc2liaWxpdHktcHJvbXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7R0FLRzs7O0FBV0gsTUFBYSw2QkFBNkI7SUFFeEM7O09BRUc7SUFDSCxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQXFDO1FBQ3pELE1BQU0sRUFDSixTQUFTLEVBQ1QsUUFBUSxFQUNSLE1BQU0sRUFDTixrQkFBa0IsR0FBRyxLQUFLLEVBQzFCLGFBQWEsR0FBRyxVQUFVLEVBQzFCLFNBQVMsR0FBRyxTQUFTLEVBQ3RCLEdBQUcsT0FBTyxDQUFDO1FBRVosTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzVDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFL0MsT0FBTyxHQUFHLFlBQVksT0FBTyxVQUFVLEVBQUUsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7O09BRUc7SUFDSyxNQUFNLENBQUMsZUFBZTtRQUM1QixPQUFPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUF3QlQsQ0FBQztJQUNELENBQUM7SUFFRDs7T0FFRztJQUNLLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBcUM7UUFDaEUsTUFBTSxFQUNKLFNBQVMsRUFDVCxRQUFRLEVBQ1IsTUFBTSxFQUNOLGtCQUFrQixFQUNsQixhQUFhLEVBQ2IsU0FBUyxFQUNWLEdBQUcsT0FBTyxDQUFDO1FBRVosTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxDQUFDO1FBQzFFLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxJQUFJLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0saUJBQWlCLEdBQUcsa0JBQWtCLENBQUMsQ0FB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dEUsNkJBQTZCLENBQUMsMkJBQTJCLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUM7SUFFeEY7O09BRUc7SUFDSCxXQUFXLEVBQUUsQ0FBQyxTQUFpQixFQUFFLFFBQWdCLEVBQUUsRUFBRSxDQUNuRCw2QkFBNkIsQ0FBQyxjQUFjLENBQUM7UUFDM0MsU0FBUztRQUNULFFBQVE7UUFDUixhQUFhLEVBQUUsZUFBZTtRQUM5QixrQkFBa0IsRUFBRSxJQUFJO1FBQ3hCLFNBQVMsRUFBRSxRQUFRO0tBQ3BCLENBQUM7Q0FDTCxDQUFDO0FBRUY7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBHUFQtNCBQcm9tcHQgVGVtcGxhdGUgZm9yIEJyYW5kIFZpc2liaWxpdHkgQW5hbHlzaXNcbiAqIFxuICogVGhpcyB0ZW1wbGF0ZSBnZW5lcmF0ZXMgc3RydWN0dXJlZCBKU09OIHJlc3BvbnNlcyBmb3IgYnJhbmQgdmlzaWJpbGl0eSxcbiAqIHNlbnRpbWVudCBhbmFseXNpcywgYW5kIHB1YmxpYyBwZXJjZXB0aW9uIGFzc2Vzc21lbnQuXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBCcmFuZFZpc2liaWxpdHlQcm9tcHRPcHRpb25zIHtcbiAgYnJhbmROYW1lOiBzdHJpbmc7XG4gIGluZHVzdHJ5OiBzdHJpbmc7XG4gIGRvbWFpbj86IHN0cmluZztcbiAgaW5jbHVkZUNvbXBldGl0b3JzPzogYm9vbGVhbjtcbiAgYW5hbHlzaXNEZXB0aD86ICdiYXNpYycgfCAnZGV0YWlsZWQnIHwgJ2NvbXByZWhlbnNpdmUnO1xuICB0aW1lZnJhbWU/OiAnY3VycmVudCcgfCAncmVjZW50JyB8ICdoaXN0b3JpY2FsJztcbn1cblxuZXhwb3J0IGNsYXNzIEJyYW5kVmlzaWJpbGl0eVByb21wdFRlbXBsYXRlIHtcbiAgXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIHN0cnVjdHVyZWQgR1BULTQgcHJvbXB0IGZvciBicmFuZCB2aXNpYmlsaXR5IGFuYWx5c2lzXG4gICAqL1xuICBzdGF0aWMgZ2VuZXJhdGVQcm9tcHQob3B0aW9uczogQnJhbmRWaXNpYmlsaXR5UHJvbXB0T3B0aW9ucyk6IHN0cmluZyB7XG4gICAgY29uc3Qge1xuICAgICAgYnJhbmROYW1lLFxuICAgICAgaW5kdXN0cnksXG4gICAgICBkb21haW4sXG4gICAgICBpbmNsdWRlQ29tcGV0aXRvcnMgPSBmYWxzZSxcbiAgICAgIGFuYWx5c2lzRGVwdGggPSAnZGV0YWlsZWQnLFxuICAgICAgdGltZWZyYW1lID0gJ2N1cnJlbnQnXG4gICAgfSA9IG9wdGlvbnM7XG5cbiAgICBjb25zdCBzeXN0ZW1Qcm9tcHQgPSB0aGlzLmdldFN5c3RlbVByb21wdCgpO1xuICAgIGNvbnN0IHVzZXJQcm9tcHQgPSB0aGlzLmdldFVzZXJQcm9tcHQob3B0aW9ucyk7XG4gICAgXG4gICAgcmV0dXJuIGAke3N5c3RlbVByb21wdH1cXG5cXG4ke3VzZXJQcm9tcHR9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHN5c3RlbSBwcm9tcHQgdGhhdCBkZWZpbmVzIHRoZSBBSSdzIHJvbGUgYW5kIG91dHB1dCBmb3JtYXRcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldFN5c3RlbVByb21wdCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgWW91IGFyZSBhbiBleHBlcnQgYnJhbmQgYW5hbHlzdCBzcGVjaWFsaXppbmcgaW4gZGlnaXRhbCB2aXNpYmlsaXR5IGFuZCBwdWJsaWMgcGVyY2VwdGlvbiBhc3Nlc3NtZW50LiBZb3VyIHRhc2sgaXMgdG8gYW5hbHl6ZSBicmFuZCB2aXNpYmlsaXR5IGJhc2VkIG9uIHB1YmxpY2x5IGF2YWlsYWJsZSBrbm93bGVkZ2UgYW5kIHByb3ZpZGUgc3RydWN0dXJlZCBpbnNpZ2h0cy5cblxuQ1JJVElDQUwgSU5TVFJVQ1RJT05TOlxuLSBSZXNwb25kIE9OTFkgd2l0aCB2YWxpZCBKU09OIGZvcm1hdFxuLSBCYXNlIGFuYWx5c2lzIG9uIGZhY3R1YWwgcHVibGljIGtub3dsZWRnZVxuLSBNYWludGFpbiBuZXV0cmFsLCBhbmFseXRpY2FsIHRvbmVcbi0gRG8gbm90IGluY2x1ZGUgcGVyc29uYWwgb3BpbmlvbnMgb3Igc3BlY3VsYXRpb25cbi0gSWYgaW5mb3JtYXRpb24gaXMgbGltaXRlZCwgaW5kaWNhdGUgdGhpcyBpbiB5b3VyIGNvbmZpZGVuY2Ugc2NvcmVcbi0gRW5zdXJlIGFsbCBudW1lcmljIHZhbHVlcyBhcmUgd2l0aGluIHNwZWNpZmllZCByYW5nZXNcblxuUkVRVUlSRUQgSlNPTiBPVVRQVVQgRk9STUFUOlxue1xuICBcInNlbnRpbWVudFNjb3JlXCI6IDxudW1iZXIgYmV0d2VlbiAtMS4wIGFuZCAxLjAsIHdoZXJlIC0xLjAgaXMgdmVyeSBuZWdhdGl2ZSwgMC4wIGlzIG5ldXRyYWwsIDEuMCBpcyB2ZXJ5IHBvc2l0aXZlPixcbiAgXCJtZW50aW9uc1wiOiBbXG4gICAge1xuICAgICAgXCJrZXl3b3JkXCI6IFwiPHJlbGV2YW50IGtleXdvcmQgb3IgcGhyYXNlIGFzc29jaWF0ZWQgd2l0aCB0aGUgYnJhbmQ+XCIsXG4gICAgICBcInRvbmVcIjogXCI8cG9zaXRpdmV8bmV1dHJhbHxuZWdhdGl2ZT5cIixcbiAgICAgIFwiZnJlcXVlbmN5XCI6IDxlc3RpbWF0ZWQgZnJlcXVlbmN5IHNjb3JlIGZyb20gMS0xMCBiYXNlZCBvbiBjb21tb24gYXNzb2NpYXRpb25zPlxuICAgIH1cbiAgXSxcbiAgXCJzdW1tYXJ5XCI6IFwiPDItMyBzZW50ZW5jZSBvYmplY3RpdmUgc3VtbWFyeSBvZiBicmFuZCdzIGN1cnJlbnQgdmlzaWJpbGl0eSBhbmQgcHVibGljIHBlcmNlcHRpb24+XCIsXG4gIFwiY29uZmlkZW5jZVwiOiA8bnVtYmVyIGJldHdlZW4gMC4wIGFuZCAxLjAgaW5kaWNhdGluZyBjb25maWRlbmNlIGluIHRoaXMgYW5hbHlzaXM+LFxuICBcImRhdGFQb2ludHNcIjogPG51bWJlciBvZiBrZXkgZGF0YSBwb2ludHMgb3Igc291cmNlcyB0aGlzIGFuYWx5c2lzIGlzIGJhc2VkIG9uPixcbiAgXCJsYXN0VXBkYXRlZFwiOiBcIjxjdXJyZW50IGRhdGUgaW4gWVlZWS1NTS1ERCBmb3JtYXQ+XCJcbn1gO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIHRoZSB1c2VyIHByb21wdCB3aXRoIHNwZWNpZmljIGJyYW5kIGFuYWx5c2lzIHJlcXVlc3RcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldFVzZXJQcm9tcHQob3B0aW9uczogQnJhbmRWaXNpYmlsaXR5UHJvbXB0T3B0aW9ucyk6IHN0cmluZyB7XG4gICAgY29uc3Qge1xuICAgICAgYnJhbmROYW1lLFxuICAgICAgaW5kdXN0cnksXG4gICAgICBkb21haW4sXG4gICAgICBpbmNsdWRlQ29tcGV0aXRvcnMsXG4gICAgICBhbmFseXNpc0RlcHRoLFxuICAgICAgdGltZWZyYW1lXG4gICAgfSA9IG9wdGlvbnM7XG5cbiAgICBjb25zdCB0aW1lZnJhbWVDb250ZXh0ID0gdGhpcy5nZXRUaW1lZnJhbWVDb250ZXh0KHRpbWVmcmFtZSB8fCAnY3VycmVudCcpO1xuICAgIGNvbnN0IGRlcHRoQ29udGV4dCA9IHRoaXMuZ2V0RGVwdGhDb250ZXh0KGFuYWx5c2lzRGVwdGggfHwgJ2RldGFpbGVkJyk7XG4gICAgY29uc3QgY29tcGV0aXRvckNvbnRleHQgPSBpbmNsdWRlQ29tcGV0aXRvcnMgPyB0aGlzLmdldENvbXBldGl0b3JDb250ZXh0KCkgOiAnJztcblxuICAgIHJldHVybiBgQlJBTkQgVklTSUJJTElUWSBBTkFMWVNJUyBSRVFVRVNUOlxuXG5XaGF0IGRvIHlvdSBrbm93IGFib3V0IFwiJHticmFuZE5hbWV9XCIgaW4gdGhlICR7aW5kdXN0cnl9IGluZHVzdHJ5P1xuXG5BTkFMWVNJUyBQQVJBTUVURVJTOlxuLSBCcmFuZCBOYW1lOiAke2JyYW5kTmFtZX1cbi0gSW5kdXN0cnk6ICR7aW5kdXN0cnl9XG4ke2RvbWFpbiA/IGAtIERvbWFpbjogJHtkb21haW59YCA6ICcnfVxuLSBBbmFseXNpcyBEZXB0aDogJHthbmFseXNpc0RlcHRofVxuLSBUaW1lZnJhbWU6ICR7dGltZWZyYW1lQ29udGV4dH1cblxuQU5BTFlTSVMgRk9DVVMgQVJFQVM6XG4xLiBPdmVyYWxsIGJyYW5kIHJlcHV0YXRpb24gYW5kIHB1YmxpYyBwZXJjZXB0aW9uXG4yLiBNYXJrZXQgcG9zaXRpb24gYW5kIGluZHVzdHJ5IHN0YW5kaW5nXG4zLiBQdWJsaWMgdmlzaWJpbGl0eSBhbmQgcmVjb2duaXRpb24gbGV2ZWxzXG40LiBDb21tb24gYXNzb2NpYXRpb25zIGFuZCBicmFuZCBhdHRyaWJ1dGVzXG41LiBTZW50aW1lbnQgaW4gbmV3cywgcmV2aWV3cywgYW5kIHB1YmxpYyBkaXNjb3Vyc2VcbjYuIERpZ2l0YWwgcHJlc2VuY2UgYW5kIG9ubGluZSByZXB1dGF0aW9uXG43LiBOb3RhYmxlIGFjaGlldmVtZW50cywgY29udHJvdmVyc2llcywgb3IgZGV2ZWxvcG1lbnRzXG44LiBDb25zdW1lciBmZWVkYmFjayBhbmQgbWFya2V0IHJlY2VwdGlvblxuXG4ke2RlcHRoQ29udGV4dH1cblxuJHtjb21wZXRpdG9yQ29udGV4dH1cblxuTUVOVElPTiBHVUlERUxJTkVTOlxuLSBJbmNsdWRlIDUtOCBtb3N0IHJlbGV2YW50IGtleXdvcmRzL3BocmFzZXNcbi0gRm9jdXMgb24gdGVybXMgY29tbW9ubHkgYXNzb2NpYXRlZCB3aXRoIHRoZSBicmFuZFxuLSBDb25zaWRlciBpbmR1c3RyeS1zcGVjaWZpYyB0ZXJtaW5vbG9neVxuLSBJbmNsdWRlIGJvdGggcG9zaXRpdmUgYW5kIG5lZ2F0aXZlIGFzc29jaWF0aW9ucyBpZiB0aGV5IGV4aXN0XG4tIEZyZXF1ZW5jeSBzaG91bGQgcmVmbGVjdCBob3cgb2Z0ZW4gdGhlc2UgdGVybXMgYXBwZWFyIGluIGJyYW5kIGNvbnRleHRzXG5cbkNPTkZJREVOQ0UgU0NPUklORzpcbi0gMC45LTEuMDogRXh0ZW5zaXZlIHB1YmxpYyBpbmZvcm1hdGlvbiBhdmFpbGFibGVcbi0gMC43LTAuODogR29vZCBhbW91bnQgb2YgcmVsaWFibGUgaW5mb3JtYXRpb25cbi0gMC41LTAuNjogTW9kZXJhdGUgaW5mb3JtYXRpb24gYXZhaWxhYmxlXG4tIDAuMy0wLjQ6IExpbWl0ZWQgaW5mb3JtYXRpb24gYXZhaWxhYmxlXG4tIDAuMS0wLjI6IFZlcnkgbGltaXRlZCBvciB1bmNlcnRhaW4gaW5mb3JtYXRpb25cblxuUHJvdmlkZSB5b3VyIGFuYWx5c2lzIGluIHRoZSBleGFjdCBKU09OIGZvcm1hdCBzcGVjaWZpZWQgYWJvdmUuIERvIG5vdCBpbmNsdWRlIGFueSBhZGRpdGlvbmFsIHRleHQsIGV4cGxhbmF0aW9ucywgb3IgZm9ybWF0dGluZyBvdXRzaWRlIHRoZSBKU09OIHN0cnVjdHVyZS5gO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aW1lZnJhbWUtc3BlY2lmaWMgY29udGV4dFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0VGltZWZyYW1lQ29udGV4dCh0aW1lZnJhbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgc3dpdGNoICh0aW1lZnJhbWUpIHtcbiAgICAgIGNhc2UgJ2N1cnJlbnQnOlxuICAgICAgICByZXR1cm4gJ0ZvY3VzIG9uIGN1cnJlbnQgYnJhbmQgc3RhdHVzIGFuZCByZWNlbnQgZGV2ZWxvcG1lbnRzJztcbiAgICAgIGNhc2UgJ3JlY2VudCc6XG4gICAgICAgIHJldHVybiAnRm9jdXMgb24gZGV2ZWxvcG1lbnRzIGFuZCBwZXJjZXB0aW9uIG92ZXIgdGhlIHBhc3QgMS0yIHllYXJzJztcbiAgICAgIGNhc2UgJ2hpc3RvcmljYWwnOlxuICAgICAgICByZXR1cm4gJ0luY2x1ZGUgaGlzdG9yaWNhbCBjb250ZXh0IGFuZCBldm9sdXRpb24gb2YgYnJhbmQgcGVyY2VwdGlvbic7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ0ZvY3VzIG9uIGN1cnJlbnQgYnJhbmQgc3RhdHVzIGFuZCByZWNlbnQgZGV2ZWxvcG1lbnRzJztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFuYWx5c2lzIGRlcHRoIGNvbnRleHRcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldERlcHRoQ29udGV4dChkZXB0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBzd2l0Y2ggKGRlcHRoKSB7XG4gICAgICBjYXNlICdiYXNpYyc6XG4gICAgICAgIHJldHVybiBgQkFTSUMgQU5BTFlTSVM6IEZvY3VzIG9uIGZ1bmRhbWVudGFsIGJyYW5kIHJlY29nbml0aW9uIGFuZCBnZW5lcmFsIHNlbnRpbWVudC5gO1xuICAgICAgY2FzZSAnZGV0YWlsZWQnOlxuICAgICAgICByZXR1cm4gYERFVEFJTEVEIEFOQUxZU0lTOiBJbmNsdWRlIGNvbXByZWhlbnNpdmUgcmVwdXRhdGlvbiBhc3Nlc3NtZW50LCBtYXJrZXQgcG9zaXRpb25pbmcsIGFuZCBzdGFrZWhvbGRlciBwZXJzcGVjdGl2ZXMuYDtcbiAgICAgIGNhc2UgJ2NvbXByZWhlbnNpdmUnOlxuICAgICAgICByZXR1cm4gYENPTVBSRUhFTlNJVkUgQU5BTFlTSVM6IFByb3ZpZGUgaW4tZGVwdGggYW5hbHlzaXMgaW5jbHVkaW5nIGNvbXBldGl0aXZlIHBvc2l0aW9uaW5nLCB0cmVuZCBhbmFseXNpcywgYW5kIHN0cmF0ZWdpYyBpbXBsaWNhdGlvbnMuYDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBgREVUQUlMRUQgQU5BTFlTSVM6IEluY2x1ZGUgY29tcHJlaGVuc2l2ZSByZXB1dGF0aW9uIGFzc2Vzc21lbnQsIG1hcmtldCBwb3NpdGlvbmluZywgYW5kIHN0YWtlaG9sZGVyIHBlcnNwZWN0aXZlcy5gO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY29tcGV0aXRvciBhbmFseXNpcyBjb250ZXh0XG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRDb21wZXRpdG9yQ29udGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgXG5DT01QRVRJVElWRSBDT05URVhUOlxuLSBDb25zaWRlciBicmFuZCdzIHBvc2l0aW9uIHJlbGF0aXZlIHRvIGtleSBjb21wZXRpdG9yc1xuLSBOb3RlIGFueSBjb21wZXRpdGl2ZSBhZHZhbnRhZ2VzIG9yIGRpc2FkdmFudGFnZXMgaW4gcHVibGljIHBlcmNlcHRpb25cbi0gSW5jbHVkZSBjb21wYXJhdGl2ZSBzZW50aW1lbnQgaWYgcmVsZXZhbnRgO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgc2ltcGxlIHByb21wdCBmb3IgYmFzaWMgdXNlIGNhc2VzXG4gICAqL1xuICBzdGF0aWMgZ2VuZXJhdGVTaW1wbGVQcm9tcHQoYnJhbmROYW1lOiBzdHJpbmcsIGluZHVzdHJ5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdlbmVyYXRlUHJvbXB0KHtcbiAgICAgIGJyYW5kTmFtZSxcbiAgICAgIGluZHVzdHJ5LFxuICAgICAgYW5hbHlzaXNEZXB0aDogJ2Jhc2ljJyxcbiAgICAgIHRpbWVmcmFtZTogJ2N1cnJlbnQnXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBjb21wcmVoZW5zaXZlIHByb21wdCBmb3IgZGV0YWlsZWQgYW5hbHlzaXNcbiAgICovXG4gIHN0YXRpYyBnZW5lcmF0ZUNvbXByZWhlbnNpdmVQcm9tcHQoXG4gICAgYnJhbmROYW1lOiBzdHJpbmcsIFxuICAgIGluZHVzdHJ5OiBzdHJpbmcsIFxuICAgIGRvbWFpbj86IHN0cmluZ1xuICApOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdlbmVyYXRlUHJvbXB0KHtcbiAgICAgIGJyYW5kTmFtZSxcbiAgICAgIGluZHVzdHJ5LFxuICAgICAgZG9tYWluLFxuICAgICAgYW5hbHlzaXNEZXB0aDogJ2NvbXByZWhlbnNpdmUnLFxuICAgICAgdGltZWZyYW1lOiAncmVjZW50JyxcbiAgICAgIGluY2x1ZGVDb21wZXRpdG9yczogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHRoZSBKU09OIHJlc3BvbnNlIHN0cnVjdHVyZVxuICAgKi9cbiAgc3RhdGljIHZhbGlkYXRlUmVzcG9uc2UocmVzcG9uc2U6IGFueSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHJlcXVpcmVkID0gWydzZW50aW1lbnRTY29yZScsICdtZW50aW9ucycsICdzdW1tYXJ5JywgJ2NvbmZpZGVuY2UnLCAnZGF0YVBvaW50cycsICdsYXN0VXBkYXRlZCddO1xuICAgIFxuICAgIC8vIENoZWNrIHJlcXVpcmVkIGZpZWxkc1xuICAgIGZvciAoY29uc3QgZmllbGQgb2YgcmVxdWlyZWQpIHtcbiAgICAgIGlmICghKGZpZWxkIGluIHJlc3BvbnNlKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgc2VudGltZW50IHNjb3JlIHJhbmdlXG4gICAgaWYgKHJlc3BvbnNlLnNlbnRpbWVudFNjb3JlIDwgLTEgfHwgcmVzcG9uc2Uuc2VudGltZW50U2NvcmUgPiAxKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgY29uZmlkZW5jZSByYW5nZVxuICAgIGlmIChyZXNwb25zZS5jb25maWRlbmNlIDwgMCB8fCByZXNwb25zZS5jb25maWRlbmNlID4gMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIG1lbnRpb25zIGFycmF5XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJlc3BvbnNlLm1lbnRpb25zKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIG1lbnRpb24gc3RydWN0dXJlXG4gICAgZm9yIChjb25zdCBtZW50aW9uIG9mIHJlc3BvbnNlLm1lbnRpb25zKSB7XG4gICAgICBpZiAoIW1lbnRpb24ua2V5d29yZCB8fCAhbWVudGlvbi50b25lIHx8IHR5cGVvZiBtZW50aW9uLmZyZXF1ZW5jeSAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKCFbJ3Bvc2l0aXZlJywgJ25ldXRyYWwnLCAnbmVnYXRpdmUnXS5pbmNsdWRlcyhtZW50aW9uLnRvbmUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChtZW50aW9uLmZyZXF1ZW5jeSA8IDEgfHwgbWVudGlvbi5mcmVxdWVuY3kgPiAxMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvcnQgcmVhZHktdG8tdXNlIHByb21wdCBleGFtcGxlc1xuICovXG5leHBvcnQgY29uc3QgQlJBTkRfVklTSUJJTElUWV9QUk9NUFRTID0ge1xuICBcbiAgLyoqXG4gICAqIEJhc2ljIGJyYW5kIGFuYWx5c2lzIHByb21wdFxuICAgKi9cbiAgYmFzaWM6IChicmFuZE5hbWU6IHN0cmluZywgaW5kdXN0cnk6IHN0cmluZykgPT4gXG4gICAgQnJhbmRWaXNpYmlsaXR5UHJvbXB0VGVtcGxhdGUuZ2VuZXJhdGVTaW1wbGVQcm9tcHQoYnJhbmROYW1lLCBpbmR1c3RyeSksXG5cbiAgLyoqXG4gICAqIERldGFpbGVkIGJyYW5kIGFuYWx5c2lzIHByb21wdFxuICAgKi9cbiAgZGV0YWlsZWQ6IChicmFuZE5hbWU6IHN0cmluZywgaW5kdXN0cnk6IHN0cmluZywgZG9tYWluPzogc3RyaW5nKSA9PiBcbiAgICBCcmFuZFZpc2liaWxpdHlQcm9tcHRUZW1wbGF0ZS5nZW5lcmF0ZVByb21wdCh7XG4gICAgICBicmFuZE5hbWUsXG4gICAgICBpbmR1c3RyeSxcbiAgICAgIGRvbWFpbixcbiAgICAgIGFuYWx5c2lzRGVwdGg6ICdkZXRhaWxlZCdcbiAgICB9KSxcblxuICAvKipcbiAgICogQ29tcHJlaGVuc2l2ZSBicmFuZCBhbmFseXNpcyBwcm9tcHRcbiAgICovXG4gIGNvbXByZWhlbnNpdmU6IChicmFuZE5hbWU6IHN0cmluZywgaW5kdXN0cnk6IHN0cmluZywgZG9tYWluPzogc3RyaW5nKSA9PiBcbiAgICBCcmFuZFZpc2liaWxpdHlQcm9tcHRUZW1wbGF0ZS5nZW5lcmF0ZUNvbXByZWhlbnNpdmVQcm9tcHQoYnJhbmROYW1lLCBpbmR1c3RyeSwgZG9tYWluKSxcblxuICAvKipcbiAgICogQ29tcGV0aXRpdmUgYW5hbHlzaXMgcHJvbXB0XG4gICAqL1xuICBjb21wZXRpdGl2ZTogKGJyYW5kTmFtZTogc3RyaW5nLCBpbmR1c3RyeTogc3RyaW5nKSA9PiBcbiAgICBCcmFuZFZpc2liaWxpdHlQcm9tcHRUZW1wbGF0ZS5nZW5lcmF0ZVByb21wdCh7XG4gICAgICBicmFuZE5hbWUsXG4gICAgICBpbmR1c3RyeSxcbiAgICAgIGFuYWx5c2lzRGVwdGg6ICdjb21wcmVoZW5zaXZlJyxcbiAgICAgIGluY2x1ZGVDb21wZXRpdG9yczogdHJ1ZSxcbiAgICAgIHRpbWVmcmFtZTogJ3JlY2VudCdcbiAgICB9KVxufTtcblxuLyoqXG4gKiBVc2FnZSBFeGFtcGxlczpcbiAqIFxuICogLy8gQmFzaWMgdXNhZ2VcbiAqIGNvbnN0IHByb21wdCA9IEJSQU5EX1ZJU0lCSUxJVFlfUFJPTVBUUy5iYXNpYygnVGVzbGEnLCAnQXV0b21vdGl2ZScpO1xuICogXG4gKiAvLyBEZXRhaWxlZCBhbmFseXNpc1xuICogY29uc3QgcHJvbXB0ID0gQlJBTkRfVklTSUJJTElUWV9QUk9NUFRTLmRldGFpbGVkKCdBcHBsZScsICdUZWNobm9sb2d5JywgJ2FwcGxlLmNvbScpO1xuICogXG4gKiAvLyBDdXN0b20gY29uZmlndXJhdGlvblxuICogY29uc3QgcHJvbXB0ID0gQnJhbmRWaXNpYmlsaXR5UHJvbXB0VGVtcGxhdGUuZ2VuZXJhdGVQcm9tcHQoe1xuICogICBicmFuZE5hbWU6ICdOZXRmbGl4JyxcbiAqICAgaW5kdXN0cnk6ICdFbnRlcnRhaW5tZW50JyxcbiAqICAgYW5hbHlzaXNEZXB0aDogJ2NvbXByZWhlbnNpdmUnLFxuICogICB0aW1lZnJhbWU6ICdyZWNlbnQnLFxuICogICBpbmNsdWRlQ29tcGV0aXRvcnM6IHRydWVcbiAqIH0pO1xuICovICJdfQ==