import { NextRequest, NextResponse } from 'next/server'

// Business context interface
interface BusinessContext {
  companyName: string;
  industry: string;
  companySize: string;
  primaryLocation: string;
  country: string;
  targetMarkets: string[];
  businessModel: string;
  targetAudience: string;
  priceRange: string;
  mainCompetitors: string[];
  primaryGoals: string[];
  currentChallenges: string[];
  brandPersonality: string;
  additionalInfo: string;
}

// Function to detect user's location from request headers
function getUserLocation(request: NextRequest): { country: string; city?: string; region?: string } {
  // Try to get location from Vercel headers (works in production)
  const country = request.headers.get('x-vercel-ip-country') || 
                  request.headers.get('cf-ipcountry') || // Cloudflare
                  request.headers.get('x-country-code'); // Generic

  const city = request.headers.get('x-vercel-ip-city') || 
               request.headers.get('cf-ipcity');

  const region = request.headers.get('x-vercel-ip-country-region') || 
                 request.headers.get('cf-region');

  // Default to US if no location detected (for development)
  return {
    country: country || 'US',
    city: city || undefined,
    region: region || undefined
  };
}

// Function to get country/region name from code
function getLocationName(countryCode: string): { countryName: string; isEnglishSpeaking: boolean } {
  const locationMap: Record<string, { name: string; englishSpeaking: boolean }> = {
    'US': { name: 'United States', englishSpeaking: true },
    'CA': { name: 'Canada', englishSpeaking: true },
    'GB': { name: 'United Kingdom', englishSpeaking: true },
    'AU': { name: 'Australia', englishSpeaking: true },
    'NZ': { name: 'New Zealand', englishSpeaking: true },
    'ZA': { name: 'South Africa', englishSpeaking: true },
    'IN': { name: 'India', englishSpeaking: true },
    'SG': { name: 'Singapore', englishSpeaking: true },
    'IE': { name: 'Ireland', englishSpeaking: true },
    'DE': { name: 'Germany', englishSpeaking: false },
    'FR': { name: 'France', englishSpeaking: false },
    'ES': { name: 'Spain', englishSpeaking: false },
    'IT': { name: 'Italy', englishSpeaking: false },
    'BR': { name: 'Brazil', englishSpeaking: false },
    'MX': { name: 'Mexico', englishSpeaking: false },
    'JP': { name: 'Japan', englishSpeaking: false },
    'KR': { name: 'South Korea', englishSpeaking: false },
    'CN': { name: 'China', englishSpeaking: false },
    'RU': { name: 'Russia', englishSpeaking: false },
    'NL': { name: 'Netherlands', englishSpeaking: false },
    'SE': { name: 'Sweden', englishSpeaking: false },
    'NO': { name: 'Norway', englishSpeaking: false },
    'DK': { name: 'Denmark', englishSpeaking: false },
    'FI': { name: 'Finland', englishSpeaking: false },
    'PL': { name: 'Poland', englishSpeaking: false },
    'TR': { name: 'Turkey', englishSpeaking: false },
    'AE': { name: 'UAE', englishSpeaking: true },
    'SA': { name: 'Saudi Arabia', englishSpeaking: false },
    'EG': { name: 'Egypt', englishSpeaking: false },
    'NG': { name: 'Nigeria', englishSpeaking: true },
    'KE': { name: 'Kenya', englishSpeaking: true },
    'GH': { name: 'Ghana', englishSpeaking: true },
    'TH': { name: 'Thailand', englishSpeaking: false },
    'VN': { name: 'Vietnam', englishSpeaking: false },
    'PH': { name: 'Philippines', englishSpeaking: true },
    'MY': { name: 'Malaysia', englishSpeaking: true },
    'ID': { name: 'Indonesia', englishSpeaking: false },
    'AR': { name: 'Argentina', englishSpeaking: false },
    'CL': { name: 'Chile', englishSpeaking: false },
    'CO': { name: 'Colombia', englishSpeaking: false },
    'PE': { name: 'Peru', englishSpeaking: false }
  };

  const location = locationMap[countryCode] || { name: 'United States', englishSpeaking: true };
  return {
    countryName: location.name,
    isEnglishSpeaking: location.englishSpeaking
  };
}

