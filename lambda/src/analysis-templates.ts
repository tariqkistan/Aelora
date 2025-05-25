/**
 * Industry-specific analysis templates for targeted AI insights
 * Provides focused, actionable recommendations based on content type and industry patterns
 */

import { ExtractedContent } from './content-extractor';

export interface AnalysisTemplate {
  systemPrompt: string;
  analysisPrompt: string;
  focusAreas: string[];
  expectedInsights: string[];
}

/**
 * Get analysis template based on content type and detected industry
 */
export function getAnalysisTemplate(extractedContent: ExtractedContent): AnalysisTemplate {
  const { contentType, title, headings, keyParagraphs } = extractedContent;
  
  // Detect industry from content
  const industry = detectIndustry(title, headings, keyParagraphs);
  
  // Get template based on content type and industry
  switch (contentType) {
    case 'product':
      return getProductPageTemplate(industry);
    case 'service':
      return getServicePageTemplate(industry);
    case 'blog':
      return getBlogTemplate(industry);
    case 'homepage':
      return getHomepageTemplate(industry);
    case 'about':
      return getAboutPageTemplate();
    default:
      return getGenericTemplate();
  }
}

/**
 * Detect industry from content patterns
 */
function detectIndustry(title: string, headings: any, keyParagraphs: string[]): string {
  const allText = [
    title,
    ...headings.h1,
    ...headings.h2,
    ...headings.h3,
    ...keyParagraphs
  ].join(' ').toLowerCase();
  
  // E-commerce indicators
  if (allText.includes('shop') || allText.includes('buy') || allText.includes('cart') || 
      allText.includes('product') || allText.includes('store')) {
    return 'ecommerce';
  }
  
  // SaaS indicators
  if (allText.includes('software') || allText.includes('platform') || allText.includes('api') ||
      allText.includes('dashboard') || allText.includes('subscription')) {
    return 'saas';
  }
  
  // Local business indicators
  if (allText.includes('location') || allText.includes('address') || allText.includes('local') ||
      allText.includes('near me') || allText.includes('hours')) {
    return 'local';
  }
  
  // Professional services
  if (allText.includes('consulting') || allText.includes('legal') || allText.includes('accounting') ||
      allText.includes('marketing') || allText.includes('agency')) {
    return 'professional';
  }
  
  // Healthcare
  if (allText.includes('health') || allText.includes('medical') || allText.includes('doctor') ||
      allText.includes('treatment') || allText.includes('clinic')) {
    return 'healthcare';
  }
  
  return 'general';
}

/**
 * Product page analysis template
 */
function getProductPageTemplate(industry: string): AnalysisTemplate {
  const basePrompt = `You are analyzing a product page for AI search optimization. Focus on how well this page would perform in AI-powered search results and recommendations.`;
  
  const industrySpecific = industry === 'ecommerce' 
    ? ' Pay special attention to product descriptions, pricing clarity, trust signals, and purchase intent optimization.'
    : ' Focus on product value proposition, differentiation, and conversion optimization.';
  
  return {
    systemPrompt: basePrompt + industrySpecific,
    analysisPrompt: `Analyze this product page content and provide specific recommendations for:

1. **Product Value Clarity**: How clearly does the page communicate what the product does and its key benefits?
2. **Purchase Intent Optimization**: How well does the content address buyer concerns and objections?
3. **Trust & Credibility**: What trust signals are present or missing?
4. **Competitive Differentiation**: How well does the content distinguish this product from alternatives?
5. **AI Discoverability**: How likely is this content to be surfaced by AI search engines for relevant queries?

Provide specific, actionable recommendations that will directly impact conversions and AI visibility.`,
    focusAreas: [
      'Value proposition clarity',
      'Trust signals and social proof',
      'Feature-benefit translation',
      'Objection handling',
      'Purchase friction reduction'
    ],
    expectedInsights: [
      'Specific missing trust elements',
      'Value proposition improvements',
      'Content gaps vs. buyer questions',
      'AI-friendly formatting suggestions'
    ]
  };
}

/**
 * Service page analysis template
 */
function getServicePageTemplate(industry: string): AnalysisTemplate {
  const basePrompt = `You are analyzing a service page for AI search optimization. Focus on how well this page demonstrates expertise and addresses client needs.`;
  
  const industrySpecific = industry === 'professional'
    ? ' Pay special attention to credibility indicators, case studies, and expertise demonstration.'
    : ' Focus on service benefits, process clarity, and client outcomes.';
  
  return {
    systemPrompt: basePrompt + industrySpecific,
    analysisPrompt: `Analyze this service page content and provide specific recommendations for:

1. **Service Clarity**: How clearly does the page explain what the service includes and excludes?
2. **Expertise Demonstration**: How well does the content establish authority and credibility?
3. **Client Outcome Focus**: How effectively does the content communicate results and benefits?
4. **Process Transparency**: How well does the page explain the service delivery process?
5. **Lead Generation Optimization**: How effectively does the content move prospects toward contact?

Focus on recommendations that will improve lead quality and AI search visibility for service-related queries.`,
    focusAreas: [
      'Service scope definition',
      'Expertise and authority signals',
      'Client success stories',
      'Process and timeline clarity',
      'Contact conversion optimization'
    ],
    expectedInsights: [
      'Missing credibility elements',
      'Service differentiation opportunities',
      'Client concern addressing',
      'Lead generation improvements'
    ]
  };
}

