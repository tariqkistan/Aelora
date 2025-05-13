import { WebContent } from './contentFetcher'

export interface AnalysisResult {
  url: string
  timestamp: string
  scores: {
    readability: number
    schema: number
    questionAnswerMatch: number
    headingsStructure: number
    overallScore: number
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
    }
  }
}

export async function analyzeContent(content: WebContent, url: string): Promise<AnalysisResult> {
  // In the actual implementation, this would use AI models like OpenAI or Claude
  // to analyze the content more thoroughly
  
  // For MVP, we'll use simple algorithms to generate scores
  
  // 1. Calculate readability score (simplified)
  const readabilityScore = calculateReadabilityScore(content.mainContent)
  
  // 2. Evaluate schema presence
  const schemaScore = content.schema.length > 0 ? 
    Math.min(80 + (content.schema.length * 5), 100) : 50
  
  // 3. Evaluate headings structure
  const headingsStructureScore = calculateHeadingsScore(content.headings)
  
  // 4. Calculate question-answer match (simulated for MVP)
  // In real implementation, this would use AI to find question-like patterns
  // and evaluate if answers are provided
  const questionAnswerScore = Math.floor(Math.random() * 20) + 75
  
  // 5. Calculate overall score (weighted average)
  const overallScore = Math.round(
    (readabilityScore * 0.25) +
    (schemaScore * 0.25) +
    (headingsStructureScore * 0.25) +
    (questionAnswerScore * 0.25)
  )
  
  // 6. Generate recommendations
  const recommendations = generateRecommendations(content, {
    readabilityScore,
    schemaScore,
    headingsStructureScore,
    questionAnswerScore
  })
  
  return {
    url,
    timestamp: new Date().toISOString(),
    scores: {
      readability: readabilityScore,
      schema: schemaScore,
      questionAnswerMatch: questionAnswerScore,
      headingsStructure: headingsStructureScore,
      overallScore
    },
    recommendations,
    details: {
      wordCount: content.wordCount,
      hasSchema: content.schema.length > 0,
      headingCount: content.headings.length,
      imageCount: content.images.length,
      imageAltTextRate: calculateImageAltTextRate(content.images),
      readabilityMetrics: {
        sentenceLength: estimateAverageSentenceLength(content.mainContent),
        wordLength: estimateAverageWordLength(content.mainContent)
      }
    }
  }
}

// Helper functions

function calculateReadabilityScore(text: string): number {
  // Simplified readability score for MVP
  // In real implementation, this would use more sophisticated formulas like Flesch-Kincaid
  const words = text.split(/\s+/).filter(Boolean)
  const sentences = text.split(/[.!?]+/).filter(Boolean)
  
  if (sentences.length === 0 || words.length === 0) return 50
  
  const avgWordsPerSentence = words.length / sentences.length
  
  // Penalize very long sentences
  let score = 100 - Math.min(avgWordsPerSentence * 2, 50)
  
  // Adjust based on text length (prefer longer content, but not too long)
  if (words.length < 300) score -= 10
  if (words.length > 5000) score -= 5
  
  return Math.round(Math.max(0, Math.min(100, score)))
}

function calculateHeadingsScore(headings: { level: number; text: string }[]): number {
  if (headings.length === 0) return 40
  
  let score = 60 // Base score
  
  // Reward for having H1
  const hasH1 = headings.some(h => h.level === 1)
  if (hasH1) score += 10
  
  // Reward for having multiple heading levels (structured content)
  const uniqueLevels = new Set(headings.map(h => h.level))
  score += uniqueLevels.size * 5
  
  // Reward for having enough headings relative to content length
  // (We don't have content length here, so we'll use a simplified approach)
  score += Math.min(headings.length, 10) * 2
  
  return Math.round(Math.min(100, score))
}

function calculateImageAltTextRate(images: { src: string; alt: string }[]): number {
  if (images.length === 0) return 0
  
  const imagesWithAlt = images.filter(img => img.alt.trim().length > 0)
  return Math.round((imagesWithAlt.length / images.length) * 100)
}

function estimateAverageSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(Boolean)
  const words = text.split(/\s+/).filter(Boolean)
  
  if (sentences.length === 0) return 0
  return Math.round(words.length / sentences.length)
}

function estimateAverageWordLength(text: string): number {
  const words = text.split(/\s+/).filter(Boolean)
  
  if (words.length === 0) return 0
  
  const totalChars = words.reduce((sum, word) => sum + word.length, 0)
  return Math.round((totalChars / words.length) * 10) / 10
}

function generateRecommendations(
  content: WebContent,
  scores: {
    readabilityScore: number;
    schemaScore: number;
    headingsStructureScore: number;
    questionAnswerScore: number;
  }
): string[] {
  const recommendations: string[] = []
  
  // Readability recommendations
  if (scores.readabilityScore < 70) {
    recommendations.push("Improve content readability by using shorter sentences and simpler language")
    recommendations.push("Break up long paragraphs into smaller ones for better readability")
  }
  
  // Schema recommendations
  if (scores.schemaScore < 70) {
    recommendations.push("Add structured data using Schema.org markup to help AI understand your content")
    recommendations.push("Include FAQ schema for question-answer content")
  }
  
  // Headings recommendations
  if (scores.headingsStructureScore < 70) {
    recommendations.push("Improve content organization with clearer heading structure (H1, H2, H3)")
    recommendations.push("Use more descriptive headings that include relevant keywords")
  }
  
  // Question-answer recommendations
  if (scores.questionAnswerScore < 70) {
    recommendations.push("Include more direct answers to common questions in your content")
    recommendations.push("Format Q&A content clearly with questions as headings and concise answers")
  }
  
  // Image recommendations
  if (calculateImageAltTextRate(content.images) < 80) {
    recommendations.push("Add descriptive alt text to all images")
  }
  
  // Meta recommendations
  if (!content.description || content.description.length < 50) {
    recommendations.push("Improve your meta description with a clear summary of the page content")
  }
  
  // If we have too few recommendations, add some general ones
  if (recommendations.length < 3) {
    recommendations.push("Use more natural language that directly answers user questions")
    recommendations.push("Include relevant examples and explanations to support your main points")
    recommendations.push("Ensure your content is comprehensive and covers the topic thoroughly")
  }
  
  // Limit to top 5 recommendations
  return recommendations.slice(0, 5)
} 