// Enhanced function to generate AI ranking data with business context
function generateAIRankingData(
  brandName: string, 
  industry: string, 
  domain: string, 
  location: { country: string; city?: string; region?: string },
  businessContext?: BusinessContext
) {
  const { countryName, isEnglishSpeaking } = getLocationName(location.country);
  
  // Use business context location if available, otherwise use detected location
  const finalLocation = businessContext ? {
    country: getCountryCode(businessContext.country) || location.country,
    countryName: businessContext.country,
    city: businessContext.primaryLocation.split(',')[0].trim(),
    region: location.region,
    isEnglishSpeaking
  } : {
    country: location.country,
    countryName,
    city: location.city,
    region: location.region,
    isEnglishSpeaking
  };
  
  // Generate business-context-aware AI questions
  const aiQuestions = generateBusinessContextAwareQuestions(
    businessContext?.companyName || brandName, 
    businessContext?.industry || industry, 
    finalLocation.countryName, 
    finalLocation.city,
    businessContext
  );
  
  // Generate competitor insights with business context
  const competitors = getBusinessContextCompetitors(
    businessContext?.industry || industry, 
    businessContext?.companyName || brandName, 
    finalLocation.country,
    businessContext
  );
  
  // Generate ranking simulation data
  const rankingData = generateRankingSimulation(
    businessContext?.companyName || brandName, 
    competitors, 
    aiQuestions, 
    finalLocation.countryName,
    businessContext
  );
  
  return {
    brandName: businessContext?.companyName || brandName,
    industry: businessContext?.industry || industry,
    domain,
    location: finalLocation,
    businessContext: businessContext ? {
      hasContext: true,
      targetAudience: businessContext.targetAudience,
      businessModel: businessContext.businessModel,
      priceRange: businessContext.priceRange,
      primaryGoals: businessContext.primaryGoals,
      currentChallenges: businessContext.currentChallenges,
      brandPersonality: businessContext.brandPersonality
    } : { hasContext: false },
    aiQuestions,
    competitors,
    ranking: rankingData,
    timestamp: new Date().toISOString()
  };
}

// Helper function to get country code from country name
function getCountryCode(countryName: string): string | null {
  const countryCodeMap: Record<string, string> = {
    'United States': 'US',
    'Canada': 'CA',
    'United Kingdom': 'GB',
    'Australia': 'AU',
    'Germany': 'DE',
    'France': 'FR',
    'South Africa': 'ZA',
    'India': 'IN',
    'Japan': 'JP',
    'China': 'CN',
    'Brazil': 'BR',
    'Mexico': 'MX',
    'Netherlands': 'NL',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Spain': 'ES',
    'Italy': 'IT',
    'Russia': 'RU',
    'UAE': 'AE',
    'Singapore': 'SG',
    'Malaysia': 'MY',
    'Thailand': 'TH',
    'Philippines': 'PH',
    'Indonesia': 'ID',
    'Vietnam': 'VN'
  };
  
  return countryCodeMap[countryName] || null;
}

