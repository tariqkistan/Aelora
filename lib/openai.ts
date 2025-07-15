import OpenAI from 'openai';
import { cacheData, getCachedData, generateCacheKey } from './redis';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

// Cache TTL in seconds
const CACHE_TTL = {
  SHORT: 60 * 5, // 5 minutes
  MEDIUM: 60 * 60, // 1 hour
  LONG: 60 * 60 * 24, // 24 hours
};

/**
 * Generate AI content with caching
 */
export async function generateContent(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    cacheTtl?: number;
    forceFresh?: boolean;
  } = {}
): Promise<string> {
  const {
    model = 'gpt-4o',
    temperature = 0.7,
    maxTokens = 1000,
    cacheTtl = CACHE_TTL.MEDIUM,
    forceFresh = false,
  } = options;

  // Generate cache key
  const cacheKey = generateCacheKey('openai:content', {
    prompt,
    model,
    temperature,
    maxTokens,
  });

  // Try to get from cache first (unless forceFresh is true)
  if (!forceFresh) {
    const cachedResult = await getCachedData<string>(cacheKey);
    if (cachedResult) {
      console.log('Using cached OpenAI response');
      return cachedResult;
    }
  }

  try {
    // Generate content from OpenAI
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    // Cache the result
    await cacheData(cacheKey, content, cacheTtl);
    
    return content;
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error(`AI content generation failed: ${error.message}`);
  }
}

/**
 * Analyze website content for AI visibility
 */
export async function analyzeWebsiteContent(
  content: string,
  url: string,
  businessContext?: Record<string, any>
): Promise<any> {
  // Generate cache key
  const cacheKey = generateCacheKey('openai:analyze', {
    url,
    contentHash: hashString(content),
    businessContextHash: businessContext ? hashString(JSON.stringify(businessContext)) : 'none',
  });

  // Try to get from cache first
  const cachedResult = await getCachedData<any>(cacheKey);
  if (cachedResult) {
    console.log('Using cached website analysis');
    return cachedResult;
  }

  // Create system prompt based on business context
  let systemPrompt = `Analyze this website content for AI search engine optimization. 
Focus on how well the content would perform in AI-driven search engines like ChatGPT, Perplexity, and Google SGE.`;

  if (businessContext) {
    systemPrompt += `\n\nBusiness Context:
- Company: ${businessContext.companyName || 'Unknown'}
- Industry: ${businessContext.industry || 'Unknown'}
- Target Audience: ${businessContext.targetAudience || 'General'}
- Goals: ${Array.isArray(businessContext.primaryGoals) ? businessContext.primaryGoals.join(', ') : 'Not specified'}`;
  }

  try {
    // Generate analysis from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `URL: ${url}\n\nContent to analyze:\n${content.substring(0, 15000)}` // Limit content length
        }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const analysisText = completion.choices[0]?.message?.content || '{}';
    const analysis = JSON.parse(analysisText);
    
    // Cache the result
    await cacheData(cacheKey, analysis, CACHE_TTL.MEDIUM);
    
    return analysis;
  } catch (error: any) {
    console.error('OpenAI analysis error:', error);
    throw new Error(`Website analysis failed: ${error.message}`);
  }
}

/**
 * Generate AI-powered questions based on business context
 */
export async function generateAIQuestions(
  businessContext: Record<string, any>,
  count: number = 5
): Promise<string[]> {
  // Generate cache key
  const cacheKey = generateCacheKey('openai:questions', {
    businessContextHash: hashString(JSON.stringify(businessContext)),
    count,
  });

  // Try to get from cache first
  const cachedResult = await getCachedData<string[]>(cacheKey);
  if (cachedResult) {
    console.log('Using cached AI questions');
    return cachedResult;
  }

  const prompt = `Generate ${count} questions that potential customers might ask about a business with the following details:
- Company: ${businessContext.companyName || 'Unknown'}
- Industry: ${businessContext.industry || 'Unknown'}
- Target Audience: ${businessContext.targetAudience || 'General'}
- Products/Services: ${businessContext.businessModel || 'Unknown'}
- Location: ${businessContext.primaryLocation || 'Unknown'}, ${businessContext.country || 'Unknown'}

The questions should be ones that customers might type into a search engine or AI assistant. Focus on questions that would help the business appear in AI search results.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{"questions":[]}';
    const response = JSON.parse(responseText);
    const questions = response.questions || [];
    
    // Cache the result
    await cacheData(cacheKey, questions, CACHE_TTL.LONG);
    
    return questions;
  } catch (error: any) {
    console.error('OpenAI questions generation error:', error);
    return [];
  }
}

/**
 * Simple string hashing function for cache keys
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
} 