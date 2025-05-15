import { WebContent } from './contentFetcher'
import { analyzeContentWithAI } from './aiService'

export interface AnalysisResult {
  url: string
  timestamp: string
  scores: {
    readability: number
    schema: number
    questionAnswerMatch: number
    headingsStructure: number
    overallScore: number
    // New scores
    contentDepth?: number
    keywordOptimization?: number
    aiVisibilityScore?: number  // New AI-powered score
  }
  recommendations: string[]
  details: {
    wordCount: number
    hasSchema: boolean
    headingCount: number
    imageCount: number
    imageAltTextRate: number
    readabilityMetrics: {
      sentenceLength: number
      wordLength: number
      fleschKincaidGrade?: number
      smogIndex?: number
      colemanLiauIndex?: number
    }
    headingAnalysis?: {
      hasProperHierarchy: boolean 
      nestedStructureScore: number
      keywordInHeadings: number
    }
    schemaDetails?: {
      types: string[]
      isValid: boolean
      completeness: number
    }
    faqCount: number
    paragraphCount: number
    keywordsFound: string[]
    contentToCodeRatio: number
    listsAndTables: number
    aiAnalysis?: any  // Store detailed AI analysis results
  }
}

export async function analyzeContent(content: WebContent, url: string): Promise<AnalysisResult> {
  // 1. Calculate readability scores (improved)
  const readabilityMetrics = calculateReadabilityMetrics(content.mainContent)
  const readabilityScore = calculateCompositeReadabilityScore(readabilityMetrics)
  
  // 2. Evaluate schema presence and quality
  const schemaAnalysis = analyzeSchemaMarkup(content.schema)
  const schemaScore = schemaAnalysis.score
  
  // 3. Evaluate headings structure (improved)
  const headingAnalysis = analyzeHeadingStructure(content.headings, content.title)
  const headingsStructureScore = headingAnalysis.score
  
  // 4. Calculate question-answer match using extracted FAQs and content
  const questionAnswerScore = analyzeFAQs(content.faqs, content)
  
  // 5. Calculate keyword optimization score
  const keywordScore = analyzeKeywords(content.keywords || [], content)
  
  // 6. Calculate content depth score
  const contentDepthScore = calculateContentDepthScore(content)
  
  // 7. Perform AI analysis if OPENROUTER_API_KEY is available
  let aiAnalysisResults = null
  let aiVisibilityScore = 0

  try {
    if (process.env.OPENROUTER_API_KEY) {
      console.log('Performing AI-powered content analysis...')
      aiAnalysisResults = await analyzeContentWithAI(content.mainContent, url)
      aiVisibilityScore = aiAnalysisResults.overall_score || 0
      console.log('AI analysis completed with score:', aiVisibilityScore)
    } else {
      console.log('Skipping AI analysis - OPENROUTER_API_KEY not configured')
    }
  } catch (error) {
    console.error('Error during AI analysis:', error)
    // Continue with traditional analysis if AI analysis fails
  }
  
  // 8. Calculate overall score (weighted average with AI score if available)
  const overallScore = Math.round(
    aiVisibilityScore > 0 
      ? (readabilityScore * 0.15) +
        (schemaScore * 0.15) +
        (headingsStructureScore * 0.10) +
        (questionAnswerScore * 0.10) +
        (keywordScore * 0.10) +
        (contentDepthScore * 0.10) +
        (aiVisibilityScore * 0.30)  // Give significant weight to AI analysis
      : (readabilityScore * 0.20) +
        (schemaScore * 0.20) +
        (headingsStructureScore * 0.15) +
        (questionAnswerScore * 0.15) +
        (keywordScore * 0.15) +
        (contentDepthScore * 0.15)
  )
  
  // 9. Generate recommendations (combining traditional and AI recommendations)
  const recommendations = generateRecommendations(content, {
    readabilityScore,
    schemaScore,
    headingsStructureScore,
    questionAnswerScore,
    keywordScore,
    contentDepthScore,
    readabilityMetrics,
    headingAnalysis: headingAnalysis.details,
    schemaAnalysis,
    aiAnalysisResults
  })
  
  return {
    url,
    timestamp: new Date().toISOString(),
    scores: {
      readability: readabilityScore,
      schema: schemaScore,
      questionAnswerMatch: questionAnswerScore,
      headingsStructure: headingsStructureScore,
      overallScore,
      contentDepth: contentDepthScore,
      keywordOptimization: keywordScore,
      aiVisibilityScore: aiVisibilityScore || undefined
    },
    recommendations,
    details: {
      wordCount: content.wordCount,
      hasSchema: content.schema.length > 0,
      headingCount: content.headings.length,
      imageCount: content.images.length,
      imageAltTextRate: calculateImageAltTextRate(content.images),
      readabilityMetrics: {
        sentenceLength: readabilityMetrics.avgSentenceLength,
        wordLength: readabilityMetrics.avgWordLength,
        fleschKincaidGrade: readabilityMetrics.fleschKincaidGrade,
        smogIndex: readabilityMetrics.smogIndex,
        colemanLiauIndex: readabilityMetrics.colemanLiauIndex
      },
      headingAnalysis: headingAnalysis.details,
      schemaDetails: schemaAnalysis.details,
      faqCount: content.faqs.length,
      paragraphCount: content.paragraphs,
      keywordsFound: content.keywords || [],
      contentToCodeRatio: content.contentToCodeRatio || 0,
      listsAndTables: content.lists + content.tables,
      aiAnalysis: aiAnalysisResults
    }
  }
}