// Enhanced function to generate business-context-aware AI questions
function generateBusinessContextAwareQuestions(
  brandName: string, 
  industry: string, 
  countryName: string, 
  city?: string,
  businessContext?: BusinessContext
): Array<{
  question: string;
  category: string;
  searchVolume: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  isLocationSpecific: boolean;
  isBusinessContextual: boolean;
}> {
  const locationSuffix = city ? `in ${city}, ${countryName}` : `in ${countryName}`;
  const industryLower = industry.toLowerCase();
  
  const questions = [];
  
  // Basic location-aware questions
  questions.push(
    {
      question: `Is ${brandName} reliable for ${industryLower} needs ${locationSuffix}?`,
      category: 'reliability',
      searchVolume: 'high' as const,
      difficulty: 'medium' as const,
      isLocationSpecific: true,
      isBusinessContextual: false
    },
    {
      question: `How does ${brandName} compare to competitors ${locationSuffix}?`,
      category: 'comparison',
      searchVolume: 'high' as const,
      difficulty: 'hard' as const,
      isLocationSpecific: true,
      isBusinessContextual: false
    }
  );

  // Business context enhanced questions
  if (businessContext) {
    // Target audience specific questions
    if (businessContext.targetAudience) {
      questions.push({
        question: `Is ${brandName} suitable for ${businessContext.targetAudience.toLowerCase()} ${locationSuffix}?`,
        category: 'target-audience',
        searchVolume: 'high' as const,
        difficulty: 'medium' as const,
        isLocationSpecific: true,
        isBusinessContextual: true
      });
    }

    // Business model specific questions
    if (businessContext.businessModel) {
      const modelLower = businessContext.businessModel.toLowerCase();
      questions.push({
        question: `How does ${brandName} work for ${modelLower} companies ${locationSuffix}?`,
        category: 'business-model',
        searchVolume: 'medium' as const,
        difficulty: 'medium' as const,
        isLocationSpecific: true,
        isBusinessContextual: true
      });
    }

    // Price range specific questions
    if (businessContext.priceRange) {
      questions.push({
        question: `Is ${brandName} worth it for ${businessContext.priceRange.toLowerCase()} budget ${locationSuffix}?`,
        category: 'pricing',
        searchVolume: 'high' as const,
        difficulty: 'easy' as const,
        isLocationSpecific: true,
        isBusinessContextual: true
      });
    }

    // Goals-specific questions
    businessContext.primaryGoals.forEach(goal => {
      if (goal.includes('brand awareness')) {
        questions.push({
          question: `Can ${brandName} help increase brand awareness ${locationSuffix}?`,
          category: 'brand-awareness',
          searchVolume: 'medium' as const,
          difficulty: 'medium' as const,
          isLocationSpecific: true,
          isBusinessContextual: true
        });
      }
      if (goal.includes('leads')) {
        questions.push({
          question: `Does ${brandName} generate quality leads for businesses ${locationSuffix}?`,
          category: 'lead-generation',
          searchVolume: 'high' as const,
          difficulty: 'medium' as const,
          isLocationSpecific: true,
          isBusinessContextual: true
        });
      }
      if (goal.includes('search rankings')) {
        questions.push({
          question: `Can ${brandName} improve search rankings ${locationSuffix}?`,
          category: 'seo',
          searchVolume: 'medium' as const,
          difficulty: 'hard' as const,
          isLocationSpecific: true,
          isBusinessContextual: true
        });
      }
    });

    // Challenge-specific questions
    businessContext.currentChallenges.forEach(challenge => {
      if (challenge.includes('competition')) {
        questions.push({
          question: `How does ${brandName} help compete with larger companies ${locationSuffix}?`,
          category: 'competitive-advantage',
          searchVolume: 'medium' as const,
          difficulty: 'hard' as const,
          isLocationSpecific: true,
          isBusinessContextual: true
        });
      }
      if (challenge.includes('budget')) {
        questions.push({
          question: `Is ${brandName} cost-effective for small budgets ${locationSuffix}?`,
          category: 'cost-effectiveness',
          searchVolume: 'high' as const,
          difficulty: 'easy' as const,
          isLocationSpecific: true,
          isBusinessContextual: true
        });
      }
      if (challenge.includes('trust')) {
        questions.push({
          question: `How trustworthy is ${brandName} for new customers ${locationSuffix}?`,
          category: 'trust-building',
          searchVolume: 'medium' as const,
          difficulty: 'medium' as const,
          isLocationSpecific: true,
          isBusinessContextual: true
        });
      }
    });

    // Brand personality questions
    if (businessContext.brandPersonality) {
      const personality = businessContext.brandPersonality.toLowerCase();
      questions.push({
        question: `Does ${brandName} maintain a ${personality} approach ${locationSuffix}?`,
        category: 'brand-personality',
        searchVolume: 'low' as const,
        difficulty: 'easy' as const,
        isLocationSpecific: true,
        isBusinessContextual: true
      });
    }
  }

  // Add some universal questions
  questions.push(
    {
      question: `What are ${brandName}'s main features and benefits?`,
      category: 'features',
      searchVolume: 'medium' as const,
      difficulty: 'easy' as const,
      isLocationSpecific: false,
      isBusinessContextual: false
    },
    {
      question: `How secure is ${brandName} for business use?`,
      category: 'security',
      searchVolume: 'low' as const,
      difficulty: 'hard' as const,
      isLocationSpecific: false,
      isBusinessContextual: false
    },
    {
      question: `What do customers say about ${brandName}'s customer support?`,
      category: 'support',
      searchVolume: 'medium' as const,
      difficulty: 'easy' as const,
      isLocationSpecific: false,
      isBusinessContextual: false
    }
  );

  return questions.slice(0, 12); // Limit to 12 questions for better UX
}

