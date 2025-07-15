/**
 * GPT-4 Prompt Template for Trending Questions About a Brand
 * 
 * This prompt generates likely questions users might ask AI tools about a specific brand
 * or products in a particular industry. The output is a JSON array of questions.
 */

class TrendingQuestionsPrompt {
  /**
   * Generate a GPT-4 prompt for trending questions about a brand
   * @param {string} brandName - The brand name to analyze
   * @param {string} industry - The industry category
   * @param {Object} options - Additional options for customization
   * @returns {string} The formatted GPT-4 prompt
   */
  static generate(brandName, industry, options = {}) {
    const {
      questionCount = 5,
      includeComparison = true,
      includeReliability = true,
      includeFeatures = true,
      includePricing = true,
      includeAlternatives = true
    } = options;

    const prompt = `You are an expert market researcher analyzing consumer behavior and brand perception. Your task is to identify the most likely questions users would ask AI tools like ChatGPT, Claude, or Perplexity about a specific brand.

BRAND: ${brandName}
INDUSTRY: ${industry}

Generate ${questionCount} likely questions that users might ask AI tools about ${brandName} or products in the ${industry} industry. Consider:

${includeReliability ? '• Reliability and trustworthiness concerns' : ''}
${includeComparison ? '• Comparisons with competitors' : ''}
${includeFeatures ? '• Product features and capabilities' : ''}
${includePricing ? '• Pricing and value propositions' : ''}
${includeAlternatives ? '• Alternative options and recommendations' : ''}
• User experience and reviews
• Industry-specific concerns
• Common pain points in the ${industry} space
• Purchase decision factors

Focus on questions that:
1. Real users would actually ask
2. Are specific enough to be actionable
3. Reflect common concerns in the ${industry} industry
4. Include both positive and negative inquiry angles
5. Cover different stages of the customer journey (awareness, consideration, decision)

OUTPUT FORMAT: Return ONLY a JSON array of strings. No explanations, no additional text.

Example format:
[
  "Is ${brandName} reliable for [specific use case]?",
  "How does ${brandName} compare to [competitor] in terms of [specific aspect]?",
  "What are the main advantages of choosing ${brandName} over alternatives?",
  "Are there any common issues or complaints about ${brandName}?",
  "What's the best ${brandName} product for [specific need]?"
]

Generate the questions now:`;

    return prompt;
  }

  /**
   * Generate a simplified prompt for basic question generation
   * @param {string} brandName - The brand name
   * @param {string} industry - The industry
   * @returns {string} Simplified prompt
   */
  static generateSimple(brandName, industry) {
    return `What are 5 likely questions users might ask AI tools like ChatGPT about the brand ${brandName} or products in the ${industry} industry?

Return ONLY a JSON array of questions, nothing else.

Example format:
[
  "Is ${brandName} reliable for ${industry.toLowerCase()} needs?",
  "How does ${brandName} compare to competitors?",
  "What are the pros and cons of ${brandName}?",
  "Should I choose ${brandName} or look for alternatives?",
  "What do users say about ${brandName}'s quality?"
]`;
  }

  /**
   * Generate industry-specific question variations
   * @param {string} brandName - The brand name
   * @param {string} industry - The industry
   * @returns {Object} Industry-specific prompts
   */
  static generateIndustrySpecific(brandName, industry) {
    const industryPrompts = {
      'Technology': `Generate 5 questions about ${brandName} focusing on:
- Software reliability and security
- Integration capabilities
- Performance and scalability
- Support and documentation
- Pricing vs competitors

Return only JSON array.`,

      'Healthcare': `Generate 5 questions about ${brandName} focusing on:
- Safety and FDA approval
- Clinical effectiveness
- Insurance coverage
- Side effects or risks
- Doctor recommendations

Return only JSON array.`,

      'Finance': `Generate 5 questions about ${brandName} focusing on:
- Security and trust
- Fees and hidden costs
- Regulatory compliance
- Customer service quality
- Interest rates or returns

Return only JSON array.`,

      'Retail': `Generate 5 questions about ${brandName} focusing on:
- Product quality and durability
- Return and warranty policies
- Shipping and delivery
- Customer service experience
- Value for money

Return only JSON array.`,

      'Automotive': `Generate 5 questions about ${brandName} focusing on:
- Reliability and maintenance costs
- Safety ratings and features
- Fuel efficiency or range
- Resale value
- Warranty and service network

Return only JSON array.`,

      'Education': `Generate 5 questions about ${brandName} focusing on:
- Accreditation and recognition
- Job placement rates
- Course quality and curriculum
- Cost vs value
- Student support services

Return only JSON array.`,

      'Entertainment': `Generate 5 questions about ${brandName} focusing on:
- Content quality and variety
- Subscription value
- Device compatibility
- User experience
- Comparison with competitors

Return only JSON array.`,

      'Food & Beverage': `Generate 5 questions about ${brandName} focusing on:
- Taste and quality
- Nutritional value and ingredients
- Price comparison
- Availability and distribution
- Health benefits or concerns

Return only JSON array.`,

      'Real Estate': `Generate 5 questions about ${brandName} focusing on:
- Market reputation and reliability
- Commission rates and fees
- Local market knowledge
- Customer service quality
- Success rates and testimonials

Return only JSON array.`,

      'Travel': `Generate 5 questions about ${brandName} focusing on:
- Booking reliability and customer service
- Pricing transparency
- Cancellation policies
- Quality of accommodations/services
- Safety and security measures

Return only JSON array.`
    };

    return industryPrompts[industry] || this.generateSimple(brandName, industry);
  }

