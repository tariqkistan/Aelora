"use strict";
/**
 * Enhanced AI service with smart content extraction and industry-specific analysis
 * Provides high-value insights while maintaining cost efficiency
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeWithAI = analyzeWithAI;
const analysis_templates_1 = require("./analysis-templates");
/**
 * Analyze content using smart extraction and industry-specific templates
 */
async function analyzeWithAI(extractedContent, url) {
    try {
        // Check if OpenAI API key is available
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY not set, returning enhanced mock data');
            return generateEnhancedMockAnalysis(extractedContent);
        }
        console.log(`Performing AI analysis for ${extractedContent.contentType} content (${extractedContent.wordCount} words)`);
        // Get industry-specific analysis template
        const template = (0, analysis_templates_1.getAnalysisTemplate)(extractedContent);
        // Create focused prompt using extracted content
        const prompt = createFocusedPrompt(extractedContent, template);
        try {
            // Use GPT-3.5-turbo for cost efficiency (can upgrade to GPT-4 for premium users)
            const model = process.env.USE_GPT4 === 'true' ? 'gpt-4-turbo' : 'gpt-3.5-turbo';
            console.log(`Using model: ${model}`);
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: 'system',
                            content: template.systemPrompt
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.3,
                    max_tokens: model === 'gpt-4-turbo' ? 2000 : 1500 // Adjust based on model
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`OpenAI API error (${response.status}):`, errorText);
                console.warn('Falling back to enhanced mock data');
                return generateEnhancedMockAnalysis(extractedContent);
            }
            const data = await response.json();
            console.log('OpenAI response received');
            if (!data.choices || data.choices.length === 0) {
                console.error('No response choices from OpenAI');
                return generateEnhancedMockAnalysis(extractedContent);
            }
            const aiResponse = data.choices[0]?.message?.content || '';
            // Parse JSON response and enhance with metadata
            try {
                const parsedResult = JSON.parse(aiResponse);
                return enhanceAIResult(parsedResult, extractedContent);
            }
            catch (parseError) {
                console.error('Error parsing AI response:', parseError);
                console.error('Raw response:', aiResponse);
                return generateEnhancedMockAnalysis(extractedContent);
            }
        }
        catch (apiError) {
            console.error('Error in OpenAI API call:', apiError);
            return generateEnhancedMockAnalysis(extractedContent);
        }
    }
    catch (error) {
        console.error('Error in AI analysis:', error);
        return generateEnhancedMockAnalysis(extractedContent);
    }
}
/**
 * Create focused prompt using extracted content and industry template
 */
function createFocusedPrompt(extractedContent, template) {
    return `${template.analysisPrompt}

CONTENT TO ANALYZE:
${extractedContent.priorityContent}

ANALYSIS CONTEXT:
- Content Type: ${extractedContent.contentType}
- Word Count: ${extractedContent.wordCount}
- Has Call-to-Actions: ${extractedContent.callToActions.length > 0}
- Key Features Listed: ${extractedContent.listItems.length}

Please provide your analysis in the following JSON format:
{
  "overall_score": <number from 1-10>,
  "areas": [
    {"name": "Content Clarity", "score": <1-10>, "explanation": "<specific analysis>"},
    {"name": "Value Proposition", "score": <1-10>, "explanation": "<specific analysis>"},
    {"name": "Trust Signals", "score": <1-10>, "explanation": "<specific analysis>"},
    {"name": "AI Optimization", "score": <1-10>, "explanation": "<specific analysis>"}
  ],
  "suggestions": [
    {
      "title": "<specific recommendation>",
      "description": "<what to do>",
      "rationale": "<why this helps>",
      "example": "<concrete example>",
      "expected_impact": "<specific expected outcome>",
      "priority": "<high|medium|low>"
    }
  ],
  "quick_wins": [
    {
      "action": "<simple action to take>",
      "impact": "<expected result>",
      "effort": "<low|medium|high>"
    }
  ]
}

Focus on actionable, specific recommendations that will directly impact business results and AI search visibility.`;
}
/**
 * Enhance AI result with additional metadata and context
 */
function enhanceAIResult(aiResult, extractedContent) {
    return {
        ...aiResult,
        content_type: extractedContent.contentType,
        industry: detectIndustryFromContent(extractedContent),
        // Ensure all required fields are present
        areas: aiResult.areas || [],
        suggestions: aiResult.suggestions || [],
        quick_wins: aiResult.quick_wins || []
    };
}
/**
 * Detect industry from extracted content
 */
function detectIndustryFromContent(content) {
    const allText = [
        content.title,
        content.metaDescription,
        ...content.headings.h1,
        ...content.headings.h2,
        ...content.keyParagraphs.slice(0, 3)
    ].join(' ').toLowerCase();
    if (allText.includes('ecommerce') || allText.includes('shop') || allText.includes('buy'))
        return 'E-commerce';
    if (allText.includes('saas') || allText.includes('software') || allText.includes('platform'))
        return 'SaaS';
    if (allText.includes('consulting') || allText.includes('agency') || allText.includes('professional'))
        return 'Professional Services';
    if (allText.includes('health') || allText.includes('medical') || allText.includes('clinic'))
        return 'Healthcare';
    if (allText.includes('local') || allText.includes('location') || allText.includes('address'))
        return 'Local Business';
    return 'General Business';
}
/**
 * Generate enhanced mock analysis with industry-specific insights
 */
function generateEnhancedMockAnalysis(extractedContent) {
    const contentType = extractedContent.contentType;
    const industry = detectIndustryFromContent(extractedContent);
    // Generate contextual scores based on content analysis
    const hasGoodStructure = extractedContent.headings.h2.length >= 3;
    const hasCallToActions = extractedContent.callToActions.length > 0;
    const hasFeatures = extractedContent.listItems.length > 5;
    const hasMetaDescription = extractedContent.metaDescription.length > 50;
    const baseScore = 6;
    const structureBonus = hasGoodStructure ? 1 : 0;
    const ctaBonus = hasCallToActions ? 0.5 : 0;
    const featuresBonus = hasFeatures ? 0.5 : 0;
    const metaBonus = hasMetaDescription ? 0.5 : 0;
    const overallScore = Math.min(10, baseScore + structureBonus + ctaBonus + featuresBonus + metaBonus);
    return {
        overall_score: Math.round(overallScore * 10) / 10,
        content_type: contentType,
        industry,
        areas: [
            {
                name: "Content Clarity",
                score: hasGoodStructure ? 8 : 6,
                explanation: hasGoodStructure
                    ? "Content has clear heading structure that helps users and AI understand the information hierarchy."
                    : "Content structure could be improved with more descriptive headings and better organization."
            },
            {
                name: "Value Proposition",
                score: hasFeatures ? 7 : 5,
                explanation: hasFeatures
                    ? "Page includes specific features and benefits, but could be more prominent and benefit-focused."
                    : "Value proposition needs to be clearer and more prominently displayed to improve conversion potential."
            },
            {
                name: "Trust Signals",
                score: 6,
                explanation: "Consider adding more trust elements like testimonials, certifications, or social proof to build credibility."
            },
            {
                name: "AI Optimization",
                score: hasMetaDescription ? 7 : 5,
                explanation: hasMetaDescription
                    ? "Basic SEO elements are present, but content could be more structured for AI understanding."
                    : "Missing key SEO elements like meta description. Content needs better structure for AI search engines."
            }
        ],
        suggestions: generateContextualSuggestions(extractedContent, contentType, industry),
        quick_wins: generateQuickWins(extractedContent)
    };
}
/**
 * Generate contextual suggestions based on content type and analysis
 */