// Enhanced function to get competitors with business context
function getBusinessContextCompetitors(
  industry: string, 
  brandName: string, 
  countryCode: string,
  businessContext?: BusinessContext
): Array<{
  name: string;
  marketShare: number;
  strength: number;
  isLocal: boolean;
  isFromBusinessContext: boolean;
}> {
  // Start with competitors from business context if available
  let competitors: Array<{
    name: string;
    marketShare: number;
    strength: number;
    isLocal: boolean;
    isFromBusinessContext: boolean;
  }> = [];

  if (businessContext?.mainCompetitors && businessContext.mainCompetitors.length > 0) {
    competitors = businessContext.mainCompetitors.map(comp => ({
      name: comp,
      marketShare: Math.floor(Math.random() * 20) + 5, // 5-25%
      strength: Math.floor(Math.random() * 20) + 75, // 75-95
      isLocal: Math.random() > 0.5, // Random local/global
      isFromBusinessContext: true
    }));
  }

  // Add industry-standard competitors to fill gaps
  const industryCompetitors = getIndustryCompetitors(industry, brandName, countryCode);
  
  // Add industry competitors that aren't already in business context
  industryCompetitors.forEach(comp => {
    if (!competitors.some(existing => existing.name.toLowerCase() === comp.name.toLowerCase())) {
      competitors.push({
        ...comp,
        isFromBusinessContext: false
      });
    }
  });

  return competitors.slice(0, 6); // Limit to 6 competitors
}

