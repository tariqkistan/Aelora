import { JSDOM } from 'jsdom'

export interface WebContent {
  title: string
  description: string
  mainContent: string
  headings: { level: number; text: string }[]
  links: string[]
  images: { src: string; alt: string }[]
  schema: string[]
  meta: Record<string, string>
  wordCount: number
  paragraphs: number
  faqs: { question: string; answer: string }[]
  tables: number
  lists: number
  contentToCodeRatio?: number
  keywords?: string[]
}

export async function fetchContentFromUrl(url: string): Promise<WebContent | null> {
  try {
    const response = await fetch(url, {
      headers: {
        // Set a realistic user agent to avoid being blocked
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }
    
    const html = await response.text()
    const dom = new JSDOM(html)
    const document = dom.window.document
    
    // Get content to code ratio
    const textContent = document.body.textContent || ''
    const contentToCodeRatio = textContent.length / html.length
    
    // Extract title
    const title = document.querySelector('title')?.textContent || ''
    
    // Extract meta description
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    
    // Extract main content (prioritizing article or main, falling back to body)
    const contentElement = findMainContent(document)
    const mainContent = contentElement ? cleanText(contentElement.textContent || '') : ''
    
    // Extract paragraphs
    const paragraphCount = document.querySelectorAll('p').length
    
    // Extract headings
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const headings = Array.from(headingElements).map(el => {
      return {
        level: parseInt(el.tagName.substring(1)),
        text: el.textContent || ''
      }
    })
    
    // Extract links
    const linkElements = document.querySelectorAll('a[href]')
    const links = Array.from(linkElements)
      .map(el => el.getAttribute('href') || '')
      .filter(href => href && !href.startsWith('#') && !href.startsWith('javascript:'))
    
    // Extract images
    const imageElements = document.querySelectorAll('img')
    const images = Array.from(imageElements).map(el => {
      return {
        src: el.getAttribute('src') || '',
        alt: el.getAttribute('alt') || ''
      }
    })
    
    // Extract schema markup
    const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]')
    const schema = Array.from(schemaScripts).map(el => el.textContent || '').filter(Boolean)
    
    // Extract meta tags
    const metaTags = document.querySelectorAll('meta')
    const meta: Record<string, string> = {}
    Array.from(metaTags).forEach(el => {
      const name = el.getAttribute('name') || el.getAttribute('property')
      const content = el.getAttribute('content')
      if (name && content) {
        meta[name] = content
      }
    })
    
    // Extract tables and lists
    const tableCount = document.querySelectorAll('table').length
    const listCount = document.querySelectorAll('ul, ol').length
    
    // Extract FAQ content (looking for common patterns)
    const faqs = extractFAQs(document)
    
    // Extract keywords (from meta keywords and page content)
    const keywords = extractKeywords(document, meta, mainContent)
    
    // Calculate word count
    const wordCount = mainContent.split(/\s+/).filter(Boolean).length
    
    return {
      title,
      description: metaDesc,
      mainContent,
      headings,
      links,
      images,
      schema,
      meta,
      wordCount,
      paragraphs: paragraphCount,
      faqs,
      tables: tableCount,
      lists: listCount,
      contentToCodeRatio,
      keywords
    }
  } catch (error) {
    console.error('Error fetching URL content:', error)
    return null
  }
}

// Helper function to find the main content of a page
function findMainContent(document: Document): Element | null {
  // Priority list of selectors that typically contain the main content
  const contentSelectors = [
    'article', 
    'main', 
    '.content', 
    '.post-content', 
    '.entry-content', 
    '#content',
    '.main-content',
    '[role="main"]'
  ]
  
  // Try each selector
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector)
    if (element && element.textContent && element.textContent.trim().length > 100) {
      return element
    }
  }
  
  // Fallback to body if no suitable element found
  return document.body
}

