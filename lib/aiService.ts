// File: lib/aiService.ts
// This file provides AI analysis services with dynamic imports to avoid build issues

// We'll use a different approach to handle the openrouter-sdk import
let OpenRouterSDK: any = null;

// Function to safely get the OpenRouter client
async function getOpenRouterClient() {
  // If we're in a build/compilation environment, don't try to import
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping OpenRouter import during build phase');
    return null;
  }
  
  // Only attempt import if we haven't tried before
  if (OpenRouterSDK === null) {
    try {
      // Use a "trick" to prevent webpack from trying to statically analyze this
      const importPath = 'openrouter-sdk';
      OpenRouterSDK = await import(/* webpackIgnore: true */ importPath).catch(() => null);
    } catch (error) {
      console.warn('Failed to import OpenRouter SDK:', error);
      OpenRouterSDK = false; // Mark as attempted but failed
    }
  }
  
  // Return the client if available
  if (OpenRouterSDK && OpenRouterSDK.OpenRouterClient) {
    return OpenRouterSDK.OpenRouterClient;
  }
  
  return null;
}

/**
 * Analyze text content and provide AI insights
 */
export async function analyzeContentWithAI(content: string, url: string): Promise<any> {
  try {
    // Don't even try if OPENROUTER_API_KEY is not set
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('OPENROUTER_API_KEY not set, returning mock analysis');
      return generateMockAnalysis(content, url);
    }
    
    // Try to get the OpenRouter client
    const OpenRouterClient = await getOpenRouterClient();
    
    if (!OpenRouterClient) {
      console.warn('OpenRouter SDK not available, returning mock analysis');
      return generateMockAnalysis(content, url);
    }
    
    // Initialize client
    const client = new OpenRouterClient({
      apiKey: process.env.OPENROUTER_API_KEY || '',
      applicationId: 'Aelora',
      defaultModel: 'anthropic/claude-3-sonnet-20240229',
    });
    
    const prompt = `
    You are an expert in AI search engine optimization. Analyze the following website content 
    from ${url} and provide insights on how it could be improved for AI search engines.
    
    Focus on these key areas:
    1. Content clarity and structure
    2. Semantic relevance to likely search intent
    3. Entity recognition and contextual understanding
    4. Information completeness
    5. Factual accuracy and authority
    
    For each area, provide:
    - A score from 1-10
    - Key observations
    - Specific, actionable recommendations
    
    Format your response as JSON with this structure:
    {
      "overall_score": number,
      "areas": {
        "content_clarity": {
          "score": number,
          "observations": string[],
          "recommendations": string[]
        },
        "semantic_relevance": {
          "score": number,
          "observations": string[],
          "recommendations": string[]
        },
        "entity_recognition": {
          "score": number,
          "observations": string[],
          "recommendations": string[]
        },
        "information_completeness": {
          "score": number,
          "observations": string[],
          "recommendations": string[]
        },
        "factual_accuracy": {
          "score": number,
          "observations": string[],
          "recommendations": string[]
        }
      },
      "priority_actions": string[]
    }
    
    Website content:
    ${content.substring(0, 15000)} // Limit content length
    `;

    const response = await client.chat({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2, // Lower temperature for more consistent results
      format: 'json', // Request JSON format
    });

    // Parse the response
    const responseText = response.choices[0]?.message.content || '';
    try {
      // Try to parse as JSON
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fall back to returning the raw text
      return {
        raw_response: responseText,
        error: 'Failed to parse structured data'
      };
    }
  } catch (error) {
    console.error('Error in AI content analysis:', error);
    return generateMockAnalysis(content, url);
  }
}

/**
 * Generate improvement suggestions based on content analysis
 */
export async function generateSuggestions(analysisResult: any, content: string, url: string): Promise<any> {
  try {
    // Don't even try if OPENROUTER_API_KEY is not set
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('OPENROUTER_API_KEY not set, returning mock suggestions');
      return generateMockSuggestions(analysisResult, url);
    }
    
    // Try to get the OpenRouter client
    const OpenRouterClient = await getOpenRouterClient();
    
    if (!OpenRouterClient) {
      console.warn('OpenRouter SDK not available, returning mock suggestions');
      return generateMockSuggestions(analysisResult, url);
    }
    
    // Initialize client
    const client = new OpenRouterClient({
      apiKey: process.env.OPENROUTER_API_KEY || '',
      applicationId: 'Aelora',
      defaultModel: 'anthropic/claude-3-sonnet-20240229',
    });
    
    const prompt = `
    Based on this analysis of the website at ${url}, generate 5 specific, high-impact improvements 
    that would most improve the content's visibility to AI search engines.
    
    Analysis results:
    ${JSON.stringify(analysisResult)}
    
    For each suggestion:
    1. Describe the specific change
    2. Explain why it would help
    3. Provide an example implementation
    
    Format your response as JSON with this structure:
    {
      "suggestions": [
        {
          "title": string,
          "description": string,
          "rationale": string,
          "example": string,
          "expected_impact": string
        }
      ]
    }
    `;

    const response = await client.chat({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      format: 'json',
    });

    // Parse the response
    const responseText = response.choices[0]?.message.content || '';
    try {
      // Try to parse as JSON
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI suggestions as JSON:', parseError);
      // Fall back to returning the raw text
      return {
        raw_response: responseText,
        error: 'Failed to parse structured data'
      };
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return generateMockSuggestions(analysisResult, url);
  }
}

/**
 * Generate mock analysis for when OpenRouter is not available
 */