function getIndustryCompetitors(
  industry: string, 
  brandName: string, 
  countryCode: string
): Array<{
  name: string;
  marketShare: number;
  strength: number;
  isLocal: boolean;
}> {
  // Base global competitors
  const globalCompetitorMap: Record<string, Array<{name: string; marketShare: number; strength: number}>> = {
    'Technology': [
      { name: 'Apple', marketShare: 25, strength: 95 },
      { name: 'Google', marketShare: 20, strength: 92 },
      { name: 'Microsoft', marketShare: 18, strength: 90 },
      { name: 'Amazon', marketShare: 15, strength: 88 },
      { name: 'Meta', marketShare: 12, strength: 85 }
    ],
    'E-commerce': [
      { name: 'Amazon', marketShare: 38, strength: 95 },
      { name: 'Shopify', marketShare: 12, strength: 85 },
      { name: 'Walmart', marketShare: 10, strength: 82 },
      { name: 'eBay', marketShare: 8, strength: 78 },
      { name: 'Etsy', marketShare: 5, strength: 75 }
    ],
    'Finance': [
      { name: 'JPMorgan Chase', marketShare: 15, strength: 92 },
      { name: 'Bank of America', marketShare: 12, strength: 88 },
      { name: 'Wells Fargo', marketShare: 10, strength: 85 },
      { name: 'PayPal', marketShare: 8, strength: 90 },
      { name: 'Stripe', marketShare: 6, strength: 87 }
    ],
    'Healthcare': [
      { name: 'Johnson & Johnson', marketShare: 18, strength: 94 },
      { name: 'Pfizer', marketShare: 15, strength: 92 },
      { name: 'UnitedHealth', marketShare: 12, strength: 89 },
      { name: 'Moderna', marketShare: 8, strength: 85 },
      { name: 'CVS Health', marketShare: 10, strength: 87 }
    ],
    'Automotive': [
      { name: 'Tesla', marketShare: 20, strength: 95 },
      { name: 'Toyota', marketShare: 18, strength: 92 },
      { name: 'Ford', marketShare: 15, strength: 88 },
      { name: 'GM', marketShare: 12, strength: 85 },
      { name: 'BMW', marketShare: 8, strength: 90 }
    ]
  };

  // Local competitors by country/region
  const localCompetitorMap: Record<string, Record<string, Array<{name: string; marketShare: number; strength: number}>>> = {
    'ZA': { // South Africa
      'E-commerce': [
        { name: 'Takealot', marketShare: 35, strength: 88 },
        { name: 'Loot', marketShare: 15, strength: 75 },
        { name: 'Makro', marketShare: 12, strength: 82 }
      ],
      'Finance': [
        { name: 'Standard Bank', marketShare: 25, strength: 90 },
        { name: 'FNB', marketShare: 22, strength: 88 },
        { name: 'Absa', marketShare: 20, strength: 85 }
      ],
      'Technology': [
        { name: 'MTN', marketShare: 30, strength: 85 },
        { name: 'Vodacom', marketShare: 35, strength: 88 },
        { name: 'Telkom', marketShare: 15, strength: 75 }
      ]
    },
    'IN': { // India
      'E-commerce': [
        { name: 'Flipkart', marketShare: 32, strength: 90 },
        { name: 'Snapdeal', marketShare: 10, strength: 78 },
        { name: 'Myntra', marketShare: 8, strength: 82 }
      ],
      'Technology': [
        { name: 'Tata Consultancy Services', marketShare: 25, strength: 88 },
        { name: 'Infosys', marketShare: 20, strength: 85 },
        { name: 'Wipro', marketShare: 15, strength: 82 }
      ]
    },
    'AU': { // Australia
      'E-commerce': [
        { name: 'JB Hi-Fi', marketShare: 20, strength: 85 },
        { name: 'Harvey Norman', marketShare: 18, strength: 82 },
        { name: 'Kogan', marketShare: 12, strength: 78 }
      ],
      'Finance': [
        { name: 'Commonwealth Bank', marketShare: 25, strength: 90 },
        { name: 'ANZ', marketShare: 22, strength: 88 },
        { name: 'Westpac', marketShare: 20, strength: 85 }
      ]
    },
    'CA': { // Canada
      'Finance': [
        { name: 'Royal Bank of Canada', marketShare: 25, strength: 90 },
        { name: 'TD Bank', marketShare: 22, strength: 88 },
        { name: 'Bank of Montreal', marketShare: 18, strength: 85 }
      ],
      'Technology': [
        { name: 'Shopify', marketShare: 15, strength: 92 },
        { name: 'BlackBerry', marketShare: 8, strength: 75 },
        { name: 'Nortel', marketShare: 5, strength: 70 }
      ]
    },
    'GB': { // United Kingdom
      'E-commerce': [
        { name: 'ASOS', marketShare: 15, strength: 85 },
        { name: 'Argos', marketShare: 12, strength: 82 },
        { name: 'John Lewis', marketShare: 10, strength: 88 }
      ],
      'Finance': [
        { name: 'Barclays', marketShare: 20, strength: 88 },
        { name: 'HSBC', marketShare: 18, strength: 90 },
        { name: 'Lloyds', marketShare: 15, strength: 85 }
      ]
    }
  };

  let competitors = globalCompetitorMap[industry] || [];
  
  // Add local competitors if available
  const localCompetitors = localCompetitorMap[countryCode]?.[industry] || [];
  
  // Combine global and local competitors
  const allCompetitors = [
    ...localCompetitors.map(comp => ({ ...comp, isLocal: true })),
    ...competitors.slice(0, 3).map(comp => ({ ...comp, isLocal: false }))
  ];

  // Filter out the brand itself
  const filteredCompetitors = allCompetitors.filter(comp => 
    comp.name.toLowerCase() !== brandName.toLowerCase()
  );

  return filteredCompetitors.slice(0, 5);
}