// Extract FAQ content from common patterns
function extractFAQs(document: Document): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = []
  
  // Method 1: Look for FAQ schema
  const faqSchemas = document.querySelectorAll('script[type="application/ld+json"]')
  for (const schema of Array.from(faqSchemas)) {
    try {
      const data = JSON.parse(schema.textContent || '{}')
      if (data['@type'] === 'FAQPage' && data.mainEntity) {
        const entities = Array.isArray(data.mainEntity) ? data.mainEntity : [data.mainEntity]
        entities.forEach((entity: any) => {
          if (entity['@type'] === 'Question' && entity.name && entity.acceptedAnswer?.text) {
            faqs.push({
              question: entity.name,
              answer: entity.acceptedAnswer.text
            })
          }
        })
      }
    } catch (e) {
      // Invalid JSON, skip
    }
  }
  
  // Method 2: Look for DL/DT/DD structures
  const dlElements = document.querySelectorAll('dl')
  dlElements.forEach(dl => {
    const terms = dl.querySelectorAll('dt')
    terms.forEach(dt => {
      const question = dt.textContent || ''
      let answerElement = dt.nextElementSibling
      if (answerElement && answerElement.tagName === 'DD') {
        faqs.push({
          question: cleanText(question),
          answer: cleanText(answerElement.textContent || '')
        })
      }
    })
  })
  
  // Method 3: Look for common question heading patterns
  const questionHeadings = Array.from(document.querySelectorAll('h2, h3, h4'))
    .filter(h => {
      const text = h.textContent || ''
      return text.endsWith('?') || 
             text.toLowerCase().includes('how to') ||
             text.toLowerCase().includes('what is') ||
             text.toLowerCase().includes('why ')
    })
  
  questionHeadings.forEach(heading => {
    const question = heading.textContent || ''
    let answerElement = heading.nextElementSibling
    let answer = ''
    
    // Collect text until the next heading or end of 5 paragraphs
    let paragraphCount = 0
    while (answerElement && 
           !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(answerElement.tagName) && 
           paragraphCount < 5) {
      if (answerElement.tagName === 'P') {
        answer += ' ' + (answerElement.textContent || '')
        paragraphCount++
      }
      answerElement = answerElement.nextElementSibling
    }
    
    if (answer.trim()) {
      faqs.push({
        question: cleanText(question),
        answer: cleanText(answer)
      })
    }
  })
  
  return faqs
}

// Extract potential keywords from the content
function extractKeywords(document: Document, meta: Record<string, string>, content: string): string[] {
  const keywords: Set<string> = new Set()
  
  // 1. Check meta keywords
  if (meta['keywords']) {
    meta['keywords'].split(',').forEach(kw => {
      keywords.add(kw.trim().toLowerCase())
    })
  }
  
  // 2. Check meta news_keywords (sometimes used)
  if (meta['news_keywords']) {
    meta['news_keywords'].split(',').forEach(kw => {
      keywords.add(kw.trim().toLowerCase())
    })
  }
  
  // 3. Extract keywords from title tags
  const titleText = document.querySelector('title')?.textContent || ''
  extractSignificantTerms(titleText).forEach(term => keywords.add(term))
  
  // 4. Extract keywords from headings
  const headingTexts = Array.from(document.querySelectorAll('h1, h2'))
    .map(h => h.textContent || '')
    .join(' ')
  
  extractSignificantTerms(headingTexts).forEach(term => keywords.add(term))
  
  // 5. Look for emphasized text
  const emphasizedText = Array.from(document.querySelectorAll('strong, b, em'))
    .map(el => el.textContent || '')
    .join(' ')
  
  extractSignificantTerms(emphasizedText).forEach(term => keywords.add(term))
  
  // 6. Generate keywords from content (simple frequency analysis)
  const contentKeywords = generateKeywordsFromContent(content)
  contentKeywords.forEach(kw => keywords.add(kw))
  
  // Convert set to array and limit to top 20 keywords
  return Array.from(keywords).slice(0, 20)
}

function extractSignificantTerms(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !stopWords.includes(word))
  
  return Array.from(new Set(words))
}

function generateKeywordsFromContent(content: string): string[] {
  // Simple frequency-based keyword extraction
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !stopWords.includes(word))
  
  // Count word frequencies
  const wordCounts: Record<string, number> = {}
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1
  })
  
  // Get top frequent words
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(entry => entry[0])
}

// Common English stop words to exclude from keyword extraction
const stopWords = [
  'about', 'above', 'after', 'again', 'against', 'all', 'and', 'any', 'are', 'because',
  'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'could', 'did',
  'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'has', 'have', 'having', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his',
  'how', 'into', 'its', 'itself', 'just', 'more', 'most', 'myself', 'nor', 'not',
  'now', 'off', 'once', 'only', 'other', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'she', 'should', 'some', 'such', 'than', 'that', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
  'through', 'under', 'until', 'very', 'was', 'were', 'what', 'when', 'where', 'which',
  'while', 'who', 'whom', 'why', 'will', 'with', 'you', 'your', 'yours', 'yourself',
  'yourselves'
]

// Helper function to clean up text
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim()
} 