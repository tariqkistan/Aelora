# Brand Visibility GPT-4 Prompt Template Examples

This document provides practical examples of using the Brand Visibility Prompt Template for structured brand analysis.

## Quick Start Examples

### 1. Basic Brand Analysis

```typescript
import { BRAND_VISIBILITY_PROMPTS } from '../src/templates/brand-visibility-prompt';

// Generate a basic prompt
const prompt = BRAND_VISIBILITY_PROMPTS.basic('Tesla', 'Automotive');
console.log(prompt);
```

**Generated Prompt:**
```
You are an expert brand analyst specializing in digital visibility and public perception assessment. Your task is to analyze brand visibility based on publicly available knowledge and provide structured insights.

CRITICAL INSTRUCTIONS:
- Respond ONLY with valid JSON format
- Base analysis on factual public knowledge
- Maintain neutral, analytical tone
- Do not include personal opinions or speculation
- If information is limited, indicate this in your confidence score
- Ensure all numeric values are within specified ranges

REQUIRED JSON OUTPUT FORMAT:
{
  "sentimentScore": <number between -1.0 and 1.0>,
  "mentions": [
    {
      "keyword": "<relevant keyword or phrase>",
      "tone": "<positive|neutral|negative>",
      "frequency": <estimated frequency score from 1-10>
    }
  ],
  "summary": "<2-3 sentence objective summary>",
  "confidence": <number between 0.0 and 1.0>,
  "dataPoints": <number of key data points>,
  "lastUpdated": "<current date in YYYY-MM-DD format>"
}

BRAND VISIBILITY ANALYSIS REQUEST:

What do you know about "Tesla" in the Automotive industry?

ANALYSIS PARAMETERS:
- Brand Name: Tesla
- Industry: Automotive
- Analysis Depth: basic
- Timeframe: Focus on current brand status and recent developments

ANALYSIS FOCUS AREAS:
1. Overall brand reputation and public perception
2. Market position and industry standing
3. Public visibility and recognition levels
4. Common associations and brand attributes
5. Sentiment in news, reviews, and public discourse
6. Digital presence and online reputation
7. Notable achievements, controversies, or developments
8. Consumer feedback and market reception

BASIC ANALYSIS: Focus on fundamental brand recognition and general sentiment.

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

Provide your analysis in the exact JSON format specified above. Do not include any additional text, explanations, or formatting outside the JSON structure.
```

**Expected GPT-4 Response:**
```json
{
  "sentimentScore": 0.7,
  "mentions": [
    {
      "keyword": "electric vehicles",
      "tone": "positive",
      "frequency": 9
    },
    {
      "keyword": "innovation",
      "tone": "positive",
      "frequency": 8
    },
    {
      "keyword": "Elon Musk",
      "tone": "neutral",
      "frequency": 9
    },
    {
      "keyword": "sustainable transportation",
      "tone": "positive",
      "frequency": 7
    },
    {
      "keyword": "autopilot",
      "tone": "neutral",
      "frequency": 6
    },
    {
      "keyword": "premium pricing",
      "tone": "negative",
      "frequency": 4
    }
  ],
  "summary": "Tesla is widely recognized as a leader in electric vehicles and sustainable transportation technology. The brand maintains strong positive sentiment due to innovation and environmental impact, though some concerns exist around pricing and autonomous driving safety.",
  "confidence": 0.9,
  "dataPoints": 15,
  "lastUpdated": "2025-01-03"
}
```

### 2. Detailed Analysis with Domain

```typescript
const prompt = BRAND_VISIBILITY_PROMPTS.detailed('Apple', 'Technology', 'apple.com');
```

### 3. Comprehensive Competitive Analysis

```typescript
const prompt = BRAND_VISIBILITY_PROMPTS.competitive('Netflix', 'Entertainment');
```

### 4. Custom Configuration

```typescript
import { BrandVisibilityPromptTemplate } from '../src/templates/brand-visibility-prompt';

const customPrompt = BrandVisibilityPromptTemplate.generatePrompt({
  brandName: 'Spotify',
  industry: 'Music Streaming',
  domain: 'spotify.com',
  analysisDepth: 'comprehensive',
  timeframe: 'recent',
  includeCompetitors: true
});
```

## Integration Examples

### 1. Direct OpenAI API Usage

```typescript
import OpenAI from 'openai';
import { BRAND_VISIBILITY_PROMPTS } from '../src/templates/brand-visibility-prompt';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeBrand(brandName: string, industry: string) {
  const prompt = BRAND_VISIBILITY_PROMPTS.detailed(brandName, industry);
  
  const response = await openai.chat.completions.create({
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
  });

  return JSON.parse(response.choices[0].message.content);
}

// Usage
const result = await analyzeBrand('Microsoft', 'Technology');
console.log(result);
```

