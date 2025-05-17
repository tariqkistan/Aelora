/**
 * AI service for analyzing content with OpenAI or fallback mocks
 */

// Interface for AI analysis results
interface AIAnalysisResult {
  overall_score: number;
  areas: Array<{
    name: string;
    score: number;
    explanation: string;
  }>;
  suggestions: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
}

/**
 * Analyze content using OpenAI models or fallback to mock data
 */
export async function analyzeWithAI(content: string, url: string): Promise<AIAnalysisResult | null> {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not set, returning mock data');
      return generateMockAnalysis(url);
    }
    
    console.log('Preparing OpenAI API request');
    
    // Truncate content to stay within token limits
    const truncatedContent = truncateContent(content, 8000);
    const prompt = generateAIPrompt(truncatedContent, url);
    
    try {
      // Direct API call to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo', // Using GPT-4 Turbo for high-quality analysis
          messages: [
            {
              role: 'system',
              content: 'You are an AI Search Engine Optimization (AEO) expert who analyzes website content and provides detailed feedback.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error (${response.status}):`, errorText);
        console.warn('Falling back to mock data');
        return generateMockAnalysis(url);
      }
      
      const data = await response.json();
      console.log('OpenAI response received');
      
      if (!data.choices || data.choices.length === 0) {
        console.error('No response choices from OpenAI');
        return generateMockAnalysis(url);
      }
      
      const aiResponse = data.choices[0]?.message?.content || '';
      
      // Parse JSON response
      try {
        return JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.error('Raw response:', aiResponse);
        return generateMockAnalysis(url);
      }
    } catch (apiError) {
      console.error('Error in OpenAI API call:', apiError);
      return generateMockAnalysis(url);
    }
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return generateMockAnalysis(url);
  }
}

/**
 * Generate a mock AI analysis for fallback cases
 */
function generateMockAnalysis(url: string): AIAnalysisResult {
  // Generate random scores
  const generateScore = () => Math.floor(Math.random() * 3) + 6; // 6-8 range
  
  return {
    overall_score: 7,
    areas: [
      {
        name: "Clear Answer Statements",
        score: generateScore(),
        explanation: "Content has some direct answers to potential user questions, but could be more explicit in addressing key search queries."
      },
      {
        name: "Information Structure",
        score: generateScore(),
        explanation: "Information is organized in a logical manner, but headings and subheadings could better signal content hierarchy."
      },
      {
        name: "Factual Precision",
        score: generateScore(),
        explanation: "The content appears factually accurate but could include more specific data points and citations."
      },
      {
        name: "Context Completeness",
        score: generateScore(),
        explanation: "Most necessary context is provided, but some advanced concepts could be explained more thoroughly."
      }
    ],
    suggestions: [
      {
        title: "Add Clear Question-Answer Pairs",
        description: "Include direct questions followed by concise answers to improve AI discoverability.",
        priority: "high"
      },
      {
        title: "Improve Heading Structure",
        description: "Use more descriptive H2 and H3 headings that match likely user queries.",
        priority: "medium"
      },
      {
        title: "Enhance Schema Markup",
        description: "Add structured data to help AI systems understand the content's purpose and organization.",
        priority: "high"
      },
      {
        title: "Include More Specific Examples",
        description: "Provide concrete examples and use cases to illustrate abstract concepts.",
        priority: "medium"
      }
    ]
  };
}

/**
 * Generate prompt for AI content analysis
 */
function generateAIPrompt(content: string, url: string): string {
  return `Analyze the following website content and provide detailed feedback on how well it is optimized for AI understanding and search.
  
URL: ${url}

CONTENT:
${content}

I need a detailed analysis with the following:
1. An overall score from 1-10 of how well this content is optimized for AI understanding
2. Specific areas that could be improved to make the content more AI-friendly
3. Concrete suggestions for optimizing the content

Format your response as a JSON object with the following structure:
{
  "overall_score": <number from 1-10>,
  "areas": [
    {"name": "Clear Answer Statements", "score": <number from 1-10>, "explanation": "<your explanation>"},
    {"name": "Information Structure", "score": <number from 1-10>, "explanation": "<your explanation>"},
    {"name": "Factual Precision", "score": <number from 1-10>, "explanation": "<your explanation>"},
    {"name": "Context Completeness", "score": <number from 1-10>, "explanation": "<your explanation>"}
  ],
  "suggestions": [
    {"title": "<suggestion title>", "description": "<detailed explanation>", "priority": "<high|medium|low>"}
  ]
}`;
}

/**
 * Truncate content to a maximum length
 */
function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) {
    return content;
  }
  
  // Simple truncation that tries to preserve whole paragraphs
  const paragraphs = content.split('\n\n');
  let result = '';
  
  for (const paragraph of paragraphs) {
    if ((result + paragraph).length <= maxLength - 100) {
      result += paragraph + '\n\n';
    } else {
      break;
    }
  }
  
  return result + '... [content truncated]';
} 