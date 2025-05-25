/**
 * Smart content extraction for cost-effective AI analysis
 * Prioritizes high-impact content while reducing token usage by 60-80%
 */

import { JSDOM } from 'jsdom';

export interface ExtractedContent {
  title: string;
  metaDescription: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  keyParagraphs: string[];
  listItems: string[];
  callToActions: string[];
  contentType: 'product' | 'service' | 'blog' | 'homepage' | 'about' | 'contact' | 'unknown';
  wordCount: number;
  priorityContent: string; // Optimized content for AI analysis
}

/**
 * Extract high-priority content for AI analysis
 */
export function extractPriorityContent(html: string, url: string): ExtractedContent {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Extract basic metadata
  const title = document.querySelector('title')?.textContent?.trim() || '';
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
  
  // Extract headings with hierarchy
  const headings = {
    h1: extractTextFromElements(document.querySelectorAll('h1')),
    h2: extractTextFromElements(document.querySelectorAll('h2')),
    h3: extractTextFromElements(document.querySelectorAll('h3'))
  };
  
  // Extract key paragraphs (first paragraph of each section, conclusion paragraphs)
  const keyParagraphs = extractKeyParagraphs(document);
  
  // Extract list items (often contain key features/benefits)
  const listItems = extractListItems(document);
  
  // Extract call-to-action elements
  const callToActions = extractCallToActions(document);
  
  // Determine content type
  const contentType = determineContentType(url, title, headings, document);
  
  // Create optimized content string for AI analysis
  const priorityContent = buildPriorityContent({
    title,
    metaDescription,
    headings,
    keyParagraphs,
    listItems,
    callToActions,
    contentType
  });
  
  return {
    title,
    metaDescription,
    headings,
    keyParagraphs,
    listItems,
    callToActions,
    contentType,
    wordCount: priorityContent.split(/\s+/).length,
    priorityContent
  };
}

/**
 * Extract text content from NodeList elements
 */
function extractTextFromElements(elements: NodeListOf<Element>): string[] {
  return Array.from(elements)
    .map(el => el.textContent?.trim() || '')
    .filter(text => text.length > 0)
    .slice(0, 10); // Limit to prevent token overflow
}

/**
 * Extract key paragraphs that are most likely to contain important information
 */
function extractKeyParagraphs(document: Document): string[] {
  const paragraphs = Array.from(document.querySelectorAll('p'));
  const keyParagraphs: string[] = [];
  
  // Get first paragraph (often intro/summary)
  if (paragraphs[0]) {
    const firstP = paragraphs[0].textContent?.trim();
    if (firstP && firstP.length > 50) {
      keyParagraphs.push(firstP);
    }
  }
  
  // Get paragraphs that follow headings (section introductions)
  const headings = document.querySelectorAll('h1, h2, h3');
  headings.forEach(heading => {
    let nextElement = heading.nextElementSibling;
    while (nextElement && nextElement.tagName !== 'P' && keyParagraphs.length < 8) {
      nextElement = nextElement.nextElementSibling;
    }
    if (nextElement && nextElement.tagName === 'P') {
      const text = nextElement.textContent?.trim();
      if (text && text.length > 50 && !keyParagraphs.includes(text)) {
        keyParagraphs.push(text);
      }
    }
  });
  
  // Get conclusion paragraphs (often contain key benefits/summaries)
  const conclusionKeywords = ['conclusion', 'summary', 'benefits', 'why choose', 'get started'];
  paragraphs.forEach(p => {
    const text = p.textContent?.toLowerCase() || '';
    if (conclusionKeywords.some(keyword => text.includes(keyword)) && keyParagraphs.length < 10) {
      const fullText = p.textContent?.trim();
      if (fullText && fullText.length > 50 && !keyParagraphs.includes(fullText)) {
        keyParagraphs.push(fullText);
      }
    }
  });
  
  return keyParagraphs.slice(0, 8); // Limit to most important paragraphs
}

/**
 * Extract list items that often contain key features or benefits
 */
function extractListItems(document: Document): string[] {
  const lists = document.querySelectorAll('ul, ol');
  const items: string[] = [];
  
  lists.forEach(list => {
    const listItems = list.querySelectorAll('li');
    listItems.forEach(item => {
      const text = item.textContent?.trim();
      if (text && text.length > 10 && text.length < 200) {
        items.push(text);
      }
    });
  });
  
  return items.slice(0, 15); // Limit to prevent token overflow
}