### 2. Fetch API Usage

```typescript
async function callOpenAIWithPrompt(brandName: string, industry: string) {
  const prompt = BRAND_VISIBILITY_PROMPTS.basic(brandName, industry);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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
```

### 3. Response Validation

```typescript
import { BrandVisibilityPromptTemplate } from '../src/templates/brand-visibility-prompt';

async function validateAndAnalyzeBrand(brandName: string, industry: string) {
  const prompt = BRAND_VISIBILITY_PROMPTS.detailed(brandName, industry);
  
  // Get response from OpenAI (using your preferred method)
  const response = await callOpenAI(prompt);
  
  // Validate the response structure
  const isValid = BrandVisibilityPromptTemplate.validateResponse(response);
  
  if (!isValid) {
    throw new Error('Invalid response format from GPT-4');
  }
  
  return response;
}
```

## Sample Outputs for Different Brands

### Technology Company (Apple)
```json
{
  "sentimentScore": 0.8,
  "mentions": [
    {"keyword": "innovation", "tone": "positive", "frequency": 9},
    {"keyword": "premium products", "tone": "positive", "frequency": 8},
    {"keyword": "ecosystem", "tone": "positive", "frequency": 7},
    {"keyword": "expensive", "tone": "negative", "frequency": 6},
    {"keyword": "design", "tone": "positive", "frequency": 8},
    {"keyword": "privacy", "tone": "positive", "frequency": 7}
  ],
  "summary": "Apple maintains exceptional brand visibility with strong positive sentiment driven by innovation, design excellence, and ecosystem integration. While premium pricing creates some negative sentiment, overall perception remains highly favorable.",
  "confidence": 0.95,
  "dataPoints": 20,
  "lastUpdated": "2025-01-03"
}
```

### Automotive Company (BMW)
```json
{
  "sentimentScore": 0.6,
  "mentions": [
    {"keyword": "luxury", "tone": "positive", "frequency": 8},
    {"keyword": "performance", "tone": "positive", "frequency": 7},
    {"keyword": "German engineering", "tone": "positive", "frequency": 6},
    {"keyword": "expensive maintenance", "tone": "negative", "frequency": 5},
    {"keyword": "ultimate driving machine", "tone": "positive", "frequency": 6},
    {"keyword": "electric vehicles", "tone": "neutral", "frequency": 4}
  ],
  "summary": "BMW is recognized as a premium automotive brand with strong associations to luxury, performance, and German engineering quality. The brand faces challenges with maintenance costs but maintains positive sentiment in the luxury segment.",
  "confidence": 0.85,
  "dataPoints": 12,
  "lastUpdated": "2025-01-03"
}
```

### Startup/Emerging Brand
```json
{
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
}
```

## Best Practices

### 1. Prompt Optimization
- Use specific industry terms for better context
- Include domain when available for more accurate analysis
- Choose appropriate analysis depth based on your needs
- Consider timeframe relevance for your use case

### 2. Response Handling
- Always validate response structure before processing
- Handle low confidence scores appropriately
- Consider multiple API calls for comprehensive analysis
- Store historical data for trend analysis

### 3. Error Handling
```typescript
async function robustBrandAnalysis(brandName: string, industry: string) {
  try {
    const prompt = BRAND_VISIBILITY_PROMPTS.detailed(brandName, industry);
    const response = await callOpenAI(prompt);
    
    if (!BrandVisibilityPromptTemplate.validateResponse(response)) {
      // Fallback to basic analysis
      const basicPrompt = BRAND_VISIBILITY_PROMPTS.basic(brandName, industry);
      const fallbackResponse = await callOpenAI(basicPrompt);
      return fallbackResponse;
    }
    
    return response;
  } catch (error) {
    // Return default structure with low confidence
    return {
      sentimentScore: 0,
      mentions: [
        {keyword: brandName.toLowerCase(), tone: 'neutral', frequency: 1}
      ],
      summary: `Limited information available for ${brandName}.`,
      confidence: 0.1,
      dataPoints: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }
}
```

## Integration with Existing System

To integrate this prompt template with your existing brand visibility system:

```typescript
// Update your BrandAnalysisService to use the new template
import { BrandVisibilityPromptTemplate } from '../templates/brand-visibility-prompt';

// In your analyzeBrandVisibility method:
private buildAnalysisPrompt(brandName: string, domain: string, industry: string): string {
  return BrandVisibilityPromptTemplate.generatePrompt({
    brandName,
    industry,
    domain,
    analysisDepth: 'detailed',
    timeframe: 'current'
  });
}
```

This enhanced prompt template provides more structured, reliable, and comprehensive brand visibility analysis compared to the basic implementation. 