// Helper functions

interface ReadabilityMetrics {
  avgSentenceLength: number
  avgWordLength: number
  syllableCount: number
  complexWordCount: number
  fleschKincaidGrade: number
  smogIndex: number
  colemanLiauIndex: number
}

function calculateReadabilityMetrics(text: string): ReadabilityMetrics {
  const words = text.split(/\s+/).filter(Boolean)
  const sentences = text.split(/[.!?]+/).filter(Boolean)
  
  if (sentences.length === 0 || words.length === 0) {
    return {
      avgSentenceLength: 0,
      avgWordLength: 0,
      syllableCount: 0,
      complexWordCount: 0,
      fleschKincaidGrade: 0,
      smogIndex: 0,
      colemanLiauIndex: 0
    }
  }
  
  const avgSentenceLength = words.length / sentences.length
  
  // Calculate average word length
  const totalChars = words.reduce((sum, word) => sum + word.length, 0)
  const avgWordLength = totalChars / words.length
  
  // Calculate syllable count (approximation)
  const syllableCount = words.reduce((count, word) => {
    return count + countSyllables(word)
  }, 0)
  
  // Complex words have 3+ syllables
  const complexWordCount = words.filter(word => countSyllables(word) >= 3).length
  
  // Calculate Flesch-Kincaid Grade Level
  const fleschKincaidGrade = 0.39 * avgSentenceLength + 11.8 * (syllableCount / words.length) - 15.59
  
  // Calculate SMOG Index
  const smogIndex = 1.043 * Math.sqrt(complexWordCount * (30 / sentences.length)) + 3.1291
  
  // Calculate Coleman-Liau Index
  const L = (totalChars / words.length) * 100 // letters per 100 words
  const S = (sentences.length / words.length) * 100 // sentences per 100 words
  const colemanLiauIndex = 0.0588 * L - 0.296 * S - 15.8
  
  return {
    avgSentenceLength,
    avgWordLength,
    syllableCount,
    complexWordCount,
    fleschKincaidGrade: roundToOneDecimal(fleschKincaidGrade),
    smogIndex: roundToOneDecimal(smogIndex),
    colemanLiauIndex: roundToOneDecimal(colemanLiauIndex)
  }
}

function countSyllables(word: string): number {
  word = word.toLowerCase().trim()
  if (word.length <= 3) return 1
  
  // Remove trailing e
  word = word.replace(/e$/, '')
  
  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g) || []
  return vowelGroups.length
}

function roundToOneDecimal(num: number): number {
  return Math.round(num * 10) / 10
}

function calculateCompositeReadabilityScore(metrics: ReadabilityMetrics): number {
  // Convert grade level scores to 100-point scale
  // Lower grade levels are better (more readable)
  
  // Flesch-Kincaid: 0-18 scale (higher is harder), convert to 100-point where 100 is best (most readable)
  const fkScore = Math.max(0, 100 - (metrics.fleschKincaidGrade * 5))
  
  // SMOG: 0-18 scale (higher is harder), convert to 100-point
  const smogScore = Math.max(0, 100 - (metrics.smogIndex * 5))
  
  // Coleman-Liau: 0-18 scale (higher is harder), convert to 100-point
  const cliScore = Math.max(0, 100 - (metrics.colemanLiauIndex * 5))
  
  // Average the three scores
  const compositeScore = Math.round((fkScore + smogScore + cliScore) / 3)
  
  return Math.min(100, Math.max(0, compositeScore))
}