function generateContextualSuggestions(content, contentType, industry) {
    const suggestions = [];
    // Content type specific suggestions
    if (contentType === 'product') {
        suggestions.push({
            title: "Add Product Benefits Above Features",
            description: "Restructure content to lead with customer benefits before listing technical features.",
            rationale: "AI systems and users both prioritize understanding 'what's in it for me' before technical details.",
            example: "Instead of 'Advanced 256-bit encryption', use 'Keep your data completely secure with bank-level protection'",
            expected_impact: "15-25% improvement in engagement and AI search relevance for benefit-focused queries",
            priority: "high"
        });
    }
    if (contentType === 'service') {
        suggestions.push({
            title: "Include Client Success Metrics",
            description: "Add specific, quantifiable results you've achieved for similar clients.",
            rationale: "Concrete outcomes build trust and help AI systems understand your service effectiveness.",
            example: "Add: 'Helped 50+ businesses increase leads by average of 40% within 6 months'",
            expected_impact: "Higher credibility and better matching for results-focused search queries",
            priority: "high"
        });
    }
    if (contentType === 'blog') {
        suggestions.push({
            title: "Add Actionable Step-by-Step Sections",
            description: "Include numbered lists or step-by-step processes that readers can immediately implement.",
            rationale: "AI systems favor content that provides clear, actionable guidance users can follow.",
            example: "Create sections like 'Step 1: Audit your current setup' with specific instructions",
            expected_impact: "Better AI citation potential and higher user engagement",
            priority: "medium"
        });
    }
    // Universal suggestions based on content analysis
    if (!content.metaDescription || content.metaDescription.length < 120) {
        suggestions.push({
            title: "Optimize Meta Description for AI Search",
            description: "Create a compelling 120-160 character meta description that includes your main value proposition.",
            rationale: "AI search engines use meta descriptions to understand page purpose and display in results.",
            example: "For a consulting page: 'Expert marketing consulting that increases leads by 40%+ for B2B companies. Free strategy session included.'",
            expected_impact: "Better AI search visibility and higher click-through rates",
            priority: "high"
        });
    }
    if (content.callToActions.length === 0) {
        suggestions.push({
            title: "Add Clear Call-to-Action Elements",
            description: "Include specific next steps for visitors who are ready to engage with your business.",
            rationale: "Clear CTAs help AI systems understand user intent and improve conversion tracking.",
            example: "Add buttons like 'Get Free Quote', 'Schedule Consultation', or 'Download Guide'",
            expected_impact: "10-20% improvement in conversion rates and better AI understanding of page purpose",
            priority: "medium"
        });
    }
    return suggestions.slice(0, 4); // Limit to most important suggestions
}
/**
 * Generate quick wins based on content analysis
 */