function generateRankingSimulation(
  brandName: string, 
  competitors: Array<{name: string; marketShare: number; strength: number; isLocal: boolean}>,
  questions: Array<{question: string; category: string; searchVolume: string; difficulty: string; isLocationSpecific: boolean}>,
  countryName: string,
  businessContext?: BusinessContext
): Array<{
  question: string;
  category: string;
  searchVolume: string;
  difficulty: string;
  isLocationSpecific: boolean;
  brandRank: number;
  totalResults: number;
  competitorRankings: Array<{
    name: string;
    rank: number;
    confidence: number;
    snippet: string;
    isLocal: boolean;
  }>;
  brandSnippet: string;
  brandConfidence: number;
}> {
  return questions.map(question => {
    // Business context can improve rankings for relevant questions
    let rankingBoost = 0;
    if (businessContext && 'isBusinessContextual' in question && question.isBusinessContextual) {
      rankingBoost = -1; // Better ranking for contextual questions
    }

    // Location-specific questions might have different ranking patterns
    const locationBoost = question.isLocationSpecific ? 1 : 0;
    const brandRank = Math.max(1, Math.floor(Math.random() * 5) + 1 + locationBoost + rankingBoost); // 1-6 (with boosts)
    const totalResults = Math.floor(Math.random() * 5) + 8; // 8-12
    
    // Generate competitor rankings with local preference for location-specific queries
    const competitorRankings = competitors.slice(0, 3).map((comp, index) => {
      const localBoost = question.isLocationSpecific && comp.isLocal ? -1 : 0;
      return {
        name: comp.name,
        rank: Math.max(1, Math.floor(Math.random() * 8) + 1 + localBoost),
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        snippet: generateLocationAwareSnippet(comp.name, question.question, question.category, countryName, question.isLocationSpecific, businessContext),
        isLocal: comp.isLocal
      };
    });

    return {
      question: question.question,
      category: question.category,
      searchVolume: question.searchVolume,
      difficulty: question.difficulty,
      isLocationSpecific: question.isLocationSpecific,
      brandRank,
      totalResults,
      competitorRankings: competitorRankings.sort((a, b) => a.rank - b.rank),
      brandSnippet: generateLocationAwareSnippet(brandName, question.question, question.category, countryName, question.isLocationSpecific, businessContext),
      brandConfidence: Math.floor(Math.random() * 25) + 75 // 75-100%
    };
  });
}