/**
 * Blog/content analysis template
 */
function getBlogTemplate(industry: string): AnalysisTemplate {
  return {
    systemPrompt: `You are analyzing blog/article content for AI search optimization. Focus on content depth, expertise demonstration, and user value.`,
    analysisPrompt: `Analyze this blog content and provide specific recommendations for:

1. **Content Depth & Completeness**: How thoroughly does the content cover the topic?
2. **Expertise Demonstration**: How well does the content establish author/brand authority?
3. **Actionable Value**: How much practical, implementable advice does the content provide?
4. **Search Intent Matching**: How well does the content match what users are actually searching for?
5. **AI Citation Worthiness**: How likely is this content to be cited or referenced by AI systems?

Provide recommendations that will improve content authority and AI search visibility.`,
    focusAreas: [
      'Topic comprehensiveness',
      'Expertise and authority signals',
      'Actionable insights and examples',
      'Search intent alignment',
      'Content structure and scannability'
    ],
    expectedInsights: [
      'Content gaps and expansion opportunities',
      'Authority building suggestions',
      'User value enhancement',
      'AI-friendly formatting improvements'
    ]
  };
}

/**
 * Homepage analysis template
 */
function getHomepageTemplate(industry: string): AnalysisTemplate {
  return {
    systemPrompt: `You are analyzing a homepage for AI search optimization. Focus on brand clarity, value communication, and user journey optimization.`,
    analysisPrompt: `Analyze this homepage content and provide specific recommendations for:

1. **Brand Value Clarity**: How quickly can visitors understand what the company does and for whom?
2. **Differentiation**: How well does the page communicate what makes this company unique?
3. **User Journey Optimization**: How effectively does the page guide different visitor types to relevant next steps?
4. **Trust & Credibility**: What trust signals are present to build immediate confidence?
5. **AI Understanding**: How well would an AI system understand and categorize this business?

Focus on recommendations that will improve conversion rates and AI search visibility for brand-related queries.`,
    focusAreas: [
      'Value proposition clarity',
      'Brand differentiation',
      'Navigation and user flow',
      'Trust signal optimization',
      'Multi-audience messaging'
    ],
    expectedInsights: [
      'Value proposition refinement',
      'Trust signal additions',
      'User journey improvements',
      'Brand clarity enhancements'
    ]
  };
}

/**
 * About page analysis template
 */
function getAboutPageTemplate(): AnalysisTemplate {
  return {
    systemPrompt: `You are analyzing an About page for AI search optimization. Focus on credibility building and brand story effectiveness.`,
    analysisPrompt: `Analyze this About page content and provide specific recommendations for:

1. **Credibility Building**: How effectively does the page establish trust and expertise?
2. **Brand Story**: How compelling and memorable is the company narrative?
3. **Team & Expertise**: How well does the content showcase relevant qualifications and experience?
4. **Values & Mission**: How clearly are company values and mission communicated?
5. **Connection Building**: How well does the page create emotional connection with visitors?

Provide recommendations that will strengthen brand trust and AI understanding of company expertise.`,
    focusAreas: [
      'Credibility and trust signals',
      'Brand story and narrative',
      'Team expertise showcase',
      'Values and mission clarity',
      'Emotional connection elements'
    ],
    expectedInsights: [
      'Trust building opportunities',
      'Story enhancement suggestions',
      'Expertise highlighting',
      'Brand personality development'
    ]
  };
}

/**
 * Generic analysis template for unknown content types
 */
function getGenericTemplate(): AnalysisTemplate {
  return {
    systemPrompt: `You are analyzing web content for AI search optimization. Focus on content clarity, user value, and AI discoverability.`,
    analysisPrompt: `Analyze this content and provide specific recommendations for:

1. **Content Purpose**: How clearly does the page communicate its purpose and value to visitors?
2. **User Experience**: How well does the content serve user needs and answer their questions?
3. **Information Architecture**: How well is the content organized and structured?
4. **AI Optimization**: How well would this content perform in AI-powered search results?
5. **Action Clarity**: How clear are the next steps for visitors?

Provide actionable recommendations that will improve user experience and AI search visibility.`,
    focusAreas: [
      'Content purpose and clarity',
      'User value and utility',
      'Information organization',
      'AI search optimization',
      'Call-to-action effectiveness'
    ],
    expectedInsights: [
      'Content clarity improvements',
      'User experience enhancements',
      'Structure optimization',
      'AI visibility improvements'
    ]
  };
} 