interface HeadingAnalysisResult {
  score: number
  details: {
    hasProperHierarchy: boolean
    nestedStructureScore: number
    keywordInHeadings: number
  }
}

function analyzeHeadingStructure(headings: { level: number; text: string }[], pageTitle: string): HeadingAnalysisResult {
  if (headings.length === 0) {
    return {
      score: 40,
      details: {
        hasProperHierarchy: false,
        nestedStructureScore: 0,
        keywordInHeadings: 0
      }
    }
  }
  
  // Base score
  let score = 60
  
  // Check proper hierarchy
  let hasProperHierarchy = true
  let lastLevel = 0
  
  for (let i = 0; i < headings.length; i++) {
    const current = headings[i].level
    
    // First heading should ideally be H1
    if (i === 0 && current !== 1) {
      hasProperHierarchy = false
    }
    
    // Heading levels shouldn't skip (e.g., H1 to H3 without H2)
    if (i > 0 && current > lastLevel && current - lastLevel > 1) {
      hasProperHierarchy = false
    }
    
    lastLevel = current
  }
  
  // Reward for proper hierarchy
  if (hasProperHierarchy) score += 15
  
  // Count unique heading levels (1-6)
  const uniqueLevels = new Set(headings.map(h => h.level))
  
  // Calculate nested structure score (reward hierarchical content)
  const nestedStructureScore = Math.min(uniqueLevels.size * 15, 30)
  score += nestedStructureScore
  
  // Check for keywords from title in headings
  const titleWords = pageTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  let keywordMatches = 0
  
  if (titleWords.length > 0) {
    headings.forEach(heading => {
      const headingText = heading.text.toLowerCase()
      titleWords.forEach(word => {
        if (headingText.includes(word)) keywordMatches++
      })
    })
    
    // Calculate percentage of headings with title keywords
    const keywordInHeadings = Math.round((keywordMatches / headings.length) * 100)
    score += Math.min(keywordInHeadings / 5, 15) // Max 15 points for keyword usage
  }
  
  return {
    score: Math.min(100, score),
    details: {
      hasProperHierarchy,
      nestedStructureScore,
      keywordInHeadings: Math.round((keywordMatches / headings.length) * 100)
    }
  }
}

interface SchemaAnalysisResult {
  score: number
  details: {
    types: string[]
    isValid: boolean
    completeness: number
  }
}

function analyzeSchemaMarkup(schemas: string[]): SchemaAnalysisResult {
  if (schemas.length === 0) {
    return {
      score: 50,
      details: {
        types: [],
        isValid: false,
        completeness: 0
      }
    }
  }
  
  let validSchemas = 0
  const foundTypes: string[] = []
  
  // Parse and validate schema JSON
  schemas.forEach(schemaStr => {
    try {
      const schema = JSON.parse(schemaStr)
      const schemaType = schema['@type'] || (schema['@graph'] ? 'Graph' : '')
      
      if (schemaType && !foundTypes.includes(schemaType)) {
        foundTypes.push(schemaType)
      }
      
      // Basic validation - should have @context and @type
      if (schema['@context'] && (schema['@type'] || schema['@graph'])) {
        validSchemas++
      }
    } catch (e) {
      // Invalid JSON
    }
  })
  
  // Rate schema completeness
  const isValid = validSchemas > 0
  const completeness = Math.round((validSchemas / schemas.length) * 100)
  
  // Preferred schema types for AI search engines
  const preferredTypes = ['Article', 'FAQPage', 'HowTo', 'Product', 'Organization', 'WebPage', 'BreadcrumbList']
  let preferredTypesFound = 0
  
  preferredTypes.forEach(type => {
    if (foundTypes.includes(type)) preferredTypesFound++
  })
  
  // Calculate score
  let score = 60 // Base score for having schema
  
  // Add points for completeness
  score += Math.round(completeness * 0.2) // Up to 20 points
  
  // Add points for preferred types
  score += Math.min(preferredTypesFound * 5, 20) // Up to 20 points
  
  return {
    score: Math.min(100, score),
    details: {
      types: foundTypes,
      isValid,
      completeness
    }
  }
}