function generateLocationAwareSnippet(
  brandName: string, 
  question: string, 
  category: string, 
  countryName: string, 
  isLocationSpecific: boolean,
  businessContext?: BusinessContext
): string {
  const locationContext = isLocationSpecific ? ` in ${countryName}` : '';
  
  // Enhanced snippets with business context
  const contextualInfo = businessContext ? {
    audience: businessContext.targetAudience ? ` for ${businessContext.targetAudience.toLowerCase()}` : '',
    model: businessContext.businessModel ? ` as a ${businessContext.businessModel.toLowerCase()} solution` : '',
    personality: businessContext.brandPersonality ? ` with a ${businessContext.brandPersonality.toLowerCase()} approach` : ''
  } : { audience: '', model: '', personality: '' };
  
  const snippets: Record<string, string[]> = {
    'reliability': [
      `${brandName} has maintained a strong reputation for reliability${locationContext}${contextualInfo.audience} with consistent performance and high customer satisfaction ratings.`,
      `Users${locationContext} report ${brandName} as highly reliable${contextualInfo.model} with minimal downtime and excellent local customer support.`,
      `${brandName} offers enterprise-grade reliability${locationContext}${contextualInfo.personality} with 99.9% uptime and robust security measures.`
    ],
    'comparison': [
      `${brandName} stands out from competitors${locationContext}${contextualInfo.audience} with unique features, competitive pricing, and superior customer experience.`,
      `Compared to local alternatives${locationContext}, ${brandName} offers better value proposition${contextualInfo.model} and more comprehensive solutions.`,
      `${brandName} differentiates itself${locationContext}${contextualInfo.personality} through innovation, quality, and customer-centric approach.`
    ],
    'target-audience': [
      `${brandName} is specifically designed for ${businessContext?.targetAudience?.toLowerCase() || 'target customers'}${locationContext} with tailored features and support.`,
      `Many ${businessContext?.targetAudience?.toLowerCase() || 'customers'}${locationContext} choose ${brandName} for its specialized approach and industry expertise.`,
      `${brandName} understands the unique needs of ${businessContext?.targetAudience?.toLowerCase() || 'its audience'}${locationContext} and delivers accordingly.`
    ],
    'business-model': [
      `${brandName} excels in the ${businessContext?.businessModel?.toLowerCase() || 'business'} space${locationContext} with proven results and satisfied clients.`,
      `For ${businessContext?.businessModel?.toLowerCase() || 'business'} companies${locationContext}, ${brandName} offers scalable solutions and dedicated support.`,
      `${brandName}'s ${businessContext?.businessModel?.toLowerCase() || 'business'} focus${locationContext} ensures specialized features and industry-specific expertise.`
    ],
    'pricing': [
      `${brandName} offers excellent value${locationContext} within the ${businessContext?.priceRange?.toLowerCase() || 'competitive'} range with transparent pricing.`,
      `For ${businessContext?.priceRange?.toLowerCase() || 'budget-conscious'} customers${locationContext}, ${brandName} provides cost-effective solutions without compromising quality.`,
      `${brandName} pricing${locationContext} is competitive in the ${businessContext?.priceRange?.toLowerCase() || 'market'} segment with flexible payment options.`
    ],
    'brand-awareness': [
      `${brandName} helps businesses increase brand awareness${locationContext} through comprehensive marketing tools and analytics.`,
      `Companies using ${brandName}${locationContext} report significant improvements in brand visibility and customer engagement.`,
      `${brandName}'s brand awareness features${locationContext} include social media integration and content optimization tools.`
    ],
    'lead-generation': [
      `${brandName} generates high-quality leads${locationContext} with advanced targeting and conversion optimization features.`,
      `Businesses using ${brandName}${locationContext} see average lead increases of 40-60% within the first quarter.`,
      `${brandName}'s lead generation tools${locationContext} include automated follow-ups and customer relationship management.`
    ],
    'competitive-advantage': [
      `${brandName} helps smaller companies compete${locationContext} by providing enterprise-level features at accessible prices.`,
      `With ${brandName}${locationContext}, businesses gain competitive advantages through automation and data-driven insights.`,
      `${brandName} levels the playing field${locationContext} by offering tools previously available only to larger corporations.`
    ],
    'cost-effectiveness': [
      `${brandName} maximizes ROI${locationContext} with efficient resource utilization and automated processes.`,
      `Budget-conscious businesses${locationContext} choose ${brandName} for its cost-effective approach and transparent pricing.`,
      `${brandName} delivers exceptional value${locationContext} by reducing operational costs while improving performance.`
    ],
    'trust-building': [
      `${brandName} builds customer trust${locationContext} through transparent communication and reliable service delivery.`,
      `New customers${locationContext} quickly develop confidence in ${brandName} due to its proven track record and testimonials.`,
      `${brandName} establishes trust${locationContext} with comprehensive onboarding and dedicated customer success teams.`
    ],
    'brand-personality': [
      `${brandName} maintains a ${businessContext?.brandPersonality?.toLowerCase() || 'professional'} approach${locationContext} in all customer interactions and communications.`,
      `The ${businessContext?.brandPersonality?.toLowerCase() || 'distinctive'} personality of ${brandName}${locationContext} resonates well with its target audience.`,
      `${brandName}'s ${businessContext?.brandPersonality?.toLowerCase() || 'unique'} brand personality${locationContext} sets it apart in the competitive landscape.`
    ],
    // ... (keep existing categories)
    'evaluation': [
      `${brandName} pros${locationContext} include excellent performance, user-friendly interface, and strong local support. Cons may include pricing and availability.`,
      `Strengths of ${brandName}${locationContext}: reliability, features, local support. Weaknesses: cost, regional limitations.`,
      `${brandName} excels in quality and innovation${locationContext} but may have higher costs than local alternatives.`
    ],
    'decision': [
      `Choose ${brandName} if you prioritize quality and reliability${locationContext} over cost considerations.`,
      `${brandName} is ideal for users${locationContext} who need robust functionality and are willing to invest in premium solutions.`,
      `Consider ${brandName} for its proven track record${locationContext}, but evaluate local alternatives if budget is a concern.`
    ],
    'reviews': [
      `Users${locationContext} consistently praise ${brandName} for its quality, reliability, and customer service, with 4.5+ star ratings.`,
      `Customer reviews${locationContext} highlight ${brandName}'s excellent performance, though some mention pricing concerns.`,
      `${brandName} receives positive feedback${locationContext} for innovation and user experience, with high satisfaction scores.`
    ],
    'value': [
      `${brandName} offers good value for money${locationContext} with comprehensive features and reliable performance justifying the cost.`,
      `While ${brandName} may have higher upfront costs${locationContext}, the long-term value and ROI make it worthwhile.`,
      `${brandName} pricing is competitive${locationContext} when considering the full feature set and quality of service provided.`
    ],
    'support': [
      `${brandName} provides excellent customer support${locationContext} with 24/7 availability and local language assistance.`,
      `Support team${locationContext} is highly responsive and knowledgeable, with average response time under 2 hours.`,
      `${brandName} offers comprehensive support${locationContext} including phone, chat, and email with local representatives.`
    ],
    'trust': [
      `${brandName} has built strong trust${locationContext} through transparent practices and consistent service delivery.`,
      `Businesses${locationContext} trust ${brandName} for critical operations with proven security and compliance standards.`,
      `${brandName} maintains high trust scores${locationContext} with certifications and positive regulatory compliance.`
    ],
    'features': [
      `${brandName} key features include advanced functionality, intuitive design, and comprehensive integration capabilities.`,
      `Main benefits of ${brandName}: scalability, security, user-friendly interface, and excellent customer support.`,
      `${brandName} offers cutting-edge features with focus on performance, reliability, and user experience.`
    ],
    'security': [
      `${brandName} implements enterprise-grade security with encryption, compliance certifications, and regular security updates.`,
      `Security features of ${brandName} include multi-factor authentication, data encryption, and compliance with industry standards.`,
      `${brandName} prioritizes security with robust protection measures and transparent security practices.`
    ]
  };

  const categorySnippets = snippets[category] || snippets['evaluation'];
  return categorySnippets[Math.floor(Math.random() * categorySnippets.length)];
}

export async function POST(request: NextRequest) {
  try {
    const { brandName, industry, domain, businessContext } = await request.json();

    if (!brandName || !industry) {
      return NextResponse.json(
        { error: 'brandName and industry are required' },
        { status: 400 }
      );
    }

    // Detect user's location
    const location = getUserLocation(request);
    
    console.log(`[AI Ranking API] Generating data for: ${brandName} in ${industry} (Location: ${location.country})`, 
                businessContext ? 'with business context' : 'without business context');

    const rankingData = generateAIRankingData(brandName, industry, domain, location, businessContext);

    return NextResponse.json(rankingData);
  } catch (error) {
    console.error('[AI Ranking API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI ranking data' },
      { status: 500 }
    );
  }
} 