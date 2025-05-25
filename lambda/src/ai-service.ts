/**
 * Enhanced AI service with smart content extraction and industry-specific analysis
 * Provides high-value insights while maintaining cost efficiency
 */

import { ExtractedContent } from './content-extractor';
import { getAnalysisTemplate } from './analysis-templates';

// Interface for AI analysis results
interface AIAnalysisResult {
  overall_score: number;
  content_type: string;
  industry: string;
  areas: Array<{
    name: string;
    score: number;
    explanation: string;
  }>;
  suggestions: Array<{
    title: string;
    description: string;
    rationale: string;
    example: string;
    expected_impact: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  quick_wins: Array<{
    action: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Analyze content using smart extraction and industry-specific templates
 */
export async function analyzeWithAI(extractedContent: ExtractedContent, url: string): Promise<AIAnalysisResult | null> {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not set, returning enhanced mock data');
      return generateEnhancedMockAnalysis(extractedContent);
    }
    
    console.log(`Performing AI analysis for ${extractedContent.contentType} content (${extractedContent.wordCount} words)`);
    
    // Get industry-specific analysis template
    const template = getAnalysisTemplate(extractedContent);
    
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
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.error('Raw response:', aiResponse);
        return generateEnhancedMockAnalysis(extractedContent);
      }
    } catch (apiError) {
      console.error('Error in OpenAI API call:', apiError);
      return generateEnhancedMockAnalysis(extractedContent);
    }
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return generateEnhancedMockAnalysis(extractedContent);
  }
}

/**
 * Create focused prompt using extracted content and industry template
 */
function createFocusedPrompt(extractedContent: ExtractedContent, template: any): string {
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
function enhanceAIResult(aiResult: any, extractedContent: ExtractedContent): AIAnalysisResult {
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
function detectIndustryFromContent(content: ExtractedContent): string {
  const allText = [
    content.title,
    content.metaDescription,
    ...content.headings.h1,
    ...content.headings.h2,
    ...content.keyParagraphs.slice(0, 3)
  ].join(' ').toLowerCase();
  
  if (allText.includes('ecommerce') || allText.includes('shop') || allText.includes('buy')) return 'E-commerce';
  if (allText.includes('saas') || allText.includes('software') || allText.includes('platform')) return 'SaaS';
  if (allText.includes('consulting') || allText.includes('agency') || allText.includes('professional')) return 'Professional Services';
  if (allText.includes('health') || allText.includes('medical') || allText.includes('clinic')) return 'Healthcare';
  if (allText.includes('local') || allText.includes('location') || allText.includes('address')) return 'Local Business';
  
  return 'General Business';
}

/**
 * Generate enhanced mock analysis with industry-specific insights
 */
function generateEnhancedMockAnalysis(extractedContent: ExtractedContent): AIAnalysisResult {
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
function generateContextualSuggestions(content: ExtractedContent, contentType: string, industry: string): any[] {
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
function generateQuickWins(content: ExtractedContent): any[] {
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