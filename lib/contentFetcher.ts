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
}

export async function fetchContentFromUrl(url: string): Promise<WebContent | null> {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }
    
    const html = await response.text()
    const dom = new JSDOM(html)
    const document = dom.window.document
    
    // Extract title
    const title = document.querySelector('title')?.textContent || ''
    
    // Extract meta description
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    
    // Extract main content (prioritizing article or main, falling back to body)
    const contentElement = document.querySelector('article') || 
                          document.querySelector('main') || 
                          document.querySelector('body')
    const mainContent = contentElement ? cleanText(contentElement.textContent || '') : ''
    
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
      wordCount
    }
  } catch (error) {
    console.error('Error fetching URL content:', error)
    return null
  }
}

// Helper function to clean up text
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim()
} 