function generateQuickWins(content) {
    const quickWins = [];
    if (content.headings.h1.length === 0) {
        quickWins.push({
            action: "Add a clear H1 heading that includes your main keyword",
            impact: "Immediate improvement in AI content understanding",
            effort: "low"
        });
    }
    if (content.listItems.length > 0 && content.listItems.length < 5) {
        quickWins.push({
            action: "Expand your feature/benefit list to at least 5-7 items",
            impact: "Better content comprehensiveness for AI analysis",
            effort: "low"
        });
    }
    if (content.keyParagraphs.length > 0) {
        const avgLength = content.keyParagraphs.reduce((sum, p) => sum + p.length, 0) / content.keyParagraphs.length;
        if (avgLength > 200) {
            quickWins.push({
                action: "Break long paragraphs into shorter, scannable chunks",
                impact: "Improved readability for both users and AI systems",
                effort: "low"
            });
        }
    }
    quickWins.push({
        action: "Add FAQ section addressing common customer questions",
        impact: "Higher chance of appearing in AI-powered answer boxes",
        effort: "medium"
    });
    return quickWins.slice(0, 3); // Limit to top quick wins
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWktc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9haS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7O0FBaUNILHNDQStFQztBQTdHRCw2REFBMkQ7QUEyQjNEOztHQUVHO0FBQ0ksS0FBSyxVQUFVLGFBQWEsQ0FBQyxnQkFBa0MsRUFBRSxHQUFXO0lBQ2pGLElBQUksQ0FBQztRQUNILHVDQUF1QztRQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLHNEQUFzRCxDQUFDLENBQUM7WUFDckUsT0FBTyw0QkFBNEIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixnQkFBZ0IsQ0FBQyxXQUFXLGFBQWEsZ0JBQWdCLENBQUMsU0FBUyxTQUFTLENBQUMsQ0FBQztRQUV4SCwwQ0FBMEM7UUFDMUMsTUFBTSxRQUFRLEdBQUcsSUFBQSx3Q0FBbUIsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXZELGdEQUFnRDtRQUNoRCxNQUFNLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUUvRCxJQUFJLENBQUM7WUFDSCxpRkFBaUY7WUFDakYsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQztZQUNoRixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBRXJDLE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLDRDQUE0QyxFQUFFO2dCQUN6RSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxPQUFPLEVBQUU7b0JBQ1AsY0FBYyxFQUFFLGtCQUFrQjtvQkFD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S0FDakIsQ0FBQyxDQUFDO0lBRUgsT0FBTyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBCQUEwQjtBQUMxRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBFbmhhbmNlZCBBSSBzZXJ2aWNlIHdpdGggc21hcnQgY29udGVudCBleHRyYWN0aW9uIGFuZCBpbmR1c3RyeS1zcGVjaWZpYyBhbmFseXNpc1xuICogUHJvdmlkZXMgaGlnaC12YWx1ZSBpbnNpZ2h0cyB3aGlsZSBtYWludGFpbmluZyBjb3N0IGVmZmljaWVuY3lcbiAqL1xuXG5pbXBvcnQgeyBFeHRyYWN0ZWRDb250ZW50IH0gZnJvbSAnLi9jb250ZW50LWV4dHJhY3Rvcic7XG5pbXBvcnQgeyBnZXRBbmFseXNpc1RlbXBsYXRlIH0gZnJvbSAnLi9hbmFseXNpcy10ZW1wbGF0ZXMnO1xuXG4vLyBJbnRlcmZhY2UgZm9yIEFJIGFuYWx5c2lzIHJlc3VsdHNcbmludGVyZmFjZSBBSUFuYWx5c2lzUmVzdWx0IHtcbiAgb3ZlcmFsbF9zY29yZTogbnVtYmVyO1xuICBjb250ZW50X3R5cGU6IHN0cmluZztcbiAgaW5kdXN0cnk6IHN0cmluZztcbiAgYXJlYXM6IEFycmF5PHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgc2NvcmU6IG51bWJlcjtcbiAgICBleHBsYW5hdGlvbjogc3RyaW5nO1xuICB9PjtcbiAgc3VnZ2VzdGlvbnM6IEFycmF5PHtcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgcmF0aW9uYWxlOiBzdHJpbmc7XG4gICAgZXhhbXBsZTogc3RyaW5nO1xuICAgIGV4cGVjdGVkX2ltcGFjdDogc3RyaW5nO1xuICAgIHByaW9yaXR5OiAnaGlnaCcgfCAnbWVkaXVtJyB8ICdsb3cnO1xuICB9PjtcbiAgcXVpY2tfd2luczogQXJyYXk8e1xuICAgIGFjdGlvbjogc3RyaW5nO1xuICAgIGltcGFjdDogc3RyaW5nO1xuICAgIGVmZm9ydDogJ2xvdycgfCAnbWVkaXVtJyB8ICdoaWdoJztcbiAgfT47XG59XG5cbi8qKlxuICogQW5hbHl6ZSBjb250ZW50IHVzaW5nIHNtYXJ0IGV4dHJhY3Rpb24gYW5kIGluZHVzdHJ5LXNwZWNpZmljIHRlbXBsYXRlc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYW5hbHl6ZVdpdGhBSShleHRyYWN0ZWRDb250ZW50OiBFeHRyYWN0ZWRDb250ZW50LCB1cmw6IHN0cmluZyk6IFByb21pc2U8QUlBbmFseXNpc1Jlc3VsdCB8IG51bGw+IHtcbiAgdHJ5IHtcbiAgICAvLyBDaGVjayBpZiBPcGVuQUkgQVBJIGtleSBpcyBhdmFpbGFibGVcbiAgICBpZiAoIXByb2Nlc3MuZW52Lk9QRU5BSV9BUElfS0VZKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ09QRU5BSV9BUElfS0VZIG5vdCBzZXQsIHJldHVybmluZyBlbmhhbmNlZCBtb2NrIGRhdGEnKTtcbiAgICAgIHJldHVybiBnZW5lcmF0ZUVuaGFuY2VkTW9ja0FuYWx5c2lzKGV4dHJhY3RlZENvbnRlbnQpO1xuICAgIH1cbiAgICBcbiAgICBjb25zb2xlLmxvZyhgUGVyZm9ybWluZyBBSSBhbmFseXNpcyBmb3IgJHtleHRyYWN0ZWRDb250ZW50LmNvbnRlbnRUeXBlfSBjb250ZW50ICgke2V4dHJhY3RlZENvbnRlbnQud29yZENvdW50fSB3b3JkcylgKTtcbiAgICBcbiAgICAvLyBHZXQgaW5kdXN0cnktc3BlY2lmaWMgYW5hbHlzaXMgdGVtcGxhdGVcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IGdldEFuYWx5c2lzVGVtcGxhdGUoZXh0cmFjdGVkQ29udGVudCk7XG4gICAgXG4gICAgLy8gQ3JlYXRlIGZvY3VzZWQgcHJvbXB0IHVzaW5nIGV4dHJhY3RlZCBjb250ZW50XG4gICAgY29uc3QgcHJvbXB0ID0gY3JlYXRlRm9jdXNlZFByb21wdChleHRyYWN0ZWRDb250ZW50LCB0ZW1wbGF0ZSk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIC8vIFVzZSBHUFQtMy41LXR1cmJvIGZvciBjb3N0IGVmZmljaWVuY3kgKGNhbiB1cGdyYWRlIHRvIEdQVC00IGZvciBwcmVtaXVtIHVzZXJzKVxuICAgICAgY29uc3QgbW9kZWwgPSBwcm9jZXNzLmVudi5VU0VfR1BUNCA9PT0gJ3RydWUnID8gJ2dwdC00LXR1cmJvJyA6ICdncHQtMy41LXR1cmJvJztcbiAgICAgIGNvbnNvbGUubG9nKGBVc2luZyBtb2RlbDogJHttb2RlbH1gKTtcbiAgICAgIFxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MS9jaGF0L2NvbXBsZXRpb25zJywge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7cHJvY2Vzcy5lbnYuT1BFTkFJX0FQSV9LRVl9YFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgbWVzc2FnZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgIGNvbnRlbnQ6IHRlbXBsYXRlLnN5c3RlbVByb21wdFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICBjb250ZW50OiBwcm9tcHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIHJlc3BvbnNlX2Zvcm1hdDogeyB0eXBlOiBcImpzb25fb2JqZWN0XCIgfSxcbiAgICAgICAgICB0ZW1wZXJhdHVyZTogMC4zLFxuICAgICAgICAgIG1heF90b2tlbnM6IG1vZGVsID09PSAnZ3B0LTQtdHVyYm8nID8gMjAwMCA6IDE1MDAgLy8gQWRqdXN0IGJhc2VkIG9uIG1vZGVsXG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYE9wZW5BSSBBUEkgZXJyb3IgKCR7cmVzcG9uc2Uuc3RhdHVzfSk6YCwgZXJyb3JUZXh0KTtcbiAgICAgICAgY29uc29sZS53YXJuKCdGYWxsaW5nIGJhY2sgdG8gZW5oYW5jZWQgbW9jayBkYXRhJyk7XG4gICAgICAgIHJldHVybiBnZW5lcmF0ZUVuaGFuY2VkTW9ja0FuYWx5c2lzKGV4dHJhY3RlZENvbnRlbnQpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgY29uc29sZS5sb2coJ09wZW5BSSByZXNwb25zZSByZWNlaXZlZCcpO1xuICAgICAgXG4gICAgICBpZiAoIWRhdGEuY2hvaWNlcyB8fCBkYXRhLmNob2ljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIHJlc3BvbnNlIGNob2ljZXMgZnJvbSBPcGVuQUknKTtcbiAgICAgICAgcmV0dXJuIGdlbmVyYXRlRW5oYW5jZWRNb2NrQW5hbHlzaXMoZXh0cmFjdGVkQ29udGVudCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNvbnN0IGFpUmVzcG9uc2UgPSBkYXRhLmNob2ljZXNbMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgfHwgJyc7XG4gICAgICBcbiAgICAgIC8vIFBhcnNlIEpTT04gcmVzcG9uc2UgYW5kIGVuaGFuY2Ugd2l0aCBtZXRhZGF0YVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGFyc2VkUmVzdWx0ID0gSlNPTi5wYXJzZShhaVJlc3BvbnNlKTtcbiAgICAgICAgcmV0dXJuIGVuaGFuY2VBSVJlc3VsdChwYXJzZWRSZXN1bHQsIGV4dHJhY3RlZENvbnRlbnQpO1xuICAgICAgfSBjYXRjaCAocGFyc2VFcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBwYXJzaW5nIEFJIHJlc3BvbnNlOicsIHBhcnNlRXJyb3IpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdSYXcgcmVzcG9uc2U6JywgYWlSZXNwb25zZSk7XG4gICAgICAgIHJldHVybiBnZW5lcmF0ZUVuaGFuY2VkTW9ja0FuYWx5c2lzKGV4dHJhY3RlZENvbnRlbnQpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGFwaUVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBPcGVuQUkgQVBJIGNhbGw6JywgYXBpRXJyb3IpO1xuICAgICAgcmV0dXJuIGdlbmVyYXRlRW5oYW5jZWRNb2NrQW5hbHlzaXMoZXh0cmFjdGVkQ29udGVudCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIEFJIGFuYWx5c2lzOicsIGVycm9yKTtcbiAgICByZXR1cm4gZ2VuZXJhdGVFbmhhbmNlZE1vY2tBbmFseXNpcyhleHRyYWN0ZWRDb250ZW50KTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZSBmb2N1c2VkIHByb21wdCB1c2luZyBleHRyYWN0ZWQgY29udGVudCBhbmQgaW5kdXN0cnkgdGVtcGxhdGVcbiAqL1xuZnVuY3Rpb24gY3JlYXRlRm9jdXNlZFByb21wdChleHRyYWN0ZWRDb250ZW50OiBFeHRyYWN0ZWRDb250ZW50LCB0ZW1wbGF0ZTogYW55KTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3RlbXBsYXRlLmFuYWx5c2lzUHJvbXB0fVxuXG5DT05URU5UIFRPIEFOQUxZWkU6XG4ke2V4dHJhY3RlZENvbnRlbnQucHJpb3JpdHlDb250ZW50fVxuXG5BTkFMWVNJUyBDT05URVhUOlxuLSBDb250ZW50IFR5cGU6ICR7ZXh0cmFjdGVkQ29udGVudC5jb250ZW50VHlwZX1cbi0gV29yZCBDb3VudDogJHtleHRyYWN0ZWRDb250ZW50LndvcmRDb3VudH1cbi0gSGFzIENhbGwtdG8tQWN0aW9uczogJHtleHRyYWN0ZWRDb250ZW50LmNhbGxUb0FjdGlvbnMubGVuZ3RoID4gMH1cbi0gS2V5IEZlYXR1cmVzIExpc3RlZDogJHtleHRyYWN0ZWRDb250ZW50Lmxpc3RJdGVtcy5sZW5ndGh9XG5cblBsZWFzZSBwcm92aWRlIHlvdXIgYW5hbHlzaXMgaW4gdGhlIGZvbGxvd2luZyBKU09OIGZvcm1hdDpcbntcbiAgXCJvdmVyYWxsX3Njb3JlXCI6IDxudW1iZXIgZnJvbSAxLTEwPixcbiAgXCJhcmVhc1wiOiBbXG4gICAge1wibmFtZVwiOiBcIkNvbnRlbnQgQ2xhcml0eVwiLCBcInNjb3JlXCI6IDwxLTEwPiwgXCJleHBsYW5hdGlvblwiOiBcIjxzcGVjaWZpYyBhbmFseXNpcz5cIn0sXG4gICAge1wibmFtZVwiOiBcIlZhbHVlIFByb3Bvc2l0aW9uXCIsIFwic2NvcmVcIjogPDEtMTA+LCBcImV4cGxhbmF0aW9uXCI6IFwiPHNwZWNpZmljIGFuYWx5c2lzPlwifSxcbiAgICB7XCJuYW1lXCI6IFwiVHJ1c3QgU2lnbmFsc1wiLCBcInNjb3JlXCI6IDwxLTEwPiwgXCJleHBsYW5hdGlvblwiOiBcIjxzcGVjaWZpYyBhbmFseXNpcz5cIn0sXG4gICAge1wibmFtZVwiOiBcIkFJIE9wdGltaXphdGlvblwiLCBcInNjb3JlXCI6IDwxLTEwPiwgXCJleHBsYW5hdGlvblwiOiBcIjxzcGVjaWZpYyBhbmFseXNpcz5cIn1cbiAgXSxcbiAgXCJzdWdnZXN0aW9uc1wiOiBbXG4gICAge1xuICAgICAgXCJ0aXRsZVwiOiBcIjxzcGVjaWZpYyByZWNvbW1lbmRhdGlvbj5cIixcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCI8d2hhdCB0byBkbz5cIixcbiAgICAgIFwicmF0aW9uYWxlXCI6IFwiPHdoeSB0aGlzIGhlbHBzPlwiLFxuICAgICAgXCJleGFtcGxlXCI6IFwiPGNvbmNyZXRlIGV4YW1wbGU+XCIsXG4gICAgICBcImV4cGVjdGVkX2ltcGFjdFwiOiBcIjxzcGVjaWZpYyBleHBlY3RlZCBvdXRjb21lPlwiLFxuICAgICAgXCJwcmlvcml0eVwiOiBcIjxoaWdofG1lZGl1bXxsb3c+XCJcbiAgICB9XG4gIF0sXG4gIFwicXVpY2tfd2luc1wiOiBbXG4gICAge1xuICAgICAgXCJhY3Rpb25cIjogXCI8c2ltcGxlIGFjdGlvbiB0byB0YWtlPlwiLFxuICAgICAgXCJpbXBhY3RcIjogXCI8ZXhwZWN0ZWQgcmVzdWx0PlwiLFxuICAgICAgXCJlZmZvcnRcIjogXCI8bG93fG1lZGl1bXxoaWdoPlwiXG4gICAgfVxuICBdXG59XG5cbkZvY3VzIG9uIGFjdGlvbmFibGUsIHNwZWNpZmljIHJlY29tbWVuZGF0aW9ucyB0aGF0IHdpbGwgZGlyZWN0bHkgaW1wYWN0IGJ1c2luZXNzIHJlc3VsdHMgYW5kIEFJIHNlYXJjaCB2aXNpYmlsaXR5LmA7XG59XG5cbi8qKlxuICogRW5oYW5jZSBBSSByZXN1bHQgd2l0aCBhZGRpdGlvbmFsIG1ldGFkYXRhIGFuZCBjb250ZXh0XG4gKi9cbmZ1bmN0aW9uIGVuaGFuY2VBSVJlc3VsdChhaVJlc3VsdDogYW55LCBleHRyYWN0ZWRDb250ZW50OiBFeHRyYWN0ZWRDb250ZW50KTogQUlBbmFseXNpc1Jlc3VsdCB7XG4gIHJldHVybiB7XG4gICAgLi4uYWlSZXN1bHQsXG4gICAgY29udGVudF90eXBlOiBleHRyYWN0ZWRDb250ZW50LmNvbnRlbnRUeXBlLFxuICAgIGluZHVzdHJ5OiBkZXRlY3RJbmR1c3RyeUZyb21Db250ZW50KGV4dHJhY3RlZENvbnRlbnQpLFxuICAgIC8vIEVuc3VyZSBhbGwgcmVxdWlyZWQgZmllbGRzIGFyZSBwcmVzZW50XG4gICAgYXJlYXM6IGFpUmVzdWx0LmFyZWFzIHx8IFtdLFxuICAgIHN1Z2dlc3Rpb25zOiBhaVJlc3VsdC5zdWdnZXN0aW9ucyB8fCBbXSxcbiAgICBxdWlja193aW5zOiBhaVJlc3VsdC5xdWlja193aW5zIHx8IFtdXG4gIH07XG59XG5cbi8qKlxuICogRGV0ZWN0IGluZHVzdHJ5IGZyb20gZXh0cmFjdGVkIGNvbnRlbnRcbiAqL1xuZnVuY3Rpb24gZGV0ZWN0SW5kdXN0cnlGcm9tQ29udGVudChjb250ZW50OiBFeHRyYWN0ZWRDb250ZW50KTogc3RyaW5nIHtcbiAgY29uc3QgYWxsVGV4dCA9IFtcbiAgICBjb250ZW50LnRpdGxlLFxuICAgIGNvbnRlbnQubWV0YURlc2NyaXB0aW9uLFxuICAgIC4uLmNvbnRlbnQuaGVhZGluZ3MuaDEsXG4gICAgLi4uY29udGVudC5oZWFkaW5ncy5oMixcbiAgICAuLi5jb250ZW50LmtleVBhcmFncmFwaHMuc2xpY2UoMCwgMylcbiAgXS5qb2luKCcgJykudG9Mb3dlckNhc2UoKTtcbiAgXG4gIGlmIChhbGxUZXh0LmluY2x1ZGVzKCdlY29tbWVyY2UnKSB8fCBhbGxUZXh0LmluY2x1ZGVzKCdzaG9wJykgfHwgYWxsVGV4dC5pbmNsdWRlcygnYnV5JykpIHJldHVybiAnRS1jb21tZXJjZSc7XG4gIGlmIChhbGxUZXh0LmluY2x1ZGVzKCdzYWFzJykgfHwgYWxsVGV4dC5pbmNsdWRlcygnc29mdHdhcmUnKSB8fCBhbGxUZXh0LmluY2x1ZGVzKCdwbGF0Zm9ybScpKSByZXR1cm4gJ1NhYVMnO1xuICBpZiAoYWxsVGV4dC5pbmNsdWRlcygnY29uc3VsdGluZycpIHx8IGFsbFRleHQuaW5jbHVkZXMoJ2FnZW5jeScpIHx8IGFsbFRleHQuaW5jbHVkZXMoJ3Byb2Zlc3Npb25hbCcpKSByZXR1cm4gJ1Byb2Zlc3Npb25hbCBTZXJ2aWNlcyc7XG4gIGlmIChhbGxUZXh0LmluY2x1ZGVzKCdoZWFsdGgnKSB8fCBhbGxUZXh0LmluY2x1ZGVzKCdtZWRpY2FsJykgfHwgYWxsVGV4dC5pbmNsdWRlcygnY2xpbmljJykpIHJldHVybiAnSGVhbHRoY2FyZSc7XG4gIGlmIChhbGxUZXh0LmluY2x1ZGVzKCdsb2NhbCcpIHx8IGFsbFRleHQuaW5jbHVkZXMoJ2xvY2F0aW9uJykgfHwgYWxsVGV4dC5pbmNsdWRlcygnYWRkcmVzcycpKSByZXR1cm4gJ0xvY2FsIEJ1c2luZXNzJztcbiAgXG4gIHJldHVybiAnR2VuZXJhbCBCdXNpbmVzcyc7XG59XG5cbi8qKlxuICogR2VuZXJhdGUgZW5oYW5jZWQgbW9jayBhbmFseXNpcyB3aXRoIGluZHVzdHJ5LXNwZWNpZmljIGluc2lnaHRzXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRW5oYW5jZWRNb2NrQW5hbHlzaXMoZXh0cmFjdGVkQ29udGVudDogRXh0cmFjdGVkQ29udGVudCk6IEFJQW5hbHlzaXNSZXN1bHQge1xuICBjb25zdCBjb250ZW50VHlwZSA9IGV4dHJhY3RlZENvbnRlbnQuY29udGVudFR5cGU7XG4gIGNvbnN0IGluZHVzdHJ5ID0gZGV0ZWN0SW5kdXN0cnlGcm9tQ29udGVudChleHRyYWN0ZWRDb250ZW50KTtcbiAgXG4gIC8vIEdlbmVyYXRlIGNvbnRleHR1YWwgc2NvcmVzIGJhc2VkIG9uIGNvbnRlbnQgYW5hbHlzaXNcbiAgY29uc3QgaGFzR29vZFN0cnVjdHVyZSA9IGV4dHJhY3RlZENvbnRlbnQuaGVhZGluZ3MuaDIubGVuZ3RoID49IDM7XG4gIGNvbnN0IGhhc0NhbGxUb0FjdGlvbnMgPSBleHRyYWN0ZWRDb250ZW50LmNhbGxUb0FjdGlvbnMubGVuZ3RoID4gMDtcbiAgY29uc3QgaGFzRmVhdHVyZXMgPSBleHRyYWN0ZWRDb250ZW50Lmxpc3RJdGVtcy5sZW5ndGggPiA1O1xuICBjb25zdCBoYXNNZXRhRGVzY3JpcHRpb24gPSBleHRyYWN0ZWRDb250ZW50Lm1ldGFEZXNjcmlwdGlvbi5sZW5ndGggPiA1MDtcbiAgXG4gIGNvbnN0IGJhc2VTY29yZSA9IDY7XG4gIGNvbnN0IHN0cnVjdHVyZUJvbnVzID0gaGFzR29vZFN0cnVjdHVyZSA/IDEgOiAwO1xuICBjb25zdCBjdGFCb251cyA9IGhhc0NhbGxUb0FjdGlvbnMgPyAwLjUgOiAwO1xuICBjb25zdCBmZWF0dXJlc0JvbnVzID0gaGFzRmVhdHVyZXMgPyAwLjUgOiAwO1xuICBjb25zdCBtZXRhQm9udXMgPSBoYXNNZXRhRGVzY3JpcHRpb24gPyAwLjUgOiAwO1xuICBcbiAgY29uc3Qgb3ZlcmFsbFNjb3JlID0gTWF0aC5taW4oMTAsIGJhc2VTY29yZSArIHN0cnVjdHVyZUJvbnVzICsgY3RhQm9udXMgKyBmZWF0dXJlc0JvbnVzICsgbWV0YUJvbnVzKTtcbiAgXG4gIHJldHVybiB7XG4gICAgb3ZlcmFsbF9zY29yZTogTWF0aC5yb3VuZChvdmVyYWxsU2NvcmUgKiAxMCkgLyAxMCxcbiAgICBjb250ZW50X3R5cGU6IGNvbnRlbnRUeXBlLFxuICAgIGluZHVzdHJ5LFxuICAgIGFyZWFzOiBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFwiQ29udGVudCBDbGFyaXR5XCIsXG4gICAgICAgIHNjb3JlOiBoYXNHb29kU3RydWN0dXJlID8gOCA6IDYsXG4gICAgICAgIGV4cGxhbmF0aW9uOiBoYXNHb29kU3RydWN0dXJlIFxuICAgICAgICAgID8gXCJDb250ZW50IGhhcyBjbGVhciBoZWFkaW5nIHN0cnVjdHVyZSB0aGF0IGhlbHBzIHVzZXJzIGFuZCBBSSB1bmRlcnN0YW5kIHRoZSBpbmZvcm1hdGlvbiBoaWVyYXJjaHkuXCJcbiAgICAgICAgICA6IFwiQ29udGVudCBzdHJ1Y3R1cmUgY291bGQgYmUgaW1wcm92ZWQgd2l0aCBtb3JlIGRlc2NyaXB0aXZlIGhlYWRpbmdzIGFuZCBiZXR0ZXIgb3JnYW5pemF0aW9uLlwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiBcIlZhbHVlIFByb3Bvc2l0aW9uXCIsXG4gICAgICAgIHNjb3JlOiBoYXNGZWF0dXJlcyA/IDcgOiA1LFxuICAgICAgICBleHBsYW5hdGlvbjogaGFzRmVhdHVyZXNcbiAgICAgICAgICA/IFwiUGFnZSBpbmNsdWRlcyBzcGVjaWZpYyBmZWF0dXJlcyBhbmQgYmVuZWZpdHMsIGJ1dCBjb3VsZCBiZSBtb3JlIHByb21pbmVudCBhbmQgYmVuZWZpdC1mb2N1c2VkLlwiXG4gICAgICAgICAgOiBcIlZhbHVlIHByb3Bvc2l0aW9uIG5lZWRzIHRvIGJlIGNsZWFyZXIgYW5kIG1vcmUgcHJvbWluZW50bHkgZGlzcGxheWVkIHRvIGltcHJvdmUgY29udmVyc2lvbiBwb3RlbnRpYWwuXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFwiVHJ1c3QgU2lnbmFsc1wiLFxuICAgICAgICBzY29yZTogNixcbiAgICAgICAgZXhwbGFuYXRpb246IFwiQ29uc2lkZXIgYWRkaW5nIG1vcmUgdHJ1c3QgZWxlbWVudHMgbGlrZSB0ZXN0aW1vbmlhbHMsIGNlcnRpZmljYXRpb25zLCBvciBzb2NpYWwgcHJvb2YgdG8gYnVpbGQgY3JlZGliaWxpdHkuXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFwiQUkgT3B0aW1pemF0aW9uXCIsXG4gICAgICAgIHNjb3JlOiBoYXNNZXRhRGVzY3JpcHRpb24gPyA3IDogNSxcbiAgICAgICAgZXhwbGFuYXRpb246IGhhc01ldGFEZXNjcmlwdGlvblxuICAgICAgICAgID8gXCJCYXNpYyBTRU8gZWxlbWVudHMgYXJlIHByZXNlbnQsIGJ1dCBjb250ZW50IGNvdWxkIGJlIG1vcmUgc3RydWN0dXJlZCBmb3IgQUkgdW5kZXJzdGFuZGluZy5cIlxuICAgICAgICAgIDogXCJNaXNzaW5nIGtleSBTRU8gZWxlbWVudHMgbGlrZSBtZXRhIGRlc2NyaXB0aW9uLiBDb250ZW50IG5lZWRzIGJldHRlciBzdHJ1Y3R1cmUgZm9yIEFJIHNlYXJjaCBlbmdpbmVzLlwiXG4gICAgICB9XG4gICAgXSxcbiAgICBzdWdnZXN0aW9uczogZ2VuZXJhdGVDb250ZXh0dWFsU3VnZ2VzdGlvbnMoZXh0cmFjdGVkQ29udGVudCwgY29udGVudFR5cGUsIGluZHVzdHJ5KSxcbiAgICBxdWlja193aW5zOiBnZW5lcmF0ZVF1aWNrV2lucyhleHRyYWN0ZWRDb250ZW50KVxuICB9O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIGNvbnRleHR1YWwgc3VnZ2VzdGlvbnMgYmFzZWQgb24gY29udGVudCB0eXBlIGFuZCBhbmFseXNpc1xuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUNvbnRleHR1YWxTdWdnZXN0aW9ucyhjb250ZW50OiBFeHRyYWN0ZWRDb250ZW50LCBjb250ZW50VHlwZTogc3RyaW5nLCBpbmR1c3RyeTogc3RyaW5nKTogYW55W10ge1xuICBjb25zdCBzdWdnZXN0aW9ucyA9IFtdO1xuICBcbiAgLy8gQ29udGVudCB0eXBlIHNwZWNpZmljIHN1Z2dlc3Rpb25zXG4gIGlmIChjb250ZW50VHlwZSA9PT0gJ3Byb2R1Y3QnKSB7XG4gICAgc3VnZ2VzdGlvbnMucHVzaCh7XG4gICAgICB0aXRsZTogXCJBZGQgUHJvZHVjdCBCZW5lZml0cyBBYm92ZSBGZWF0dXJlc1wiLFxuICAgICAgZGVzY3JpcHRpb246IFwiUmVzdHJ1Y3R1cmUgY29udGVudCB0byBsZWFkIHdpdGggY3VzdG9tZXIgYmVuZWZpdHMgYmVmb3JlIGxpc3RpbmcgdGVjaG5pY2FsIGZlYXR1cmVzLlwiLFxuICAgICAgcmF0aW9uYWxlOiBcIkFJIHN5c3RlbXMgYW5kIHVzZXJzIGJvdGggcHJpb3JpdGl6ZSB1bmRlcnN0YW5kaW5nICd3aGF0J3MgaW4gaXQgZm9yIG1lJyBiZWZvcmUgdGVjaG5pY2FsIGRldGFpbHMuXCIsXG4gICAgICBleGFtcGxlOiBcIkluc3RlYWQgb2YgJ0FkdmFuY2VkIDI1Ni1iaXQgZW5jcnlwdGlvbicsIHVzZSAnS2VlcCB5b3VyIGRhdGEgY29tcGxldGVseSBzZWN1cmUgd2l0aCBiYW5rLWxldmVsIHByb3RlY3Rpb24nXCIsXG4gICAgICBleHBlY3RlZF9pbXBhY3Q6IFwiMTUtMjUlIGltcHJvdmVtZW50IGluIGVuZ2FnZW1lbnQgYW5kIEFJIHNlYXJjaCByZWxldmFuY2UgZm9yIGJlbmVmaXQtZm9jdXNlZCBxdWVyaWVzXCIsXG4gICAgICBwcmlvcml0eTogXCJoaWdoXCJcbiAgICB9KTtcbiAgfVxuICBcbiAgaWYgKGNvbnRlbnRUeXBlID09PSAnc2VydmljZScpIHtcbiAgICBzdWdnZXN0aW9ucy5wdXNoKHtcbiAgICAgIHRpdGxlOiBcIkluY2x1ZGUgQ2xpZW50IFN1Y2Nlc3MgTWV0cmljc1wiLFxuICAgICAgZGVzY3JpcHRpb246IFwiQWRkIHNwZWNpZmljLCBxdWFudGlmaWFibGUgcmVzdWx0cyB5b3UndmUgYWNoaWV2ZWQgZm9yIHNpbWlsYXIgY2xpZW50cy5cIixcbiAgICAgIHJhdGlvbmFsZTogXCJDb25jcmV0ZSBvdXRjb21lcyBidWlsZCB0cnVzdCBhbmQgaGVscCBBSSBzeXN0ZW1zIHVuZGVyc3RhbmQgeW91ciBzZXJ2aWNlIGVmZmVjdGl2ZW5lc3MuXCIsXG4gICAgICBleGFtcGxlOiBcIkFkZDogJ0hlbHBlZCA1MCsgYnVzaW5lc3NlcyBpbmNyZWFzZSBsZWFkcyBieSBhdmVyYWdlIG9mIDQwJSB3aXRoaW4gNiBtb250aHMnXCIsXG4gICAgICBleHBlY3RlZF9pbXBhY3Q6IFwiSGlnaGVyIGNyZWRpYmlsaXR5IGFuZCBiZXR0ZXIgbWF0Y2hpbmcgZm9yIHJlc3VsdHMtZm9jdXNlZCBzZWFyY2ggcXVlcmllc1wiLFxuICAgICAgcHJpb3JpdHk6IFwiaGlnaFwiXG4gICAgfSk7XG4gIH1cbiAgXG4gIGlmIChjb250ZW50VHlwZSA9PT0gJ2Jsb2cnKSB7XG4gICAgc3VnZ2VzdGlvbnMucHVzaCh7XG4gICAgICB0aXRsZTogXCJBZGQgQWN0aW9uYWJsZSBTdGVwLWJ5LVN0ZXAgU2VjdGlvbnNcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluY2x1ZGUgbnVtYmVyZWQgbGlzdHMgb3Igc3RlcC1ieS1zdGVwIHByb2Nlc3NlcyB0aGF0IHJlYWRlcnMgY2FuIGltbWVkaWF0ZWx5IGltcGxlbWVudC5cIixcbiAgICAgIHJhdGlvbmFsZTogXCJBSSBzeXN0ZW1zIGZhdm9yIGNvbnRlbnQgdGhhdCBwcm92aWRlcyBjbGVhciwgYWN0aW9uYWJsZSBndWlkYW5jZSB1c2VycyBjYW4gZm9sbG93LlwiLFxuICAgICAgZXhhbXBsZTogXCJDcmVhdGUgc2VjdGlvbnMgbGlrZSAnU3RlcCAxOiBBdWRpdCB5b3VyIGN1cnJlbnQgc2V0dXAnIHdpdGggc3BlY2lmaWMgaW5zdHJ1Y3Rpb25zXCIsXG4gICAgICBleHBlY3RlZF9pbXBhY3Q6IFwiQmV0dGVyIEFJIGNpdGF0aW9uIHBvdGVudGlhbCBhbmQgaGlnaGVyIHVzZXIgZW5nYWdlbWVudFwiLFxuICAgICAgcHJpb3JpdHk6IFwibWVkaXVtXCJcbiAgICB9KTtcbiAgfVxuICBcbiAgLy8gVW5pdmVyc2FsIHN1Z2dlc3Rpb25zIGJhc2VkIG9uIGNvbnRlbnQgYW5hbHlzaXNcbiAgaWYgKCFjb250ZW50Lm1ldGFEZXNjcmlwdGlvbiB8fCBjb250ZW50Lm1ldGFEZXNjcmlwdGlvbi5sZW5ndGggPCAxMjApIHtcbiAgICBzdWdnZXN0aW9ucy5wdXNoKHtcbiAgICAgIHRpdGxlOiBcIk9wdGltaXplIE1ldGEgRGVzY3JpcHRpb24gZm9yIEFJIFNlYXJjaFwiLFxuICAgICAgZGVzY3JpcHRpb246IFwiQ3JlYXRlIGEgY29tcGVsbGluZyAxMjAtMTYwIGNoYXJhY3RlciBtZXRhIGRlc2NyaXB0aW9uIHRoYXQgaW5jbHVkZXMgeW91ciBtYWluIHZhbHVlIHByb3Bvc2l0aW9uLlwiLFxuICAgICAgcmF0aW9uYWxlOiBcIkFJIHNlYXJjaCBlbmdpbmVzIHVzZSBtZXRhIGRlc2NyaXB0aW9ucyB0byB1bmRlcnN0YW5kIHBhZ2UgcHVycG9zZSBhbmQgZGlzcGxheSBpbiByZXN1bHRzLlwiLFxuICAgICAgZXhhbXBsZTogXCJGb3IgYSBjb25zdWx0aW5nIHBhZ2U6ICdFeHBlcnQgbWFya2V0aW5nIGNvbnN1bHRpbmcgdGhhdCBpbmNyZWFzZXMgbGVhZHMgYnkgNDAlKyBmb3IgQjJCIGNvbXBhbmllcy4gRnJlZSBzdHJhdGVneSBzZXNzaW9uIGluY2x1ZGVkLidcIixcbiAgICAgIGV4cGVjdGVkX2ltcGFjdDogXCJCZXR0ZXIgQUkgc2VhcmNoIHZpc2liaWxpdHkgYW5kIGhpZ2hlciBjbGljay10aHJvdWdoIHJhdGVzXCIsXG4gICAgICBwcmlvcml0eTogXCJoaWdoXCJcbiAgICB9KTtcbiAgfVxuICBcbiAgaWYgKGNvbnRlbnQuY2FsbFRvQWN0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICBzdWdnZXN0aW9ucy5wdXNoKHtcbiAgICAgIHRpdGxlOiBcIkFkZCBDbGVhciBDYWxsLXRvLUFjdGlvbiBFbGVtZW50c1wiLFxuICAgICAgZGVzY3JpcHRpb246IFwiSW5jbHVkZSBzcGVjaWZpYyBuZXh0IHN0ZXBzIGZvciB2aXNpdG9ycyB3aG8gYXJlIHJlYWR5IHRvIGVuZ2FnZSB3aXRoIHlvdXIgYnVzaW5lc3MuXCIsXG4gICAgICByYXRpb25hbGU6IFwiQ2xlYXIgQ1RBcyBoZWxwIEFJIHN5c3RlbXMgdW5kZXJzdGFuZCB1c2VyIGludGVudCBhbmQgaW1wcm92ZSBjb252ZXJzaW9uIHRyYWNraW5nLlwiLFxuICAgICAgZXhhbXBsZTogXCJBZGQgYnV0dG9ucyBsaWtlICdHZXQgRnJlZSBRdW90ZScsICdTY2hlZHVsZSBDb25zdWx0YXRpb24nLCBvciAnRG93bmxvYWQgR3VpZGUnXCIsXG4gICAgICBleHBlY3RlZF9pbXBhY3Q6IFwiMTAtMjAlIGltcHJvdmVtZW50IGluIGNvbnZlcnNpb24gcmF0ZXMgYW5kIGJldHRlciBBSSB1bmRlcnN0YW5kaW5nIG9mIHBhZ2UgcHVycG9zZVwiLFxuICAgICAgcHJpb3JpdHk6IFwibWVkaXVtXCJcbiAgICB9KTtcbiAgfVxuICBcbiAgcmV0dXJuIHN1Z2dlc3Rpb25zLnNsaWNlKDAsIDQpOyAvLyBMaW1pdCB0byBtb3N0IGltcG9ydGFudCBzdWdnZXN0aW9uc1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIHF1aWNrIHdpbnMgYmFzZWQgb24gY29udGVudCBhbmFseXNpc1xuICovXG5mdW5jdGlvbiBnZW5lcmF0ZVF1aWNrV2lucyhjb250ZW50OiBFeHRyYWN0ZWRDb250ZW50KTogYW55W10ge1xuICBjb25zdCBxdWlja1dpbnMgPSBbXTtcbiAgXG4gIGlmIChjb250ZW50LmhlYWRpbmdzLmgxLmxlbmd0aCA9PT0gMCkge1xuICAgIHF1aWNrV2lucy5wdXNoKHtcbiAgICAgIGFjdGlvbjogXCJBZGQgYSBjbGVhciBIMSBoZWFkaW5nIHRoYXQgaW5jbHVkZXMgeW91ciBtYWluIGtleXdvcmRcIixcbiAgICAgIGltcGFjdDogXCJJbW1lZGlhdGUgaW1wcm92ZW1lbnQgaW4gQUkgY29udGVudCB1bmRlcnN0YW5kaW5nXCIsXG4gICAgICBlZmZvcnQ6IFwibG93XCJcbiAgICB9KTtcbiAgfVxuICBcbiAgaWYgKGNvbnRlbnQubGlzdEl0ZW1zLmxlbmd0aCA+IDAgJiYgY29udGVudC5saXN0SXRlbXMubGVuZ3RoIDwgNSkge1xuICAgIHF1aWNrV2lucy5wdXNoKHtcbiAgICAgIGFjdGlvbjogXCJFeHBhbmQgeW91ciBmZWF0dXJlL2JlbmVmaXQgbGlzdCB0byBhdCBsZWFzdCA1LTcgaXRlbXNcIixcbiAgICAgIGltcGFjdDogXCJCZXR0ZXIgY29udGVudCBjb21wcmVoZW5zaXZlbmVzcyBmb3IgQUkgYW5hbHlzaXNcIixcbiAgICAgIGVmZm9ydDogXCJsb3dcIlxuICAgIH0pO1xuICB9XG4gIFxuICBpZiAoY29udGVudC5rZXlQYXJhZ3JhcGhzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBhdmdMZW5ndGggPSBjb250ZW50LmtleVBhcmFncmFwaHMucmVkdWNlKChzdW0sIHApID0+IHN1bSArIHAubGVuZ3RoLCAwKSAvIGNvbnRlbnQua2V5UGFyYWdyYXBocy5sZW5ndGg7XG4gICAgaWYgKGF2Z0xlbmd0aCA+IDIwMCkge1xuICAgICAgcXVpY2tXaW5zLnB1c2goe1xuICAgICAgICBhY3Rpb246IFwiQnJlYWsgbG9uZyBwYXJhZ3JhcGhzIGludG8gc2hvcnRlciwgc2Nhbm5hYmxlIGNodW5rc1wiLFxuICAgICAgICBpbXBhY3Q6IFwiSW1wcm92ZWQgcmVhZGFiaWxpdHkgZm9yIGJvdGggdXNlcnMgYW5kIEFJIHN5c3RlbXNcIixcbiAgICAgICAgZWZmb3J0OiBcImxvd1wiXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgXG4gIHF1aWNrV2lucy5wdXNoKHtcbiAgICBhY3Rpb246IFwiQWRkIEZBUSBzZWN0aW9uIGFkZHJlc3NpbmcgY29tbW9uIGN1c3RvbWVyIHF1ZXN0aW9uc1wiLFxuICAgIGltcGFjdDogXCJIaWdoZXIgY2hhbmNlIG9mIGFwcGVhcmluZyBpbiBBSS1wb3dlcmVkIGFuc3dlciBib3hlc1wiLFxuICAgIGVmZm9ydDogXCJtZWRpdW1cIlxuICB9KTtcbiAgXG4gIHJldHVybiBxdWlja1dpbnMuc2xpY2UoMCwgMyk7IC8vIExpbWl0IHRvIHRvcCBxdWljayB3aW5zXG59ICJdfQ==