function calculateImageAltTextRate(images: { src: string; alt: string }[]): number {
  if (images.length === 0) return 0
  
  const imagesWithAlt = images.filter(img => img.alt.trim().length > 0)
  return Math.round((imagesWithAlt.length / images.length) * 100)
}

function analyzeFAQs(faqs: { question: string; answer: string }[], content: WebContent): number {
  if (faqs.length === 0) {
    // Base score if no FAQs detected
    return 60
  }
  
  let score = 70 // Base score for having FAQs
  
  // Reward for quantity (up to a point)
  score += Math.min(faqs.length * 2, 10) // Max 10 points for quantity
  
  // Reward for answer quality
  let totalAnswerQuality = 0
  
  faqs.forEach(faq => {
    // Evaluate answer length - neither too short nor too long
    const answerWords = faq.answer.split(/\s+/).length
    
    // Calculate answer quality score (0-10)
    let answerQuality = 0
    
    // Answers should be substantial but not overly long
    if (answerWords < 10) {
      answerQuality = answerWords / 2 // Up to 5 points for very short answers
    } else if (answerWords <= 50) {
      answerQuality = 5 + (answerWords - 10) / 8 // 5-10 points for ideal length (10-50 words)
    } else if (answerWords <= 100) {
      answerQuality = 10 - (answerWords - 50) / 25 // 10-8 points for 50-100 words
    } else {
      answerQuality = 8 - Math.min(8, (answerWords - 100) / 50) // 8-0 points for >100 words
    }
    
    totalAnswerQuality += answerQuality
  })
  
  const avgAnswerQuality = totalAnswerQuality / faqs.length
  score += avgAnswerQuality * 2 // Up to 20 more points for answer quality
  
  // Check if schema FAQs are present
  const hasFAQSchema = content.schema.some(schema => {
    try {
      const data = JSON.parse(schema)
      return data['@type'] === 'FAQPage'
    } catch {
      return false
    }
  })
  
  if (hasFAQSchema) {
    score += 10 // Bonus for using FAQ schema
  }
  
  return Math.min(100, Math.round(score))
}

function analyzeKeywords(keywords: string[], content: WebContent): number {
  if (keywords.length === 0) {
    return 60 // Base score
  }
  
  let score = 65 // Starting score for having keywords
  
  // Check keyword presence in strategic locations
  const titleKeywords = keywords.filter(kw => 
    content.title.toLowerCase().includes(kw.toLowerCase())
  ).length
  
  const headingKeywords = keywords.filter(kw => 
    content.headings.some(h => h.text.toLowerCase().includes(kw.toLowerCase()))
  ).length
  
  const descKeywords = keywords.filter(kw => 
    content.description.toLowerCase().includes(kw.toLowerCase())
  ).length
  
  // Add points based on strategic keyword placement
  score += Math.min(titleKeywords * 5, 15) // Up to 15 points for keywords in title
  score += Math.min(headingKeywords * 2, 10) // Up to 10 points for keywords in headings
  score += Math.min(descKeywords * 2, 10) // Up to 10 points for keywords in description
  
  // Check keyword density
  const keywordDensity = calculateKeywordDensity(keywords, content.mainContent)
  
  // Ideal keyword density is 1-3%
  if (keywordDensity < 0.005) {
    // Too low density (below 0.5%)
    score -= 10
  } else if (keywordDensity < 0.01) {
    // Low density (0.5-1%)
    score -= 5
  } else if (keywordDensity > 0.04) {
    // Too high density (above 4%) - keyword stuffing
    score -= 15
  } else if (keywordDensity > 0.03) {
    // High density (3-4%)
    score -= 5
  }
  
  return Math.min(100, Math.max(0, Math.round(score)))
}

