import { JSDOM } from 'jsdom';
import { analyzeWithAI } from './ai-service';
import { extractPriorityContent, ExtractedContent } from './content-extractor';

interface AnalysisResult {
  url: string;
  timestamp: string;
  scores: {
    readability: number;
    schema: number;
    questionAnswerMatch: number;
    headingsStructure: number;
    overallScore: number;
    aiAnalysisScore?: number;
  };
  recommendations: string[];
  aiRecommendations?: any[];
  details: {
    wordCount: number;
    hasSchema: boolean;
    headingCount: number;
    imageCount: number;
    imageAltTextRate: number;
    readabilityMetrics: {
      sentenceLength: number;
      wordLength: number;
    };
    aiAnalysis?: any;
    contentType?: string;
    industry?: string;
    extractedContent?: ExtractedContent;
  };
  performance?: {
    fetchTimeMs: number;
    analysisTimeMs: number;
    totalTimeMs: number;
  };
}

/**
 * Analyze a website by fetching and processing its content
 */
export async function analyzeWebsite(url: string): Promise<AnalysisResult> {
  const startTime = Date.now();
  
  // Step 1: Fetch website content
  console.log(`Fetching content from ${url}`);
  const fetchStartTime = Date.now();
  const content = await fetchContent(url);
  const fetchTime = Date.now() - fetchStartTime;
  
  if (!content) {
    throw new Error(`Failed to fetch content from ${url}`);
  }
  
  // Step 2: Smart content extraction (NEW)
  console.log('Extracting priority content for analysis');
  const extractedContent = extractPriorityContent(content, url);
  console.log(`Extracted ${extractedContent.wordCount} priority words from ${extractedContent.contentType} content`);
  
  // Step 3: Extract structured content from HTML (for basic analysis)
  console.log('Extracting content structure for basic metrics');
  const legacyContent = extractContent(content);
  
  // Step 4: Perform basic content analysis
  console.log('Performing basic content analysis');
  const basicAnalysis = performBasicAnalysis(legacyContent);
  
  // Step 5: Perform enhanced AI-powered analysis
  let aiAnalysis = null;
  let aiRecommendations = null;
  let aiScore = 0;
  let quickWins = null;
  let industry = null;
  
  const analysisStartTime = Date.now();
  
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log(`Performing enhanced AI analysis for ${extractedContent.contentType} content`);
      
      // Use enhanced AI analysis with smart content extraction
      const aiResult = await analyzeWithAI(extractedContent, url);
      
      // Set AI analysis data if available
      if (aiResult) {
        aiAnalysis = aiResult.areas;
        aiRecommendations = aiResult.suggestions;
        quickWins = aiResult.quick_wins;
        industry = aiResult.industry;
        aiScore = Math.min(100, Math.max(0, aiResult.overall_score * 10));
        console.log(`Enhanced AI analysis completed with score: ${aiScore} for ${aiResult.industry} ${aiResult.content_type}`);
      }
    } catch (error) {
      console.error('Error in enhanced AI analysis:', error);
      // Continue with only basic analysis if AI fails
    }
  } else {
    console.log('OPENAI_API_KEY not set, skipping AI analysis');
  }
  
  const analysisTime = Date.now() - analysisStartTime;
  const totalTime = Date.now() - startTime;
  
  // Step 6: Calculate overall score using AI and basic scores
  const overallScore = calculateOverallScore(basicAnalysis.scores, aiScore);
  
  // Step 7: Return enhanced results
  const result: AnalysisResult = {
    url,
    timestamp: new Date().toISOString(),
    scores: {
      ...basicAnalysis.scores,
      overallScore
    },
    recommendations: basicAnalysis.recommendations,
    details: {
      ...basicAnalysis.details,
      contentType: extractedContent.contentType,
      extractedContent: extractedContent // Include for debugging/future use
    },
    performance: {
      fetchTimeMs: fetchTime,
      analysisTimeMs: analysisTime,
      totalTimeMs: totalTime
    }
  };

  // Add AI-specific data only if available
  if (aiScore > 0) {
    result.scores.aiAnalysisScore = aiScore;
  }
  
  if (aiRecommendations && aiRecommendations.length > 0) {
    result.aiRecommendations = aiRecommendations;
  }
  
  if (aiAnalysis) {
    result.details.aiAnalysis = aiAnalysis;
  }
  
  if (industry) {
    result.details.industry = industry;
  }

  return result;
}

/**
 * Fetch content from a URL
 */
async function fetchContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Aelora-Bot/1.0 (+https://aelora.vercel.app/bot)',
      },
      redirect: 'follow',
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

/**
 * Extract structured content from HTML
 */