function generateMockAnalysis(content: string, url: string): any {
  // Calculate mock scores based on content length
  const wordCount = content.split(/\s+/).length;
  const baseScore = 6; // Out of 10
  const lengthBonus = Math.min(2, wordCount / 1000); // Up to 2 points for long content
  
  return {
    "overall_score": baseScore + lengthBonus,
    "areas": {
      "content_clarity": {
        "score": baseScore + Math.random(),
        "observations": [
          "Content structure could be improved with more headings and subheadings",
          "Some paragraphs are too long, making them difficult to scan",
          "Key points could be better highlighted through formatting"
        ],
        "recommendations": [
          "Break down content into smaller, more digestible sections",
          "Use more descriptive headings that clearly communicate the content",
          "Limit paragraphs to 3-4 sentences for better readability"
        ]
      },
      "semantic_relevance": {
        "score": baseScore + Math.random(),
        "observations": [
          "Main topic keywords appear in the content but could be more prominent",
          "Some related concepts are missing that AI systems would expect",
          "Intent matching could be improved with more specific answers"
        ],
        "recommendations": [
          "Include more related terminology and synonyms",
          "Address common questions directly with clear answers",
          "Structure content to match search intent patterns"
        ]
      },
      "entity_recognition": {
        "score": baseScore - 0.5 + Math.random(),
        "observations": [
          "Key entities are present but not clearly defined",
          "Relationships between entities could be more explicit",
          "Some important entities in this domain are missing"
        ],
        "recommendations": [
          "Define important terms and concepts clearly",
          "Use structured data to identify key entities",
          "Make connections between related entities more explicit"
        ]
      },
      "information_completeness": {
        "score": baseScore - 1 + Math.random(),
        "observations": [
          "Content covers basic information but lacks depth in some areas",
          "Some important aspects of the topic are not addressed",
          "Supporting evidence or examples could be stronger"
        ],
        "recommendations": [
          "Expand content to cover all key aspects of the topic",
          "Include more specific examples, data or case studies",
          "Address potential questions a user might have"
        ]
      },
      "factual_accuracy": {
        "score": baseScore + 1 + Math.random(),
        "observations": [
          "Content appears generally accurate but could include more citations",
          "Some statements would benefit from supporting evidence",
          "Authority could be strengthened with expert opinions or research"
        ],
        "recommendations": [
          "Include citations or links to authoritative sources",
          "Add statistics or research findings to support key points",
          "Mention recognized experts or organizations in the field"
        ]
      }
    },
    "priority_actions": [
      "Improve content structure with clearer headings and shorter paragraphs",
      "Add more domain-specific terminology and entity definitions",
      "Expand content to cover all important aspects of the topic",
      "Include supporting evidence and citations",
      "Directly address the most common user questions"
    ]
  };
}

/**
 * Generate mock suggestions for when OpenRouter is not available
 */
function generateMockSuggestions(analysisResult: any, url: string): any {
  return {
    "suggestions": [
      {
        "title": "Implement Clear Heading Hierarchy",
        "description": "Reorganize your content with a proper H1-H6 heading structure that clearly outlines the topic hierarchy.",
        "rationale": "AI systems use headings to understand content organization and identify important topics. A clear hierarchy helps them recognize the relationship between concepts.",
        "example": "H1: Main Topic\nH2: Important Subtopic\nH3: Specific Aspect of Subtopic\n...\nEnsure H1 contains primary keywords and each heading level provides more specific detail.",
        "expected_impact": "Improved content indexing and higher relevance scores for AI search results, leading to potentially 15-20% better visibility."
      },
      {
        "title": "Add Structured FAQ Section",
        "description": "Create a dedicated FAQ section addressing common questions with concise, direct answers.",
        "rationale": "AI search engines actively look for question-answer pairs to serve users with specific queries. Clearly formatted Q&A content is highly valuable for direct answers.",
        "example": "## Frequently Asked Questions\n\n**Q: What is [topic]?**\nA: [Clear, concise definition in 1-2 sentences]\n\n**Q: How does [topic] work?**\nA: [Direct explanation in simple terms]",
        "expected_impact": "Significantly higher chance of appearing in featured snippets and direct answers, potentially driving 30% more relevant traffic."
      },
      {
        "title": "Implement Schema.org Markup",
        "description": "Add appropriate Schema.org structured data to help AI systems understand your content type and organization.",
        "rationale": "Schema markup provides explicit signals to AI about content type, purpose, and relationships, removing ambiguity and increasing confidence in classification.",
        "example": "For articles: Use Article schema with author, datePublished, headline properties.\nFor products: Use Product schema with name, description, price properties.\nFor services: Use Service schema with serviceType, provider properties.",
        "expected_impact": "Enhanced interpretation of content purpose and context by AI systems, potentially resulting in 25% improvement in relevance scoring."
      },
      {
        "title": "Expand Entity Definitions",
        "description": "Clearly define important entities (people, places, concepts, products) when first mentioned.",
        "rationale": "AI systems build knowledge graphs from entity relationships. Clear definitions help establish these connections accurately.",
        "example": "Instead of: 'We use XYZ methodology.'\nImprove to: 'We use XYZ methodology, a systematic approach developed in 2018 that combines elements of A, B, and C to achieve D.'",
        "expected_impact": "Better entity recognition and relationship mapping, improving topical relevance by approximately 20%."
      },
      {
        "title": "Improve Content Completeness",
        "description": "Expand your content to cover all important aspects of the topic that users might want to know.",
        "rationale": "Comprehensive content signals authority to AI systems and addresses more potential user intents, increasing the likelihood of matching search queries.",
        "example": "For each subtopic, include:\n- Definition/explanation\n- Benefits/features\n- Common questions/concerns\n- Examples or use cases\n- Related concepts or alternatives",
        "expected_impact": "Higher content quality scores and broader intent matching, potentially increasing relevant traffic by 25-35%."
      }
    ]
  };
}