  /**
   * Generate questions with specific focus areas
   * @param {string} brandName - The brand name
   * @param {string} industry - The industry
   * @param {Array} focusAreas - Specific areas to focus on
   * @returns {string} Focused prompt
   */
  static generateFocused(brandName, industry, focusAreas = []) {
    const focusText = focusAreas.length > 0 
      ? `Focus specifically on: ${focusAreas.join(', ')}`
      : '';

    return `Generate 5 questions users might ask AI about ${brandName} in the ${industry} industry.

${focusText}

Questions should be:
- Realistic and commonly asked
- Specific to ${brandName} and ${industry}
- Covering different aspects (quality, price, alternatives, etc.)
- Actionable for brand analysis

Return ONLY a JSON array of questions.

Format:
[
  "Question 1 about ${brandName}?",
  "Question 2 about ${brandName}?",
  "Question 3 about ${brandName}?",
  "Question 4 about ${brandName}?",
  "Question 5 about ${brandName}?"
]`;
  }

  /**
   * Generate questions for competitive analysis
   * @param {string} brandName - The brand name
   * @param {string} industry - The industry
   * @param {Array} competitors - List of competitors
   * @returns {string} Competitive analysis prompt
   */
  static generateCompetitive(brandName, industry, competitors = []) {
    const competitorText = competitors.length > 0 
      ? `Consider these competitors: ${competitors.join(', ')}`
      : '';

    return `Generate 5 questions users might ask AI when comparing ${brandName} to competitors in the ${industry} industry.

${competitorText}

Focus on comparative questions that help users make decisions between brands.

Return ONLY a JSON array of questions.

Example format:
[
  "How does ${brandName} compare to [competitor] in [specific aspect]?",
  "Should I choose ${brandName} or [competitor] for [use case]?",
  "What are the main differences between ${brandName} and [competitor]?",
  "Which is better value: ${brandName} or [competitor]?",
  "What do users prefer: ${brandName} or [competitor]?"
]`;
  }
}

// Usage examples:
const examples = {
  // Basic usage
  basic: TrendingQuestionsPrompt.generate('Apple', 'Technology'),
  
  // Simple version
  simple: TrendingQuestionsPrompt.generateSimple('Tesla', 'Automotive'),
  
  // Industry-specific
  industrySpecific: TrendingQuestionsPrompt.generateIndustrySpecific('Netflix', 'Entertainment'),
  
  // Focused on specific areas
  focused: TrendingQuestionsPrompt.generateFocused('Amazon', 'Retail', ['pricing', 'delivery', 'customer service']),
  
  // Competitive analysis
  competitive: TrendingQuestionsPrompt.generateCompetitive('Spotify', 'Entertainment', ['Apple Music', 'YouTube Music', 'Pandora'])
};

/**
 * Sample API Integration
 */
async function getTrendingQuestions(brandName, industry, options = {}) {
  const prompt = TrendingQuestionsPrompt.generate(brandName, industry, options);
  
  // Example OpenAI API call
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a market research expert. Always respond with valid JSON arrays only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  const data = await response.json();
  
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Failed to parse GPT-4 response as JSON:', error);
    return [];
  }
}

// Export for use in other modules
module.exports = {
  TrendingQuestionsPrompt,
  getTrendingQuestions,
  examples
};

// For browser usage
if (typeof window !== 'undefined') {
  window.TrendingQuestionsPrompt = TrendingQuestionsPrompt;
}

// Example usage
// const questions = await getTrendingQuestions('Apple', 'Technology');
// console.log(questions); 