function extractContent(html: string): any {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extract text content
    const mainContent = document.body.textContent || '';
    
    // Extract headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(heading => ({
      level: parseInt(heading.tagName.substring(1)),
      text: heading.textContent || ''
    }));
    
    // Extract images
    const images = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.getAttribute('src') || '',
      alt: img.getAttribute('alt') || ''
    }));
    
    // Extract schema markup
    const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      .map(script => script.textContent || '');
    
    // Basic content stats
    const paragraphs = document.querySelectorAll('p').length;
    const lists = document.querySelectorAll('ul, ol').length;
    const tables = document.querySelectorAll('table').length;
    const title = document.querySelector('title')?.textContent || '';
    
    // Approximate word count
    const wordCount = mainContent.split(/\s+/).filter(Boolean).length;
    
    return {
      mainContent,
      headings,
      images,
      schemas,
      paragraphs,
      lists,
      tables,
      title,
      wordCount
    };
  } catch (error) {
    console.error('Error extracting content:', error);
    return {
      mainContent: '',
      headings: [],
      images: [],
      schemas: [],
      paragraphs: 0,
      lists: 0,
      tables: 0,
      title: '',
      wordCount: 0
    };
  }
}

/**
 * Perform basic content analysis
 */
function performBasicAnalysis(content: any): any {
  // Calculate readability metrics
  const readabilityMetrics = calculateReadabilityMetrics(content.mainContent);
  const readabilityScore = Math.min(100, Math.max(0, 100 - (readabilityMetrics.sentenceLength * 2)));
  
  // Calculate schema markup score
  const schemaScore = content.schemas.length > 0 ? 85 : 55;
  
  // Calculate headings structure score
  const headingScore = Math.min(100, Math.max(0, 60 + content.headings.length * 5));
  
  // Calculate question-answer match score
  const questionAnswerScore = 75; // Fixed score for MVP
  
  // Generate recommendations
  const recommendations = generateRecommendations(content, readabilityScore, schemaScore, headingScore);
  
  return {
    scores: {
      readability: readabilityScore,
      schema: schemaScore,
      headingsStructure: headingScore,
      questionAnswerMatch: questionAnswerScore
    },
    recommendations,
    details: {
      wordCount: content.wordCount,
      hasSchema: content.schemas.length > 0,
      headingCount: content.headings.length,
      imageCount: content.images.length,
      imageAltTextRate: calculateImageAltTextRate(content.images),
      readabilityMetrics: {
        sentenceLength: readabilityMetrics.sentenceLength,
        wordLength: readabilityMetrics.wordLength
      }
    }
  };
}

/**
 * Calculate readability metrics
 */
function calculateReadabilityMetrics(text: string): { sentenceLength: number; wordLength: number } {
  // Default values for empty content
  if (!text || text.trim().length === 0) {
    return { sentenceLength: 0, wordLength: 0 };
  }
  
  // Split into sentences and words
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  
  if (sentences.length === 0 || words.length === 0) {
    return { sentenceLength: 0, wordLength: 0 };
  }
  
  // Calculate average sentence length
  const avgSentenceLength = words.length / sentences.length;
  
  // Calculate average word length
  const totalChars = words.reduce((sum, word) => sum + word.length, 0);
  const avgWordLength = totalChars / words.length;
  
  return {
    sentenceLength: Math.round(avgSentenceLength * 10) / 10,
    wordLength: Math.round(avgWordLength * 10) / 10
  };
}

/**
 * Calculate image alt text rate
 */
function calculateImageAltTextRate(images: { src: string; alt: string }[]): number {
  if (images.length === 0) return 0;
  
  const imagesWithAlt = images.filter(img => img.alt && img.alt.trim().length > 0);
  return Math.round((imagesWithAlt.length / images.length) * 100);
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(content: any, readabilityScore: number, schemaScore: number, headingScore: number): string[] {
  const recommendations: string[] = [];
  
  // Schema recommendations
  if (schemaScore < 70) {
    recommendations.push("Add structured data using Schema.org markup to improve AI understanding of your content");
  }
  
  // Readability recommendations
  if (readabilityScore < 70) {
    recommendations.push("Use shorter sentences and simpler language to improve content readability");
  }
  
  // Heading recommendations
  if (headingScore < 70) {
    recommendations.push("Improve content organization with clear headings and subheadings");
  }
  
  // Image recommendations
  if (content.images.length > 0 && calculateImageAltTextRate(content.images) < 80) {
    recommendations.push("Add descriptive alt text to all images for better accessibility and AI understanding");
  }
  
  // Content length recommendations
  if (content.wordCount < 500) {
    recommendations.push("Expand your content with more detailed information to improve comprehensiveness");
  }
  
  // Always add a few generic recommendations
  recommendations.push("Include concise answers to common questions in your niche");
  recommendations.push("Use descriptive page titles and meta descriptions");
  
  return recommendations;
}

/**
 * Calculate overall score using a weighted average
 */
function calculateOverallScore(basicScores: any, aiScore: number): number {
  // If AI score is available, include it in the calculation
  if (aiScore > 0) {
    return Math.round(
      (basicScores.readability * 0.2) +
      (basicScores.schema * 0.2) +
      (basicScores.headingsStructure * 0.2) +
      (basicScores.questionAnswerMatch * 0.1) +
      (aiScore * 0.3)
    );
  }
  
  // Otherwise, use only basic scores
  return Math.round(
    (basicScores.readability * 0.25) +
    (basicScores.schema * 0.25) +
    (basicScores.headingsStructure * 0.25) +
    (basicScores.questionAnswerMatch * 0.25)
  );
} 