/**
 * Extract call-to-action elements
 */
function extractCallToActions(document: Document): string[] {
  const ctaSelectors = [
    'button',
    'a[class*="btn"]',
    'a[class*="button"]',
    'a[class*="cta"]',
    '[class*="call-to-action"]'
  ];
  
  const ctas: string[] = [];
  
  ctaSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const text = el.textContent?.trim();
      if (text && text.length > 2 && text.length < 50) {
        ctas.push(text);
      }
    });
  });
  
  return [...new Set(ctas)].slice(0, 10); // Remove duplicates and limit
}

/**
 * Determine content type based on URL patterns and content analysis
 */
function determineContentType(
  url: string, 
  title: string, 
  headings: { h1: string[]; h2: string[]; h3: string[] },
  document: Document
): ExtractedContent['contentType'] {
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();
  const allHeadings = [...headings.h1, ...headings.h2, ...headings.h3].join(' ').toLowerCase();
  
  // Product page indicators
  if (urlLower.includes('/product') || 
      urlLower.includes('/shop') ||
      titleLower.includes('buy') ||
      allHeadings.includes('price') ||
      document.querySelector('[class*="price"]')) {
    return 'product';
  }
  
  // Service page indicators
  if (urlLower.includes('/service') ||
      urlLower.includes('/solutions') ||
      titleLower.includes('service') ||
      allHeadings.includes('how we help') ||
      allHeadings.includes('our services')) {
    return 'service';
  }
  
  // Blog/article indicators
  if (urlLower.includes('/blog') ||
      urlLower.includes('/article') ||
      urlLower.includes('/news') ||
      document.querySelector('article') ||
      document.querySelector('[class*="post"]')) {
    return 'blog';
  }
  
  // About page indicators
  if (urlLower.includes('/about') ||
      titleLower.includes('about') ||
      allHeadings.includes('our story') ||
      allHeadings.includes('who we are')) {
    return 'about';
  }
  
  // Contact page indicators
  if (urlLower.includes('/contact') ||
      titleLower.includes('contact') ||
      document.querySelector('form[class*="contact"]') ||
      allHeadings.includes('get in touch')) {
    return 'contact';
  }
  
  // Homepage indicators (often root URL or contains multiple sections)
  if (url.split('/').length <= 4 && 
      (headings.h2.length > 3 || allHeadings.includes('welcome'))) {
    return 'homepage';
  }
  
  return 'unknown';
}

/**
 * Build optimized content string for AI analysis
 */
function buildPriorityContent(data: {
  title: string;
  metaDescription: string;
  headings: { h1: string[]; h2: string[]; h3: string[] };
  keyParagraphs: string[];
  listItems: string[];
  callToActions: string[];
  contentType: string;
}): string {
  const sections: string[] = [];
  
  // Title and meta (highest priority)
  if (data.title) {
    sections.push(`TITLE: ${data.title}`);
  }
  
  if (data.metaDescription) {
    sections.push(`META DESCRIPTION: ${data.metaDescription}`);
  }
  
  // Content type context
  sections.push(`CONTENT TYPE: ${data.contentType}`);
  
  // Headings structure
  if (data.headings.h1.length > 0) {
    sections.push(`H1 HEADINGS: ${data.headings.h1.join(' | ')}`);
  }
  
  if (data.headings.h2.length > 0) {
    sections.push(`H2 HEADINGS: ${data.headings.h2.slice(0, 8).join(' | ')}`);
  }
  
  if (data.headings.h3.length > 0) {
    sections.push(`H3 HEADINGS: ${data.headings.h3.slice(0, 6).join(' | ')}`);
  }
  
  // Key content paragraphs
  if (data.keyParagraphs.length > 0) {
    sections.push(`KEY CONTENT:\n${data.keyParagraphs.slice(0, 5).join('\n\n')}`);
  }
  
  // Important features/benefits (from lists)
  if (data.listItems.length > 0) {
    sections.push(`KEY FEATURES/BENEFITS:\n• ${data.listItems.slice(0, 10).join('\n• ')}`);
  }
  
  // Call-to-actions (indicate user intent/goals)
  if (data.callToActions.length > 0) {
    sections.push(`CALL-TO-ACTIONS: ${data.callToActions.slice(0, 5).join(' | ')}`);
  }
  
  return sections.join('\n\n');
} 