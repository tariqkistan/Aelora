/**
 * Standalone Brand Visibility Prompt Template Test
 * 
 * This script demonstrates how to use the brand visibility prompt template
 * to generate structured GPT-4 prompts for brand analysis.
 */

// Simple prompt template function (JavaScript version)
function generateBrandVisibilityPrompt(brandName, industry, options = {}) {
  const {
    domain = '',
    analysisDepth = 'detailed',
    timeframe = 'current',
    includeCompetitors = false
  } = options;

  const systemPrompt = `You are an expert brand analyst specializing in digital visibility and public perception assessment. Your task is to analyze brand visibility based on publicly available knowledge and provide structured insights.

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

  const timeframeText = timeframe === 'recent' 
    ? 'Focus on developments and perception over the past 1-2 years'
    : timeframe === 'historical'
    ? 'Include historical context and evolution of brand perception'
    : 'Focus on current brand status and recent developments';

  const depthText = analysisDepth === 'basic'
    ? 'BASIC ANALYSIS: Focus on fundamental brand recognition and general sentiment.'
    : analysisDepth === 'comprehensive'
    ? 'COMPREHENSIVE ANALYSIS: Provide in-depth analysis including competitive positioning, trend analysis, and strategic implications.'
    : 'DETAILED ANALYSIS: Include comprehensive reputation assessment, market positioning, and stakeholder perspectives.';

  const competitorText = includeCompetitors 
    ? `\nCOMPETITIVE CONTEXT:
- Consider brand's position relative to key competitors
- Note any competitive advantages or disadvantages in public perception
- Include comparative sentiment if relevant`
    : '';

  const userPrompt = `BRAND VISIBILITY ANALYSIS REQUEST:

What do you know about "${brandName}" in the ${industry} industry?

ANALYSIS PARAMETERS:
- Brand Name: ${brandName}
- Industry: ${industry}
${domain ? `- Domain: ${domain}` : ''}
- Analysis Depth: ${analysisDepth}
- Timeframe: ${timeframeText}

ANALYSIS FOCUS AREAS:
1. Overall brand reputation and public perception
2. Market position and industry standing
3. Public visibility and recognition levels
4. Common associations and brand attributes
5. Sentiment in news, reviews, and public discourse
6. Digital presence and online reputation
7. Notable achievements, controversies, or developments
8. Consumer feedback and market reception

${depthText}
${competitorText}

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

  return `${systemPrompt}\n\n${userPrompt}`;
}

// Ready-to-use prompt generators
const BRAND_PROMPTS = {
  basic: (brandName, industry) => 
    generateBrandVisibilityPrompt(brandName, industry, { analysisDepth: 'basic' }),
  
  detailed: (brandName, industry, domain) => 
    generateBrandVisibilityPrompt(brandName, industry, { domain, analysisDepth: 'detailed' }),
  
  comprehensive: (brandName, industry, domain) => 
    generateBrandVisibilityPrompt(brandName, industry, { 
      domain, 
      analysisDepth: 'comprehensive', 
      timeframe: 'recent',
      includeCompetitors: true 
    }),
  
  competitive: (brandName, industry) => 
    generateBrandVisibilityPrompt(brandName, industry, { 
      analysisDepth: 'comprehensive',
      includeCompetitors: true,
      timeframe: 'recent'
    })
};