function calculateKeywordDensity(keywords: string[], content: string): number {
  const contentWords = content.toLowerCase().split(/\s+/).filter(Boolean)
  
  if (contentWords.length === 0) return 0
  
  // Count occurrences of each keyword
  let totalKeywordOccurrences = 0
  
  keywords.forEach(keyword => {
    const keywordParts = keyword.toLowerCase().split(/\s+/)
    
    if (keywordParts.length === 1) {
      // Single-word keyword
      contentWords.forEach(word => {
        if (word === keyword.toLowerCase()) {
          totalKeywordOccurrences++
        }
      })
    } else {
      // Multi-word keyword
      const contentText = content.toLowerCase()
      let position = 0
      while (true) {
        position = contentText.indexOf(keyword.toLowerCase(), position)
        if (position === -1) break
        
        totalKeywordOccurrences++
        position += keyword.length
      }
    }
  })
  
  return totalKeywordOccurrences / contentWords.length
}

function calculateContentDepthScore(content: WebContent): number {
  let score = 60 // Base score
  
  // 1. Word count - reward substantial content
  if (content.wordCount < 300) {
    score -= 20 // Penalize thin content
  } else if (content.wordCount < 600) {
    score -= 10 // Slight penalty for shorter content
  } else if (content.wordCount >= 1500) {
    score += 15 // Reward long-form content
  } else if (content.wordCount >= 1000) {
    score += 10 // Reward substantial content
  }
  
  // 2. Content structure
  const structureScore = (
    Math.min(content.headings.length, 10) * 1 +  // Up to 10 points for headings
    Math.min(content.lists, 5) * 1 +            // Up to 5 points for lists
    Math.min(content.tables, 3) * 1 +          // Up to 3 points for tables
    Math.min(content.paragraphs / 5, 6)         // Up to 6 points for paragraphs (1 point per 5 paragraphs)
  )
  
  score += structureScore
  
  // 3. Media enrichment
  if (content.images.length > 0) {
    score += Math.min(content.images.length, 5) * 2 // Up to 10 points for images
  }
  
  // 4. FAQ content
  if (content.faqs.length > 0) {
    score += Math.min(content.faqs.length, 6) * 1 // Up to 6 points for FAQs
  }
  
  // 5. Content-to-code ratio - clean, content-focused HTML is better
  if (content.contentToCodeRatio) {
    if (content.contentToCodeRatio > 0.4) {
      score += 10 // Excellent content-to-code ratio
    } else if (content.contentToCodeRatio > 0.3) {
      score += 5 // Good content-to-code ratio
    } else if (content.contentToCodeRatio < 0.15) {
      score -= 5 // Poor content-to-code ratio
    }
  }
  
  return Math.min(100, Math.max(0, Math.round(score)))
}

