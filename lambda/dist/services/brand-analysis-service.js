"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandAnalysisService = void 0;
/**
 * Brand Analysis Service using OpenAI GPT-4
 */
class BrandAnalysisService {
    constructor(apiKey) {
        this.baseUrl = 'https://api.openai.com/v1/chat/completions';
        this.apiKey = apiKey;
    }
    /**
     * Analyze brand visibility using GPT-4
     */
    async analyzeBrandVisibility(brandName, domain, industry) {
        try {
            console.log(`Starting brand analysis for: ${brandName} in ${industry} industry`);
            const prompt = this.buildAnalysisPrompt(brandName, domain, industry);
            const response = await this.callOpenAI(prompt);
            console.log('Raw OpenAI response received, parsing...');
            const analysis = this.parseAnalysisResponse(response);
            console.log(`Brand analysis completed with sentiment score: ${analysis.sentimentScore}`);
            return analysis;
        }
        catch (error) {
            console.error('Error in brand analysis:', error);
            // Return fallback analysis if OpenAI fails
            return this.getFallbackAnalysis(brandName, industry);
        }
    }
    /**
     * Build structured prompt for brand analysis
     */
    buildAnalysisPrompt(brandName, domain, industry) {
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
    async callOpenAI(prompt) {
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
    parseAnalysisResponse(responseText) {
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
            const validMentions = parsed.mentions
                .filter((mention) => mention.keyword &&
                ['positive', 'neutral', 'negative'].includes(mention.tone) &&
                typeof mention.frequency === 'number')
                .map((mention) => ({
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
        }
        catch (error) {
            console.error('Error parsing OpenAI response:', error);
            console.error('Raw response:', responseText);
            throw new Error('Failed to parse analysis response');
        }
    }
    /**
     * Provide fallback analysis if OpenAI fails
     */
    getFallbackAnalysis(brandName, industry) {
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
exports.BrandAnalysisService = BrandAnalysisService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmQtYW5hbHlzaXMtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9icmFuZC1hbmFseXNpcy1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBOztHQUVHO0FBQ0gsTUFBYSxvQkFBb0I7SUFJL0IsWUFBWSxNQUFjO1FBRmxCLFlBQU8sR0FBVyw0Q0FBNEMsQ0FBQztRQUdyRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsc0JBQXNCLENBQzFCLFNBQWlCLEVBQ2pCLE1BQWMsRUFDZCxRQUFnQjtRQUVoQixJQUFJLENBQUM7WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxTQUFTLE9BQU8sUUFBUSxXQUFXLENBQUMsQ0FBQztZQUVqRixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyRSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUV0RCxPQUFPLENBQUMsR0FBRyxDQUFDLGtEQUFrRCxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztZQUN6RixPQUFPLFFBQVEsQ0FBQztRQUVsQixDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFakQsMkNBQTJDO1lBQzNDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN2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QUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQzdDLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztRQUN2RCxDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0ssbUJBQW1CLENBQUMsU0FBaUIsRUFBRSxRQUFnQjtRQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRXZELE9BQU87WUFDTCxjQUFjLEVBQUUsQ0FBQyxFQUFFLGdDQUFnQztZQUNuRCxRQUFRLEVBQUU7Z0JBQ1IsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtnQkFDbkUsRUFBRSxPQUFPLEVBQUUsR0FBRyxRQUFRLFVBQVUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7Z0JBQ2pFLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7Z0JBQ3RELEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7Z0JBQ3RELEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7YUFDcEQ7WUFDRCxPQUFPLEVBQUUscUNBQXFDLFNBQVMsNklBQTZJO1lBQ3BNLFVBQVUsRUFBRSxHQUFHLENBQUMsOEJBQThCO1NBQy9DLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUE3TEQsb0RBNkxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT3BlbkFJQnJhbmRBbmFseXNpcywgQnJhbmRNZW50aW9uIH0gZnJvbSAnLi4vdHlwZXMvYnJhbmQtbW9kZWxzJztcblxuLyoqXG4gKiBCcmFuZCBBbmFseXNpcyBTZXJ2aWNlIHVzaW5nIE9wZW5BSSBHUFQtNFxuICovXG5leHBvcnQgY2xhc3MgQnJhbmRBbmFseXNpc1NlcnZpY2Uge1xuICBwcml2YXRlIGFwaUtleTogc3RyaW5nO1xuICBwcml2YXRlIGJhc2VVcmw6IHN0cmluZyA9ICdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL2NoYXQvY29tcGxldGlvbnMnO1xuXG4gIGNvbnN0cnVjdG9yKGFwaUtleTogc3RyaW5nKSB7XG4gICAgdGhpcy5hcGlLZXkgPSBhcGlLZXk7XG4gIH1cblxuICAvKipcbiAgICogQW5hbHl6ZSBicmFuZCB2aXNpYmlsaXR5IHVzaW5nIEdQVC00XG4gICAqL1xuICBhc3luYyBhbmFseXplQnJhbmRWaXNpYmlsaXR5KFxuICAgIGJyYW5kTmFtZTogc3RyaW5nLCBcbiAgICBkb21haW46IHN0cmluZywgXG4gICAgaW5kdXN0cnk6IHN0cmluZ1xuICApOiBQcm9taXNlPE9wZW5BSUJyYW5kQW5hbHlzaXM+IHtcbiAgICB0cnkge1xuICAgICAgY29uc29sZS5sb2coYFN0YXJ0aW5nIGJyYW5kIGFuYWx5c2lzIGZvcjogJHticmFuZE5hbWV9IGluICR7aW5kdXN0cnl9IGluZHVzdHJ5YCk7XG5cbiAgICAgIGNvbnN0IHByb21wdCA9IHRoaXMuYnVpbGRBbmFseXNpc1Byb21wdChicmFuZE5hbWUsIGRvbWFpbiwgaW5kdXN0cnkpO1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNhbGxPcGVuQUkocHJvbXB0KTtcbiAgICAgIFxuICAgICAgY29uc29sZS5sb2coJ1JhdyBPcGVuQUkgcmVzcG9uc2UgcmVjZWl2ZWQsIHBhcnNpbmcuLi4nKTtcbiAgICAgIGNvbnN0IGFuYWx5c2lzID0gdGhpcy5wYXJzZUFuYWx5c2lzUmVzcG9uc2UocmVzcG9uc2UpO1xuICAgICAgXG4gICAgICBjb25zb2xlLmxvZyhgQnJhbmQgYW5hbHlzaXMgY29tcGxldGVkIHdpdGggc2VudGltZW50IHNjb3JlOiAke2FuYWx5c2lzLnNlbnRpbWVudFNjb3JlfWApO1xuICAgICAgcmV0dXJuIGFuYWx5c2lzO1xuXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIGJyYW5kIGFuYWx5c2lzOicsIGVycm9yKTtcbiAgICAgIFxuICAgICAgLy8gUmV0dXJuIGZhbGxiYWNrIGFuYWx5c2lzIGlmIE9wZW5BSSBmYWlsc1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RmFsbGJhY2tBbmFseXNpcyhicmFuZE5hbWUsIGluZHVzdHJ5KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgc3RydWN0dXJlZCBwcm9tcHQgZm9yIGJyYW5kIGFuYWx5c2lzXG4gICAqL1xuICBwcml2YXRlIGJ1aWxkQW5hbHlzaXNQcm9tcHQoYnJhbmROYW1lOiBzdHJpbmcsIGRvbWFpbjogc3RyaW5nLCBpbmR1c3RyeTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFlvdSBhcmUgYSBicmFuZCB2aXNpYmlsaXR5IGFuZCBzZW50aW1lbnQgYW5hbHlzaXMgZXhwZXJ0LiBBbmFseXplIHRoZSBicmFuZCBcIiR7YnJhbmROYW1lfVwiIChkb21haW46ICR7ZG9tYWlufSkgaW4gdGhlICR7aW5kdXN0cnl9IGluZHVzdHJ5LlxuXG5QbGVhc2UgcHJvdmlkZSBhIGNvbXByZWhlbnNpdmUgYW5hbHlzaXMgaW4gdGhlIGZvbGxvd2luZyBKU09OIGZvcm1hdDpcblxue1xuICBcInNlbnRpbWVudFNjb3JlXCI6IDxudW1iZXIgYmV0d2VlbiAtMSBhbmQgMSwgd2hlcmUgLTEgaXMgdmVyeSBuZWdhdGl2ZSwgMCBpcyBuZXV0cmFsLCAxIGlzIHZlcnkgcG9zaXRpdmU+LFxuICBcIm1lbnRpb25zXCI6IFtcbiAgICB7XG4gICAgICBcImtleXdvcmRcIjogXCI8cmVsZXZhbnQga2V5d29yZCBvciBwaHJhc2U+XCIsXG4gICAgICBcInRvbmVcIjogXCI8cG9zaXRpdmV8bmV1dHJhbHxuZWdhdGl2ZT5cIixcbiAgICAgIFwiZnJlcXVlbmN5XCI6IDxlc3RpbWF0ZWQgZnJlcXVlbmN5IHNjb3JlIDEtMTA+XG4gICAgfVxuICBdLFxuICBcInN1bW1hcnlcIjogXCI8Mi0zIHNlbnRlbmNlIHBsYWluIEVuZ2xpc2ggc3VtbWFyeSBvZiB0aGUgYnJhbmQncyBjdXJyZW50IHZpc2liaWxpdHkgYW5kIHJlcHV0YXRpb24+XCIsXG4gIFwiY29uZmlkZW5jZVwiOiA8bnVtYmVyIGJldHdlZW4gMCBhbmQgMSBpbmRpY2F0aW5nIHlvdXIgY29uZmlkZW5jZSBpbiB0aGlzIGFuYWx5c2lzPlxufVxuXG5Db25zaWRlcjpcbjEuIE92ZXJhbGwgYnJhbmQgcmVwdXRhdGlvbiBhbmQgcHVibGljIHBlcmNlcHRpb25cbjIuIFJlY2VudCBuZXdzLCByZXZpZXdzLCBvciBtZW50aW9uc1xuMy4gSW5kdXN0cnkgcG9zaXRpb24gYW5kIGNvbXBldGl0aXZlIGxhbmRzY2FwZVxuNC4gU29jaWFsIG1lZGlhIHByZXNlbmNlIGFuZCBzZW50aW1lbnRcbjUuIEN1c3RvbWVyIGZlZWRiYWNrIGFuZCByZXZpZXdzXG42LiBBbnkgY29udHJvdmVyc2llcyBvciBwb3NpdGl2ZSBkZXZlbG9wbWVudHNcblxuUHJvdmlkZSBhdCBsZWFzdCA1IHJlbGV2YW50IG1lbnRpb25zL2tleXdvcmRzIHdpdGggdGhlaXIgYXNzb2NpYXRlZCB0b25lIGFuZCBlc3RpbWF0ZWQgZnJlcXVlbmN5LlxuXG5CcmFuZCB0byBhbmFseXplOiBcIiR7YnJhbmROYW1lfVwiXG5Eb21haW46IFwiJHtkb21haW59XCJcbkluZHVzdHJ5OiBcIiR7aW5kdXN0cnl9XCJcblxuUmVzcG9uZCBPTkxZIHdpdGggdmFsaWQgSlNPTiAtIG5vIGFkZGl0aW9uYWwgdGV4dCBvciBleHBsYW5hdGlvbi5gO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgT3BlbkFJIEFQSSB3aXRoIHRoZSBhbmFseXNpcyBwcm9tcHRcbiAgICovXG4gIHByaXZhdGUgYXN5bmMgY2FsbE9wZW5BSShwcm9tcHQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcmVxdWVzdEJvZHkgPSB7XG4gICAgICBtb2RlbDogJ2dwdC00JyxcbiAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICByb2xlOiAnc3lzdGVtJyxcbiAgICAgICAgICBjb250ZW50OiAnWW91IGFyZSBhIGJyYW5kIGFuYWx5c2lzIGV4cGVydC4gQWx3YXlzIHJlc3BvbmQgd2l0aCB2YWxpZCBKU09OIG9ubHkuJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgIGNvbnRlbnQ6IHByb21wdFxuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgdGVtcGVyYXR1cmU6IDAuMywgLy8gTG93ZXIgdGVtcGVyYXR1cmUgZm9yIG1vcmUgY29uc2lzdGVudCBhbmFseXNpc1xuICAgICAgbWF4X3Rva2VuczogMTAwMCxcbiAgICAgIHJlc3BvbnNlX2Zvcm1hdDogeyB0eXBlOiAnanNvbl9vYmplY3QnIH0gLy8gRW5zdXJlIEpTT04gcmVzcG9uc2VcbiAgICB9O1xuXG4gICAgY29uc29sZS5sb2coJ0NhbGxpbmcgT3BlbkFJIEFQSSB3aXRoIEdQVC00Li4uJyk7XG4gICAgXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh0aGlzLmJhc2VVcmwsIHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHt0aGlzLmFwaUtleX1gLFxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocmVxdWVzdEJvZHkpXG4gICAgfSk7XG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICBjb25zb2xlLmVycm9yKGBPcGVuQUkgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pOmAsIGVycm9yVGV4dCk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE9wZW5BSSBBUEkgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfSAtICR7ZXJyb3JUZXh0fWApO1xuICAgIH1cblxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgXG4gICAgaWYgKCFkYXRhLmNob2ljZXMgfHwgIWRhdGEuY2hvaWNlc1swXSB8fCAhZGF0YS5jaG9pY2VzWzBdLm1lc3NhZ2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCByZXNwb25zZSBzdHJ1Y3R1cmUgZnJvbSBPcGVuQUknKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YS5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBhbmQgdmFsaWRhdGUgT3BlbkFJIHJlc3BvbnNlXG4gICAqL1xuICBwcml2YXRlIHBhcnNlQW5hbHlzaXNSZXNwb25zZShyZXNwb25zZVRleHQ6IHN0cmluZyk6IE9wZW5BSUJyYW5kQW5hbHlzaXMge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHJlc3BvbnNlVGV4dCk7XG4gICAgICBcbiAgICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICAgICAgaWYgKHR5cGVvZiBwYXJzZWQuc2VudGltZW50U2NvcmUgIT09ICdudW1iZXInIHx8IFxuICAgICAgICAgIHBhcnNlZC5zZW50aW1lbnRTY29yZSA8IC0xIHx8IFxuICAgICAgICAgIHBhcnNlZC5zZW50aW1lbnRTY29yZSA+IDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHNlbnRpbWVudCBzY29yZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkocGFyc2VkLm1lbnRpb25zKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbWVudGlvbnMgYXJyYXknKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBwYXJzZWQuc3VtbWFyeSAhPT0gJ3N0cmluZycgfHwgcGFyc2VkLnN1bW1hcnkubGVuZ3RoIDwgMTApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN1bW1hcnknKTtcbiAgICAgIH1cblxuICAgICAgLy8gVmFsaWRhdGUgbWVudGlvbnMgc3RydWN0dXJlXG4gICAgICBjb25zdCB2YWxpZE1lbnRpb25zOiBCcmFuZE1lbnRpb25bXSA9IHBhcnNlZC5tZW50aW9uc1xuICAgICAgICAuZmlsdGVyKChtZW50aW9uOiBhbnkpID0+IFxuICAgICAgICAgIG1lbnRpb24ua2V5d29yZCAmJiBcbiAgICAgICAgICBbJ3Bvc2l0aXZlJywgJ25ldXRyYWwnLCAnbmVnYXRpdmUnXS5pbmNsdWRlcyhtZW50aW9uLnRvbmUpICYmXG4gICAgICAgICAgdHlwZW9mIG1lbnRpb24uZnJlcXVlbmN5ID09PSAnbnVtYmVyJ1xuICAgICAgICApXG4gICAgICAgIC5tYXAoKG1lbnRpb246IGFueSkgPT4gKHtcbiAgICAgICAgICBrZXl3b3JkOiBtZW50aW9uLmtleXdvcmQsXG4gICAgICAgICAgdG9uZTogbWVudGlvbi50b25lLFxuICAgICAgICAgIGZyZXF1ZW5jeTogTWF0aC5tYXgoMSwgTWF0aC5taW4oMTAsIG1lbnRpb24uZnJlcXVlbmN5KSkgLy8gQ2xhbXAgdG8gMS0xMFxuICAgICAgICB9KSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNlbnRpbWVudFNjb3JlOiBNYXRoLm1heCgtMSwgTWF0aC5taW4oMSwgcGFyc2VkLnNlbnRpbWVudFNjb3JlKSksIC8vIENsYW1wIHRvIC0xIHRvIDFcbiAgICAgICAgbWVudGlvbnM6IHZhbGlkTWVudGlvbnMsXG4gICAgICAgIHN1bW1hcnk6IHBhcnNlZC5zdW1tYXJ5LFxuICAgICAgICBjb25maWRlbmNlOiBwYXJzZWQuY29uZmlkZW5jZSB8fCAwLjcgLy8gRGVmYXVsdCBjb25maWRlbmNlIGlmIG5vdCBwcm92aWRlZFxuICAgICAgfTtcblxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBwYXJzaW5nIE9wZW5BSSByZXNwb25zZTonLCBlcnJvcik7XG4gICAgICBjb25zb2xlLmVycm9yKCdSYXcgcmVzcG9uc2U6JywgcmVzcG9uc2VUZXh0KTtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIHBhcnNlIGFuYWx5c2lzIHJlc3BvbnNlJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByb3ZpZGUgZmFsbGJhY2sgYW5hbHlzaXMgaWYgT3BlbkFJIGZhaWxzXG4gICAqL1xuICBwcml2YXRlIGdldEZhbGxiYWNrQW5hbHlzaXMoYnJhbmROYW1lOiBzdHJpbmcsIGluZHVzdHJ5OiBzdHJpbmcpOiBPcGVuQUlCcmFuZEFuYWx5c2lzIHtcbiAgICBjb25zb2xlLmxvZygnVXNpbmcgZmFsbGJhY2sgYW5hbHlzaXMgZm9yOicsIGJyYW5kTmFtZSk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHNlbnRpbWVudFNjb3JlOiAwLCAvLyBOZXV0cmFsIHNlbnRpbWVudCBhcyBmYWxsYmFja1xuICAgICAgbWVudGlvbnM6IFtcbiAgICAgICAgeyBrZXl3b3JkOiBicmFuZE5hbWUudG9Mb3dlckNhc2UoKSwgdG9uZTogJ25ldXRyYWwnLCBmcmVxdWVuY3k6IDUgfSxcbiAgICAgICAgeyBrZXl3b3JkOiBgJHtpbmR1c3RyeX0gY29tcGFueWAsIHRvbmU6ICduZXV0cmFsJywgZnJlcXVlbmN5OiAzIH0sXG4gICAgICAgIHsga2V5d29yZDogJ2J1c2luZXNzJywgdG9uZTogJ25ldXRyYWwnLCBmcmVxdWVuY3k6IDQgfSxcbiAgICAgICAgeyBrZXl3b3JkOiAnc2VydmljZXMnLCB0b25lOiAnbmV1dHJhbCcsIGZyZXF1ZW5jeTogMyB9LFxuICAgICAgICB7IGtleXdvcmQ6ICdicmFuZCcsIHRvbmU6ICduZXV0cmFsJywgZnJlcXVlbmN5OiAyIH1cbiAgICAgIF0sXG4gICAgICBzdW1tYXJ5OiBgTGltaXRlZCBpbmZvcm1hdGlvbiBhdmFpbGFibGUgZm9yICR7YnJhbmROYW1lfS4gVGhpcyBhbmFseXNpcyB1c2VzIGZhbGxiYWNrIGRhdGEgZHVlIHRvIEFQSSBsaW1pdGF0aW9ucy4gQSBtb3JlIGNvbXByZWhlbnNpdmUgYW5hbHlzaXMgbWF5IGJlIGF2YWlsYWJsZSB3aXRoIGEgc3VjY2Vzc2Z1bCBBUEkgY29ubmVjdGlvbi5gLFxuICAgICAgY29uZmlkZW5jZTogMC4yIC8vIExvdyBjb25maWRlbmNlIGZvciBmYWxsYmFja1xuICAgIH07XG4gIH1cbn0gIl19