// Test examples
function runTests() {
  console.log('🧪 Brand Visibility Prompt Template Tests\n');
  
  // Test 1: Basic Tesla analysis
  console.log('📋 Test 1: Basic Tesla Analysis');
  console.log('=' * 50);
  const teslaPrompt = BRAND_PROMPTS.basic('Tesla', 'Automotive');
  console.log(teslaPrompt);
  console.log('\n');
  
  // Test 2: Detailed Apple analysis
  console.log('📋 Test 2: Detailed Apple Analysis');
  console.log('=' * 50);
  const applePrompt = BRAND_PROMPTS.detailed('Apple', 'Technology', 'apple.com');
  console.log(applePrompt.substring(0, 500) + '...\n[Truncated for brevity]\n');
  
  // Test 3: Comprehensive Netflix analysis
  console.log('📋 Test 3: Comprehensive Netflix Analysis');
  console.log('=' * 50);
  const netflixPrompt = BRAND_PROMPTS.comprehensive('Netflix', 'Entertainment', 'netflix.com');
  console.log(netflixPrompt.substring(0, 500) + '...\n[Truncated for brevity]\n');
  
  // Test 4: Custom configuration
  console.log('📋 Test 4: Custom Spotify Analysis');
  console.log('=' * 50);
  const spotifyPrompt = generateBrandVisibilityPrompt('Spotify', 'Music Streaming', {
    domain: 'spotify.com',
    analysisDepth: 'comprehensive',
    timeframe: 'recent',
    includeCompetitors: true
  });
  console.log(spotifyPrompt.substring(0, 500) + '...\n[Truncated for brevity]\n');
}

// Example of how to use with OpenAI API (pseudo-code)
function exampleOpenAIUsage() {
  console.log('🔌 Example OpenAI API Usage:\n');
  
  const exampleCode = `
// Using fetch API
async function analyzeBrandWithOpenAI(brandName, industry) {
  const prompt = BRAND_PROMPTS.detailed(brandName, industry);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_OPENAI_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
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
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// Usage
const result = await analyzeBrandWithOpenAI('Microsoft', 'Technology');
console.log(result);
`;
  
  console.log(exampleCode);
}

// Expected output examples
function showExpectedOutputs() {
  console.log('📊 Expected GPT-4 Response Examples:\n');
  
  const teslaExample = {
    "sentimentScore": 0.7,
    "mentions": [
      {"keyword": "electric vehicles", "tone": "positive", "frequency": 9},
      {"keyword": "innovation", "tone": "positive", "frequency": 8},
      {"keyword": "Elon Musk", "tone": "neutral", "frequency": 9},
      {"keyword": "sustainable transportation", "tone": "positive", "frequency": 7},
      {"keyword": "autopilot", "tone": "neutral", "frequency": 6},
      {"keyword": "premium pricing", "tone": "negative", "frequency": 4}
    ],
    "summary": "Tesla is widely recognized as a leader in electric vehicles and sustainable transportation technology. The brand maintains strong positive sentiment due to innovation and environmental impact, though some concerns exist around pricing and autonomous driving safety.",
    "confidence": 0.9,
    "dataPoints": 15,
    "lastUpdated": "2025-01-03"
  };
  
  console.log('Tesla Analysis Example:');
  console.log(JSON.stringify(teslaExample, null, 2));
  console.log('\n');
  
  const startupExample = {
    "sentimentScore": 0.2,
    "mentions": [
      {"keyword": "innovative", "tone": "positive", "frequency": 3},
      {"keyword": "startup", "tone": "neutral", "frequency": 4},
      {"keyword": "unknown", "tone": "neutral", "frequency": 5},
      {"keyword": "potential", "tone": "positive", "frequency": 3}
    ],
    "summary": "Limited public visibility with neutral sentiment. Brand recognition is minimal but shows potential for growth in its market segment.",
    "confidence": 0.3,
    "dataPoints": 3,
    "lastUpdated": "2025-01-03"
  };
  
  console.log('Startup/Unknown Brand Example:');
  console.log(JSON.stringify(startupExample, null, 2));
}

// Main execution
if (require.main === module) {
  console.log('🚀 Brand Visibility GPT-4 Prompt Template Demo\n');
  
  runTests();
  exampleOpenAIUsage();
  showExpectedOutputs();
  
  console.log('\n✅ Demo completed! Use these prompts with GPT-4 for structured brand analysis.');
}

// Export for use in other modules
module.exports = {
  generateBrandVisibilityPrompt,
  BRAND_PROMPTS
}; 