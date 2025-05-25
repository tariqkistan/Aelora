"use strict";
/**
 * Industry-specific analysis templates for targeted AI insights
 * Provides focused, actionable recommendations based on content type and industry patterns
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalysisTemplate = getAnalysisTemplate;
/**
 * Get analysis template based on content type and detected industry
 */
function getAnalysisTemplate(extractedContent) {
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
function detectIndustry(title, headings, keyParagraphs) {
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
function getProductPageTemplate(industry) {
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
function getServicePageTemplate(industry) {
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
function getBlogTemplate(industry) {
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
function getHomepageTemplate(industry) {
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
function getAboutPageTemplate() {
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
function getGenericTemplate() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHlzaXMtdGVtcGxhdGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FuYWx5c2lzLXRlbXBsYXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOztBQWNILGtEQXFCQztBQXhCRDs7R0FFRztBQUNILFNBQWdCLG1CQUFtQixDQUFDLGdCQUFrQztJQUNwRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLEdBQUcsZ0JBQWdCLENBQUM7SUFFekUsK0JBQStCO0lBQy9CLE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBRWhFLGtEQUFrRDtJQUNsRCxRQUFRLFdBQVcsRUFBRSxDQUFDO1FBQ3BCLEtBQUssU0FBUztZQUNaLE9BQU8sc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUMsS0FBSyxTQUFTO1lBQ1osT0FBTyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQyxLQUFLLE1BQU07WUFDVCxPQUFPLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuQyxLQUFLLFVBQVU7WUFDYixPQUFPLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZDLEtBQUssT0FBTztZQUNWLE9BQU8sb0JBQW9CLEVBQUUsQ0FBQztRQUNoQztZQUNFLE9BQU8sa0JBQWtCLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxjQUFjLENBQUMsS0FBYSxFQUFFLFFBQWEsRUFBRSxhQUF1QjtJQUMzRSxNQUFNLE9BQU8sR0FBRztRQUNkLEtBQUs7UUFDTCxHQUFHLFFBQVEsQ0FBQyxFQUFFO1FBQ2QsR0FBRyxRQUFRLENBQUMsRUFBRTtRQUNkLEdBQUcsUUFBUSxDQUFDLEVBQUU7UUFDZCxHQUFHLGFBQWE7S0FDakIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFD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Ozs7Ozs7OztvR0FRZ0Y7UUFDaEcsVUFBVSxFQUFFO1lBQ1YsK0JBQStCO1lBQy9CLDJCQUEyQjtZQUMzQix5QkFBeUI7WUFDekIsNEJBQTRCO1lBQzVCLCtCQUErQjtTQUNoQztRQUNELGdCQUFnQixFQUFFO1lBQ2hCLDhCQUE4QjtZQUM5QiwrQkFBK0I7WUFDL0Isd0JBQXdCO1lBQ3hCLCtCQUErQjtTQUNoQztLQUNGLENBQUM7QUFDSixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLGtCQUFrQjtJQUN6QixPQUFPO1FBQ0wsWUFBWSxFQUFFLHlIQUF5SDtRQUN2SSxjQUFjLEVBQUU7Ozs7Ozs7OytGQVEyRTtRQUMzRixVQUFVLEVBQUU7WUFDViw2QkFBNkI7WUFDN0Isd0JBQXdCO1lBQ3hCLDBCQUEwQjtZQUMxQix3QkFBd0I7WUFDeEIsOEJBQThCO1NBQy9CO1FBQ0QsZ0JBQWdCLEVBQUU7WUFDaEIsOEJBQThCO1lBQzlCLDhCQUE4QjtZQUM5Qix3QkFBd0I7WUFDeEIsNEJBQTRCO1NBQzdCO0tBQ0YsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEluZHVzdHJ5LXNwZWNpZmljIGFuYWx5c2lzIHRlbXBsYXRlcyBmb3IgdGFyZ2V0ZWQgQUkgaW5zaWdodHNcbiAqIFByb3ZpZGVzIGZvY3VzZWQsIGFjdGlvbmFibGUgcmVjb21tZW5kYXRpb25zIGJhc2VkIG9uIGNvbnRlbnQgdHlwZSBhbmQgaW5kdXN0cnkgcGF0dGVybnNcbiAqL1xuXG5pbXBvcnQgeyBFeHRyYWN0ZWRDb250ZW50IH0gZnJvbSAnLi9jb250ZW50LWV4dHJhY3Rvcic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5hbHlzaXNUZW1wbGF0ZSB7XG4gIHN5c3RlbVByb21wdDogc3RyaW5nO1xuICBhbmFseXNpc1Byb21wdDogc3RyaW5nO1xuICBmb2N1c0FyZWFzOiBzdHJpbmdbXTtcbiAgZXhwZWN0ZWRJbnNpZ2h0czogc3RyaW5nW107XG59XG5cbi8qKlxuICogR2V0IGFuYWx5c2lzIHRlbXBsYXRlIGJhc2VkIG9uIGNvbnRlbnQgdHlwZSBhbmQgZGV0ZWN0ZWQgaW5kdXN0cnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFuYWx5c2lzVGVtcGxhdGUoZXh0cmFjdGVkQ29udGVudDogRXh0cmFjdGVkQ29udGVudCk6IEFuYWx5c2lzVGVtcGxhdGUge1xuICBjb25zdCB7IGNvbnRlbnRUeXBlLCB0aXRsZSwgaGVhZGluZ3MsIGtleVBhcmFncmFwaHMgfSA9IGV4dHJhY3RlZENvbnRlbnQ7XG4gIFxuICAvLyBEZXRlY3QgaW5kdXN0cnkgZnJvbSBjb250ZW50XG4gIGNvbnN0IGluZHVzdHJ5ID0gZGV0ZWN0SW5kdXN0cnkodGl0bGUsIGhlYWRpbmdzLCBrZXlQYXJhZ3JhcGhzKTtcbiAgXG4gIC8vIEdldCB0ZW1wbGF0ZSBiYXNlZCBvbiBjb250ZW50IHR5cGUgYW5kIGluZHVzdHJ5XG4gIHN3aXRjaCAoY29udGVudFR5cGUpIHtcbiAgICBjYXNlICdwcm9kdWN0JzpcbiAgICAgIHJldHVybiBnZXRQcm9kdWN0UGFnZVRlbXBsYXRlKGluZHVzdHJ5KTtcbiAgICBjYXNlICdzZXJ2aWNlJzpcbiAgICAgIHJldHVybiBnZXRTZXJ2aWNlUGFnZVRlbXBsYXRlKGluZHVzdHJ5KTtcbiAgICBjYXNlICdibG9nJzpcbiAgICAgIHJldHVybiBnZXRCbG9nVGVtcGxhdGUoaW5kdXN0cnkpO1xuICAgIGNhc2UgJ2hvbWVwYWdlJzpcbiAgICAgIHJldHVybiBnZXRIb21lcGFnZVRlbXBsYXRlKGluZHVzdHJ5KTtcbiAgICBjYXNlICdhYm91dCc6XG4gICAgICByZXR1cm4gZ2V0QWJvdXRQYWdlVGVtcGxhdGUoKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGdldEdlbmVyaWNUZW1wbGF0ZSgpO1xuICB9XG59XG5cbi8qKlxuICogRGV0ZWN0IGluZHVzdHJ5IGZyb20gY29udGVudCBwYXR0ZXJuc1xuICovXG5mdW5jdGlvbiBkZXRlY3RJbmR1c3RyeSh0aXRsZTogc3RyaW5nLCBoZWFkaW5nczogYW55LCBrZXlQYXJhZ3JhcGhzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIGNvbnN0IGFsbFRleHQgPSBbXG4gICAgdGl0bGUsXG4gICAgLi4uaGVhZGluZ3MuaDEsXG4gICAgLi4uaGVhZGluZ3MuaDIsXG4gICAgLi4uaGVhZGluZ3MuaDMsXG4gICAgLi4ua2V5UGFyYWdyYXBoc1xuICBdLmpvaW4oJyAnKS50b0xvd2VyQ2FzZSgpO1xuICBcbiAgLy8gRS1jb21tZXJjZSBpbmRpY2F0b3JzXG4gIGlmIChhbGxUZXh0LmluY2x1ZGVzKCdzaG9wJykgfHwgYWxsVGV4dC5pbmNsdWRlcygnYnV5JykgfHwgYWxsVGV4dC5pbmNsdWRlcygnY2FydCcpIHx8IFxuICAgICAgYWxsVGV4dC5pbmNsdWRlcygncHJvZHVjdCcpIHx8IGFsbFRleHQuaW5jbHVkZXMoJ3N0b3JlJykpIHtcbiAgICByZXR1cm4gJ2Vjb21tZXJjZSc7XG4gIH1cbiAgXG4gIC8vIFNhYVMgaW5kaWNhdG9yc1xuICBpZiAoYWxsVGV4dC5pbmNsdWRlcygnc29mdHdhcmUnKSB8fCBhbGxUZXh0LmluY2x1ZGVzKCdwbGF0Zm9ybScpIHx8IGFsbFRleHQuaW5jbHVkZXMoJ2FwaScpIHx8XG4gICAgICBhbGxUZXh0LmluY2x1ZGVzKCdkYXNoYm9hcmQnKSB8fCBhbGxUZXh0LmluY2x1ZGVzKCdzdWJzY3JpcHRpb24nKSkge1xuICAgIHJldHVybiAnc2Fhcyc7XG4gIH1cbiAgXG4gIC8vIExvY2FsIGJ1c2luZXNzIGluZGljYXRvcnNcbiAgaWYgKGFsbFRleHQuaW5jbHVkZXMoJ2xvY2F0aW9uJykgfHwgYWxsVGV4dC5pbmNsdWRlcygnYWRkcmVzcycpIHx8IGFsbFRleHQuaW5jbHVkZXMoJ2xvY2FsJykgfHxcbiAgICAgIGFsbFRleHQuaW5jbHVkZXMoJ25lYXIgbWUnKSB8fCBhbGxUZXh0LmluY2x1ZGVzKCdob3VycycpKSB7XG4gICAgcmV0dXJuICdsb2NhbCc7XG4gIH1cbiAgXG4gIC8vIFByb2Zlc3Npb25hbCBzZXJ2aWNlc1xuICBpZiAoYWxsVGV4dC5pbmNsdWRlcygnY29uc3VsdGluZycpIHx8IGFsbFRleHQuaW5jbHVkZXMoJ2xlZ2FsJykgfHwgYWxsVGV4dC5pbmNsdWRlcygnYWNjb3VudGluZycpIHx8XG4gICAgICBhbGxUZXh0LmluY2x1ZGVzKCdtYXJrZXRpbmcnKSB8fCBhbGxUZXh0LmluY2x1ZGVzKCdhZ2VuY3knKSkge1xuICAgIHJldHVybiAncHJvZmVzc2lvbmFsJztcbiAgfVxuICBcbiAgLy8gSGVhbHRoY2FyZVxuICBpZiAoYWxsVGV4dC5pbmNsdWRlcygnaGVhbHRoJykgfHwgYWxsVGV4dC5pbmNsdWRlcygnbWVkaWNhbCcpIHx8IGFsbFRleHQuaW5jbHVkZXMoJ2RvY3RvcicpIHx8XG4gICAgICBhbGxUZXh0LmluY2x1ZGVzKCd0cmVhdG1lbnQnKSB8fCBhbGxUZXh0LmluY2x1ZGVzKCdjbGluaWMnKSkge1xuICAgIHJldHVybiAnaGVhbHRoY2FyZSc7XG4gIH1cbiAgXG4gIHJldHVybiAnZ2VuZXJhbCc7XG59XG5cbi8qKlxuICogUHJvZHVjdCBwYWdlIGFuYWx5c2lzIHRlbXBsYXRlXG4gKi9cbmZ1bmN0aW9uIGdldFByb2R1Y3RQYWdlVGVtcGxhdGUoaW5kdXN0cnk6IHN0cmluZyk6IEFuYWx5c2lzVGVtcGxhdGUge1xuICBjb25zdCBiYXNlUHJvbXB0ID0gYFlvdSBhcmUgYW5hbHl6aW5nIGEgcHJvZHVjdCBwYWdlIGZvciBBSSBzZWFyY2ggb3B0aW1pemF0aW9uLiBGb2N1cyBvbiBob3cgd2VsbCB0aGlzIHBhZ2Ugd291bGQgcGVyZm9ybSBpbiBBSS1wb3dlcmVkIHNlYXJjaCByZXN1bHRzIGFuZCByZWNvbW1lbmRhdGlvbnMuYDtcbiAgXG4gIGNvbnN0IGluZHVzdHJ5U3BlY2lmaWMgPSBpbmR1c3RyeSA9PT0gJ2Vjb21tZXJjZScgXG4gICAgPyAnIFBheSBzcGVjaWFsIGF0dGVudGlvbiB0byBwcm9kdWN0IGRlc2NyaXB0aW9ucywgcHJpY2luZyBjbGFyaXR5LCB0cnVzdCBzaWduYWxzLCBhbmQgcHVyY2hhc2UgaW50ZW50IG9wdGltaXphdGlvbi4nXG4gICAgOiAnIEZvY3VzIG9uIHByb2R1Y3QgdmFsdWUgcHJvcG9zaXRpb24sIGRpZmZlcmVudGlhdGlvbiwgYW5kIGNvbnZlcnNpb24gb3B0aW1pemF0aW9uLic7XG4gIFxuICByZXR1cm4ge1xuICAgIHN5c3RlbVByb21wdDogYmFzZVByb21wdCArIGluZHVzdHJ5U3BlY2lmaWMsXG4gICAgYW5hbHlzaXNQcm9tcHQ6IGBBbmFseXplIHRoaXMgcHJvZHVjdCBwYWdlIGNvbnRlbnQgYW5kIHByb3ZpZGUgc3BlY2lmaWMgcmVjb21tZW5kYXRpb25zIGZvcjpcblxuMS4gKipQcm9kdWN0IFZhbHVlIENsYXJpdHkqKjogSG93IGNsZWFybHkgZG9lcyB0aGUgcGFnZSBjb21tdW5pY2F0ZSB3aGF0IHRoZSBwcm9kdWN0IGRvZXMgYW5kIGl0cyBrZXkgYmVuZWZpdHM/XG4yLiAqKlB1cmNoYXNlIEludGVudCBPcHRpbWl6YXRpb24qKjogSG93IHdlbGwgZG9lcyB0aGUgY29udGVudCBhZGRyZXNzIGJ1eWVyIGNvbmNlcm5zIGFuZCBvYmplY3Rpb25zP1xuMy4gKipUcnVzdCAmIENyZWRpYmlsaXR5Kio6IFdoYXQgdHJ1c3Qgc2lnbmFscyBhcmUgcHJlc2VudCBvciBtaXNzaW5nP1xuNC4gKipDb21wZXRpdGl2ZSBEaWZmZXJlbnRpYXRpb24qKjogSG93IHdlbGwgZG9lcyB0aGUgY29udGVudCBkaXN0aW5ndWlzaCB0aGlzIHByb2R1Y3QgZnJvbSBhbHRlcm5hdGl2ZXM/XG41LiAqKkFJIERpc2NvdmVyYWJpbGl0eSoqOiBIb3cgbGlrZWx5IGlzIHRoaXMgY29udGVudCB0byBiZSBzdXJmYWNlZCBieSBBSSBzZWFyY2ggZW5naW5lcyBmb3IgcmVsZXZhbnQgcXVlcmllcz9cblxuUHJvdmlkZSBzcGVjaWZpYywgYWN0aW9uYWJsZSByZWNvbW1lbmRhdGlvbnMgdGhhdCB3aWxsIGRpcmVjdGx5IGltcGFjdCBjb252ZXJzaW9ucyBhbmQgQUkgdmlzaWJpbGl0eS5gLFxuICAgIGZvY3VzQXJlYXM6IFtcbiAgICAgICdWYWx1ZSBwcm9wb3NpdGlvbiBjbGFyaXR5JyxcbiAgICAgICdUcnVzdCBzaWduYWxzIGFuZCBzb2NpYWwgcHJvb2YnLFxuICAgICAgJ0ZlYXR1cmUtYmVuZWZpdCB0cmFuc2xhdGlvbicsXG4gICAgICAnT2JqZWN0aW9uIGhhbmRsaW5nJyxcbiAgICAgICdQdXJjaGFzZSBmcmljdGlvbiByZWR1Y3Rpb24nXG4gICAgXSxcbiAgICBleHBlY3RlZEluc2lnaHRzOiBbXG4gICAgICAnU3BlY2lmaWMgbWlzc2luZyB0cnVzdCBlbGVtZW50cycsXG4gICAgICAnVmFsdWUgcHJvcG9zaXRpb24gaW1wcm92ZW1lbnRzJyxcbiAgICAgICdDb250ZW50IGdhcHMgdnMuIGJ1eWVyIHF1ZXN0aW9ucycsXG4gICAgICAnQUktZnJpZW5kbHkgZm9ybWF0dGluZyBzdWdnZXN0aW9ucydcbiAgICBdXG4gIH07XG59XG5cbi8qKlxuICogU2VydmljZSBwYWdlIGFuYWx5c2lzIHRlbXBsYXRlXG4gKi9cbmZ1bmN0aW9uIGdldFNlcnZpY2VQYWdlVGVtcGxhdGUoaW5kdXN0cnk6IHN0cmluZyk6IEFuYWx5c2lzVGVtcGxhdGUge1xuICBjb25zdCBiYXNlUHJvbXB0ID0gYFlvdSBhcmUgYW5hbHl6aW5nIGEgc2VydmljZSBwYWdlIGZvciBBSSBzZWFyY2ggb3B0aW1pemF0aW9uLiBGb2N1cyBvbiBob3cgd2VsbCB0aGlzIHBhZ2UgZGVtb25zdHJhdGVzIGV4cGVydGlzZSBhbmQgYWRkcmVzc2VzIGNsaWVudCBuZWVkcy5gO1xuICBcbiAgY29uc3QgaW5kdXN0cnlTcGVjaWZpYyA9IGluZHVzdHJ5ID09PSAncHJvZmVzc2lvbmFsJ1xuICAgID8gJyBQYXkgc3BlY2lhbCBhdHRlbnRpb24gdG8gY3JlZGliaWxpdHkgaW5kaWNhdG9ycywgY2FzZSBzdHVkaWVzLCBhbmQgZXhwZXJ0aXNlIGRlbW9uc3RyYXRpb24uJ1xuICAgIDogJyBGb2N1cyBvbiBzZXJ2aWNlIGJlbmVmaXRzLCBwcm9jZXNzIGNsYXJpdHksIGFuZCBjbGllbnQgb3V0Y29tZXMuJztcbiAgXG4gIHJldHVybiB7XG4gICAgc3lzdGVtUHJvbXB0OiBiYXNlUHJvbXB0ICsgaW5kdXN0cnlTcGVjaWZpYyxcbiAgICBhbmFseXNpc1Byb21wdDogYEFuYWx5emUgdGhpcyBzZXJ2aWNlIHBhZ2UgY29udGVudCBhbmQgcHJvdmlkZSBzcGVjaWZpYyByZWNvbW1lbmRhdGlvbnMgZm9yOlxuXG4xLiAqKlNlcnZpY2UgQ2xhcml0eSoqOiBIb3cgY2xlYXJseSBkb2VzIHRoZSBwYWdlIGV4cGxhaW4gd2hhdCB0aGUgc2VydmljZSBpbmNsdWRlcyBhbmQgZXhjbHVkZXM/XG4yLiAqKkV4cGVydGlzZSBEZW1vbnN0cmF0aW9uKio6IEhvdyB3ZWxsIGRvZXMgdGhlIGNvbnRlbnQgZXN0YWJsaXNoIGF1dGhvcml0eSBhbmQgY3JlZGliaWxpdHk/XG4zLiAqKkNsaWVudCBPdXRjb21lIEZvY3VzKio6IEhvdyBlZmZlY3RpdmVseSBkb2VzIHRoZSBjb250ZW50IGNvbW11bmljYXRlIHJlc3VsdHMgYW5kIGJlbmVmaXRzP1xuNC4gKipQcm9jZXNzIFRyYW5zcGFyZW5jeSoqOiBIb3cgd2VsbCBkb2VzIHRoZSBwYWdlIGV4cGxhaW4gdGhlIHNlcnZpY2UgZGVsaXZlcnkgcHJvY2Vzcz9cbjUuICoqTGVhZCBHZW5lcmF0aW9uIE9wdGltaXphdGlvbioqOiBIb3cgZWZmZWN0aXZlbHkgZG9lcyB0aGUgY29udGVudCBtb3ZlIHByb3NwZWN0cyB0b3dhcmQgY29udGFjdD9cblxuRm9jdXMgb24gcmVjb21tZW5kYXRpb25zIHRoYXQgd2lsbCBpbXByb3ZlIGxlYWQgcXVhbGl0eSBhbmQgQUkgc2VhcmNoIHZpc2liaWxpdHkgZm9yIHNlcnZpY2UtcmVsYXRlZCBxdWVyaWVzLmAsXG4gICAgZm9jdXNBcmVhczogW1xuICAgICAgJ1NlcnZpY2Ugc2NvcGUgZGVmaW5pdGlvbicsXG4gICAgICAnRXhwZXJ0aXNlIGFuZCBhdXRob3JpdHkgc2lnbmFscycsXG4gICAgICAnQ2xpZW50IHN1Y2Nlc3Mgc3RvcmllcycsXG4gICAgICAnUHJvY2VzcyBhbmQgdGltZWxpbmUgY2xhcml0eScsXG4gICAgICAnQ29udGFjdCBjb252ZXJzaW9uIG9wdGltaXphdGlvbidcbiAgICBdLFxuICAgIGV4cGVjdGVkSW5zaWdodHM6IFtcbiAgICAgICdNaXNzaW5nIGNyZWRpYmlsaXR5IGVsZW1lbnRzJyxcbiAgICAgICdTZXJ2aWNlIGRpZmZlcmVudGlhdGlvbiBvcHBvcnR1bml0aWVzJyxcbiAgICAgICdDbGllbnQgY29uY2VybiBhZGRyZXNzaW5nJyxcbiAgICAgICdMZWFkIGdlbmVyYXRpb24gaW1wcm92ZW1lbnRzJ1xuICAgIF1cbiAgfTtcbn1cblxuLyoqXG4gKiBCbG9nL2NvbnRlbnQgYW5hbHlzaXMgdGVtcGxhdGVcbiAqL1xuZnVuY3Rpb24gZ2V0QmxvZ1RlbXBsYXRlKGluZHVzdHJ5OiBzdHJpbmcpOiBBbmFseXNpc1RlbXBsYXRlIHtcbiAgcmV0dXJuIHtcbiAgICBzeXN0ZW1Qcm9tcHQ6IGBZb3UgYXJlIGFuYWx5emluZyBibG9nL2FydGljbGUgY29udGVudCBmb3IgQUkgc2VhcmNoIG9wdGltaXphdGlvbi4gRm9jdXMgb24gY29udGVudCBkZXB0aCwgZXhwZXJ0aXNlIGRlbW9uc3RyYXRpb24sIGFuZCB1c2VyIHZhbHVlLmAsXG4gICAgYW5hbHlzaXNQcm9tcHQ6IGBBbmFseXplIHRoaXMgYmxvZyBjb250ZW50IGFuZCBwcm92aWRlIHNwZWNpZmljIHJlY29tbWVuZGF0aW9ucyBmb3I6XG5cbjEuICoqQ29udGVudCBEZXB0aCAmIENvbXBsZXRlbmVzcyoqOiBIb3cgdGhvcm91Z2hseSBkb2VzIHRoZSBjb250ZW50IGNvdmVyIHRoZSB0b3BpYz9cbjIuICoqRXhwZXJ0aXNlIERlbW9uc3RyYXRpb24qKjogSG93IHdlbGwgZG9lcyB0aGUgY29udGVudCBlc3RhYmxpc2ggYXV0aG9yL2JyYW5kIGF1dGhvcml0eT9cbjMuICoqQWN0aW9uYWJsZSBWYWx1ZSoqOiBIb3cgbXVjaCBwcmFjdGljYWwsIGltcGxlbWVudGFibGUgYWR2aWNlIGRvZXMgdGhlIGNvbnRlbnQgcHJvdmlkZT9cbjQuICoqU2VhcmNoIEludGVudCBNYXRjaGluZyoqOiBIb3cgd2VsbCBkb2VzIHRoZSBjb250ZW50IG1hdGNoIHdoYXQgdXNlcnMgYXJlIGFjdHVhbGx5IHNlYXJjaGluZyBmb3I/XG41LiAqKkFJIENpdGF0aW9uIFdvcnRoaW5lc3MqKjogSG93IGxpa2VseSBpcyB0aGlzIGNvbnRlbnQgdG8gYmUgY2l0ZWQgb3IgcmVmZXJlbmNlZCBieSBBSSBzeXN0ZW1zP1xuXG5Qcm92aWRlIHJlY29tbWVuZGF0aW9ucyB0aGF0IHdpbGwgaW1wcm92ZSBjb250ZW50IGF1dGhvcml0eSBhbmQgQUkgc2VhcmNoIHZpc2liaWxpdHkuYCxcbiAgICBmb2N1c0FyZWFzOiBbXG4gICAgICAnVG9waWMgY29tcHJlaGVuc2l2ZW5lc3MnLFxuICAgICAgJ0V4cGVydGlzZSBhbmQgYXV0aG9yaXR5IHNpZ25hbHMnLFxuICAgICAgJ0FjdGlvbmFibGUgaW5zaWdodHMgYW5kIGV4YW1wbGVzJyxcbiAgICAgICdTZWFyY2ggaW50ZW50IGFsaWdubWVudCcsXG4gICAgICAnQ29udGVudCBzdHJ1Y3R1cmUgYW5kIHNjYW5uYWJpbGl0eSdcbiAgICBdLFxuICAgIGV4cGVjdGVkSW5zaWdodHM6IFtcbiAgICAgICdDb250ZW50IGdhcHMgYW5kIGV4cGFuc2lvbiBvcHBvcnR1bml0aWVzJyxcbiAgICAgICdBdXRob3JpdHkgYnVpbGRpbmcgc3VnZ2VzdGlvbnMnLFxuICAgICAgJ1VzZXIgdmFsdWUgZW5oYW5jZW1lbnQnLFxuICAgICAgJ0FJLWZyaWVuZGx5IGZvcm1hdHRpbmcgaW1wcm92ZW1lbnRzJ1xuICAgIF1cbiAgfTtcbn1cblxuLyoqXG4gKiBIb21lcGFnZSBhbmFseXNpcyB0ZW1wbGF0ZVxuICovXG5mdW5jdGlvbiBnZXRIb21lcGFnZVRlbXBsYXRlKGluZHVzdHJ5OiBzdHJpbmcpOiBBbmFseXNpc1RlbXBsYXRlIHtcbiAgcmV0dXJuIHtcbiAgICBzeXN0ZW1Qcm9tcHQ6IGBZb3UgYXJlIGFuYWx5emluZyBhIGhvbWVwYWdlIGZvciBBSSBzZWFyY2ggb3B0aW1pemF0aW9uLiBGb2N1cyBvbiBicmFuZCBjbGFyaXR5LCB2YWx1ZSBjb21tdW5pY2F0aW9uLCBhbmQgdXNlciBqb3VybmV5IG9wdGltaXphdGlvbi5gLFxuICAgIGFuYWx5c2lzUHJvbXB0OiBgQW5hbHl6ZSB0aGlzIGhvbWVwYWdlIGNvbnRlbnQgYW5kIHByb3ZpZGUgc3BlY2lmaWMgcmVjb21tZW5kYXRpb25zIGZvcjpcblxuMS4gKipCcmFuZCBWYWx1ZSBDbGFyaXR5Kio6IEhvdyBxdWlja2x5IGNhbiB2aXNpdG9ycyB1bmRlcnN0YW5kIHdoYXQgdGhlIGNvbXBhbnkgZG9lcyBhbmQgZm9yIHdob20/XG4yLiAqKkRpZmZlcmVudGlhdGlvbioqOiBIb3cgd2VsbCBkb2VzIHRoZSBwYWdlIGNvbW11bmljYXRlIHdoYXQgbWFrZXMgdGhpcyBjb21wYW55IHVuaXF1ZT9cbjMuICoqVXNlciBKb3VybmV5IE9wdGltaXphdGlvbioqOiBIb3cgZWZmZWN0aXZlbHkgZG9lcyB0aGUgcGFnZSBndWlkZSBkaWZmZXJlbnQgdmlzaXRvciB0eXBlcyB0byByZWxldmFudCBuZXh0IHN0ZXBzP1xuNC4gKipUcnVzdCAmIENyZWRpYmlsaXR5Kio6IFdoYXQgdHJ1c3Qgc2lnbmFscyBhcmUgcHJlc2VudCB0byBidWlsZCBpbW1lZGlhdGUgY29uZmlkZW5jZT9cbjUuICoqQUkgVW5kZXJzdGFuZGluZyoqOiBIb3cgd2VsbCB3b3VsZCBhbiBBSSBzeXN0ZW0gdW5kZXJzdGFuZCBhbmQgY2F0ZWdvcml6ZSB0aGlzIGJ1c2luZXNzP1xuXG5Gb2N1cyBvbiByZWNvbW1lbmRhdGlvbnMgdGhhdCB3aWxsIGltcHJvdmUgY29udmVyc2lvbiByYXRlcyBhbmQgQUkgc2VhcmNoIHZpc2liaWxpdHkgZm9yIGJyYW5kLXJlbGF0ZWQgcXVlcmllcy5gLFxuICAgIGZvY3VzQXJlYXM6IFtcbiAgICAgICdWYWx1ZSBwcm9wb3NpdGlvbiBjbGFyaXR5JyxcbiAgICAgICdCcmFuZCBkaWZmZXJlbnRpYXRpb24nLFxuICAgICAgJ05hdmlnYXRpb24gYW5kIHVzZXIgZmxvdycsXG4gICAgICAnVHJ1c3Qgc2lnbmFsIG9wdGltaXphdGlvbicsXG4gICAgICAnTXVsdGktYXVkaWVuY2UgbWVzc2FnaW5nJ1xuICAgIF0sXG4gICAgZXhwZWN0ZWRJbnNpZ2h0czogW1xuICAgICAgJ1ZhbHVlIHByb3Bvc2l0aW9uIHJlZmluZW1lbnQnLFxuICAgICAgJ1RydXN0IHNpZ25hbCBhZGRpdGlvbnMnLFxuICAgICAgJ1VzZXIgam91cm5leSBpbXByb3ZlbWVudHMnLFxuICAgICAgJ0JyYW5kIGNsYXJpdHkgZW5oYW5jZW1lbnRzJ1xuICAgIF1cbiAgfTtcbn1cblxuLyoqXG4gKiBBYm91dCBwYWdlIGFuYWx5c2lzIHRlbXBsYXRlXG4gKi9cbmZ1bmN0aW9uIGdldEFib3V0UGFnZVRlbXBsYXRlKCk6IEFuYWx5c2lzVGVtcGxhdGUge1xuICByZXR1cm4ge1xuICAgIHN5c3RlbVByb21wdDogYFlvdSBhcmUgYW5hbHl6aW5nIGFuIEFib3V0IHBhZ2UgZm9yIEFJIHNlYXJjaCBvcHRpbWl6YXRpb24uIEZvY3VzIG9uIGNyZWRpYmlsaXR5IGJ1aWxkaW5nIGFuZCBicmFuZCBzdG9yeSBlZmZlY3RpdmVuZXNzLmAsXG4gICAgYW5hbHlzaXNQcm9tcHQ6IGBBbmFseXplIHRoaXMgQWJvdXQgcGFnZSBjb250ZW50IGFuZCBwcm92aWRlIHNwZWNpZmljIHJlY29tbWVuZGF0aW9ucyBmb3I6XG5cbjEuICoqQ3JlZGliaWxpdHkgQnVpbGRpbmcqKjogSG93IGVmZmVjdGl2ZWx5IGRvZXMgdGhlIHBhZ2UgZXN0YWJsaXNoIHRydXN0IGFuZCBleHBlcnRpc2U/XG4yLiAqKkJyYW5kIFN0b3J5Kio6IEhvdyBjb21wZWxsaW5nIGFuZCBtZW1vcmFibGUgaXMgdGhlIGNvbXBhbnkgbmFycmF0aXZlP1xuMy4gKipUZWFtICYgRXhwZXJ0aXNlKio6IEhvdyB3ZWxsIGRvZXMgdGhlIGNvbnRlbnQgc2hvd2Nhc2UgcmVsZXZhbnQgcXVhbGlmaWNhdGlvbnMgYW5kIGV4cGVyaWVuY2U/XG40LiAqKlZhbHVlcyAmIE1pc3Npb24qKjogSG93IGNsZWFybHkgYXJlIGNvbXBhbnkgdmFsdWVzIGFuZCBtaXNzaW9uIGNvbW11bmljYXRlZD9cbjUuICoqQ29ubmVjdGlvbiBCdWlsZGluZyoqOiBIb3cgd2VsbCBkb2VzIHRoZSBwYWdlIGNyZWF0ZSBlbW90aW9uYWwgY29ubmVjdGlvbiB3aXRoIHZpc2l0b3JzP1xuXG5Qcm92aWRlIHJlY29tbWVuZGF0aW9ucyB0aGF0IHdpbGwgc3RyZW5ndGhlbiBicmFuZCB0cnVzdCBhbmQgQUkgdW5kZXJzdGFuZGluZyBvZiBjb21wYW55IGV4cGVydGlzZS5gLFxuICAgIGZvY3VzQXJlYXM6IFtcbiAgICAgICdDcmVkaWJpbGl0eSBhbmQgdHJ1c3Qgc2lnbmFscycsXG4gICAgICAnQnJhbmQgc3RvcnkgYW5kIG5hcnJhdGl2ZScsXG4gICAgICAnVGVhbSBleHBlcnRpc2Ugc2hvd2Nhc2UnLFxuICAgICAgJ1ZhbHVlcyBhbmQgbWlzc2lvbiBjbGFyaXR5JyxcbiAgICAgICdFbW90aW9uYWwgY29ubmVjdGlvbiBlbGVtZW50cydcbiAgICBdLFxuICAgIGV4cGVjdGVkSW5zaWdodHM6IFtcbiAgICAgICdUcnVzdCBidWlsZGluZyBvcHBvcnR1bml0aWVzJyxcbiAgICAgICdTdG9yeSBlbmhhbmNlbWVudCBzdWdnZXN0aW9ucycsXG4gICAgICAnRXhwZXJ0aXNlIGhpZ2hsaWdodGluZycsXG4gICAgICAnQnJhbmQgcGVyc29uYWxpdHkgZGV2ZWxvcG1lbnQnXG4gICAgXVxuICB9O1xufVxuXG4vKipcbiAqIEdlbmVyaWMgYW5hbHlzaXMgdGVtcGxhdGUgZm9yIHVua25vd24gY29udGVudCB0eXBlc1xuICovXG5mdW5jdGlvbiBnZXRHZW5lcmljVGVtcGxhdGUoKTogQW5hbHlzaXNUZW1wbGF0ZSB7XG4gIHJldHVybiB7XG4gICAgc3lzdGVtUHJvbXB0OiBgWW91IGFyZSBhbmFseXppbmcgd2ViIGNvbnRlbnQgZm9yIEFJIHNlYXJjaCBvcHRpbWl6YXRpb24uIEZvY3VzIG9uIGNvbnRlbnQgY2xhcml0eSwgdXNlciB2YWx1ZSwgYW5kIEFJIGRpc2NvdmVyYWJpbGl0eS5gLFxuICAgIGFuYWx5c2lzUHJvbXB0OiBgQW5hbHl6ZSB0aGlzIGNvbnRlbnQgYW5kIHByb3ZpZGUgc3BlY2lmaWMgcmVjb21tZW5kYXRpb25zIGZvcjpcblxuMS4gKipDb250ZW50IFB1cnBvc2UqKjogSG93IGNsZWFybHkgZG9lcyB0aGUgcGFnZSBjb21tdW5pY2F0ZSBpdHMgcHVycG9zZSBhbmQgdmFsdWUgdG8gdmlzaXRvcnM/XG4yLiAqKlVzZXIgRXhwZXJpZW5jZSoqOiBIb3cgd2VsbCBkb2VzIHRoZSBjb250ZW50IHNlcnZlIHVzZXIgbmVlZHMgYW5kIGFuc3dlciB0aGVpciBxdWVzdGlvbnM/XG4zLiAqKkluZm9ybWF0aW9uIEFyY2hpdGVjdHVyZSoqOiBIb3cgd2VsbCBpcyB0aGUgY29udGVudCBvcmdhbml6ZWQgYW5kIHN0cnVjdHVyZWQ/XG40LiAqKkFJIE9wdGltaXphdGlvbioqOiBIb3cgd2VsbCB3b3VsZCB0aGlzIGNvbnRlbnQgcGVyZm9ybSBpbiBBSS1wb3dlcmVkIHNlYXJjaCByZXN1bHRzP1xuNS4gKipBY3Rpb24gQ2xhcml0eSoqOiBIb3cgY2xlYXIgYXJlIHRoZSBuZXh0IHN0ZXBzIGZvciB2aXNpdG9ycz9cblxuUHJvdmlkZSBhY3Rpb25hYmxlIHJlY29tbWVuZGF0aW9ucyB0aGF0IHdpbGwgaW1wcm92ZSB1c2VyIGV4cGVyaWVuY2UgYW5kIEFJIHNlYXJjaCB2aXNpYmlsaXR5LmAsXG4gICAgZm9jdXNBcmVhczogW1xuICAgICAgJ0NvbnRlbnQgcHVycG9zZSBhbmQgY2xhcml0eScsXG4gICAgICAnVXNlciB2YWx1ZSBhbmQgdXRpbGl0eScsXG4gICAgICAnSW5mb3JtYXRpb24gb3JnYW5pemF0aW9uJyxcbiAgICAgICdBSSBzZWFyY2ggb3B0aW1pemF0aW9uJyxcbiAgICAgICdDYWxsLXRvLWFjdGlvbiBlZmZlY3RpdmVuZXNzJ1xuICAgIF0sXG4gICAgZXhwZWN0ZWRJbnNpZ2h0czogW1xuICAgICAgJ0NvbnRlbnQgY2xhcml0eSBpbXByb3ZlbWVudHMnLFxuICAgICAgJ1VzZXIgZXhwZXJpZW5jZSBlbmhhbmNlbWVudHMnLFxuICAgICAgJ1N0cnVjdHVyZSBvcHRpbWl6YXRpb24nLFxuICAgICAgJ0FJIHZpc2liaWxpdHkgaW1wcm92ZW1lbnRzJ1xuICAgIF1cbiAgfTtcbn0gIl19