function generateRecommendations(
  content: WebContent,
  scores: {
    readabilityScore: number;
    schemaScore: number;
    headingsStructureScore: number;
    questionAnswerScore: number;
    keywordScore?: number;
    contentDepthScore?: number;
    readabilityMetrics?: ReadabilityMetrics;
    headingAnalysis?: HeadingAnalysisResult['details'];
    schemaAnalysis?: SchemaAnalysisResult;
    aiAnalysisResults?: any;
  }
): string[] {
  const recommendations: string[] = []
  
  // Add AI-powered recommendations if available
  if (scores.aiAnalysisResults?.improvement_areas) {
    // Get high and medium priority recommendations from AI analysis
    const aiRecommendations = scores.aiAnalysisResults.improvement_areas
      .filter((area: any) => area.priority === 'high' || area.priority === 'medium')
      .map((area: any) => `${area.title}: ${area.description}`)
    
    if (aiRecommendations.length > 0) {
      recommendations.push(...aiRecommendations)
    }
  }
  
  // Readability recommendations (enhanced)
  if (scores.readabilityScore < 70) {
    if (scores.readabilityMetrics && scores.readabilityMetrics.avgSentenceLength > 20) {
      recommendations.push("Reduce sentence length to improve readability (aim for 15-20 words per sentence)")
    }
    
    if (scores.readabilityMetrics && scores.readabilityMetrics.complexWordCount / content.wordCount > 0.2) {
      recommendations.push("Use simpler words with fewer syllables to improve readability")
    }
    
    recommendations.push("Break up long paragraphs into smaller ones for better readability")
  }
  
  // Schema recommendations (enhanced)
  if (scores.schemaScore < 70) {
    if (!scores.schemaAnalysis || scores.schemaAnalysis.details.types.length === 0) {
      recommendations.push("Add structured data using Schema.org markup to help AI understand your content")
    } else {
      const missingTypes = ['Article', 'FAQPage', 'HowTo'].filter(
        type => !scores.schemaAnalysis?.details.types.includes(type)
      )
      
      if (missingTypes.length > 0) {
        recommendations.push(`Add ${missingTypes.join(', ')} schema types to improve AI understanding`)
      }
      
      if (scores.schemaAnalysis.details.completeness < 80) {
        recommendations.push("Improve the completeness of your schema markup by adding more properties")
      }
    }
    
    recommendations.push("Include FAQ schema for question-answer content")
  }
  
  // Headings recommendations (enhanced)
  if (scores.headingsStructureScore < 70) {
    if (scores.headingAnalysis && !scores.headingAnalysis.hasProperHierarchy) {
      recommendations.push("Fix heading hierarchy: use H1 for main title, H2 for sections, H3 for subsections")
    }
    
    if (scores.headingAnalysis && scores.headingAnalysis.keywordInHeadings < 50) {
      recommendations.push("Include more relevant keywords from your title in your headings")
    }
    
    recommendations.push("Use more descriptive headings that clearly indicate the content of each section")
  }
  
  // Question-answer recommendations
  if (scores.questionAnswerScore < 70) {
    if (content.faqs.length === 0) {
      recommendations.push("Add a FAQ section with common questions and concise answers")
    } else if (content.faqs.length < 3) {
      recommendations.push("Expand your FAQ section with more relevant questions and answers")
    }
    
    recommendations.push("Format Q&A content with clear questions and direct, concise answers")
    
    // Check if FAQ schema exists
    const hasFAQSchema = content.schema.some(schema => {
      try {
        const data = JSON.parse(schema)
        return data['@type'] === 'FAQPage'
      } catch {
        return false
      }
    })
    
    if (!hasFAQSchema && content.faqs.length > 0) {
      recommendations.push("Add proper FAQ schema markup to your question-answer content")
    }
  }
  
  // Keyword optimization recommendations
  if (scores.keywordScore && scores.keywordScore < 70) {
    const keywordsInTitle = content.keywords?.filter(kw => 
      content.title.toLowerCase().includes(kw.toLowerCase())
    ).length || 0
    
    if (keywordsInTitle === 0 && content.keywords && content.keywords.length > 0) {
      recommendations.push(`Include primary keywords like "${content.keywords[0]}" in your page title`)
    }
    
    const keywordsInDesc = content.keywords?.filter(kw => 
      content.description.toLowerCase().includes(kw.toLowerCase())
    ).length || 0
    
    if (keywordsInDesc < 2 && content.keywords && content.keywords.length >= 2) {
      recommendations.push("Add more of your important keywords to your meta description")
    }
    
    recommendations.push("Ensure your primary keywords appear in H1 and H2 headings naturally")
  }
  
  // Content depth recommendations
  if (scores.contentDepthScore && scores.contentDepthScore < 70) {
    if (content.wordCount < 600) {
      recommendations.push("Add more comprehensive content - aim for at least 800-1000 words for better AI visibility")
    }
    
    if (content.lists < 2) {
      recommendations.push("Add more bulleted or numbered lists to organize information clearly")
    }
    
    if (content.images.length < 2) {
      recommendations.push("Include more relevant images with descriptive alt text")
    }
    
    recommendations.push("Expand your content with more detailed explanations and examples")
  }
  
  // Image recommendations
  if (calculateImageAltTextRate(content.images) < 80) {
    recommendations.push("Add descriptive alt text to all images to improve accessibility and AI understanding")
  }
  
  // Meta recommendations
  if (!content.description || content.description.length < 50) {
    recommendations.push("Improve your meta description with a clear summary of the page content")
  } else if (content.description.length < 120) {
    recommendations.push("Expand your meta description to 120-155 characters for better search visibility")
  }
  
  // If we have too few recommendations, add some general ones
  if (recommendations.length < 3) {
    recommendations.push("Use more natural language that directly answers user questions")
    recommendations.push("Include relevant examples and explanations to support your main points")
    recommendations.push("Ensure your content is comprehensive and covers the topic thoroughly")
  }
  
  // Limit to top 5 recommendations, prioritizing by score impact
  return recommendations.slice(0, 5)
} 