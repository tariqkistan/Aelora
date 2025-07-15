"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Users, 
  Target, 
  Award,
  BarChart3,
  MessageSquare,
  Eye,
  Zap,
  Crown,
  ArrowRight,
  RefreshCw,
  Building2,
  Sparkles
} from "lucide-react"

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

interface AIRankingData {
  brandName: string;
  industry: string;
  domain: string;
  location: {
    country: string;
    countryName: string;
    city?: string;
    region?: string;
    isEnglishSpeaking: boolean;
  };
  businessContext: {
    hasContext: boolean;
    targetAudience?: string;
    businessModel?: string;
    priceRange?: string;
    primaryGoals?: string[];
    currentChallenges?: string[];
    brandPersonality?: string;
  };
  aiQuestions: Array<{
    question: string;
    category: string;
    searchVolume: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'medium' | 'hard';
    isLocationSpecific: boolean;
    isBusinessContextual?: boolean;
  }>;
  competitors: Array<{
    name: string;
    marketShare: number;
    strength: number;
    isLocal: boolean;
    isFromBusinessContext?: boolean;
  }>;
  ranking: Array<{
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
  }>;
  timestamp: string;
}

interface AIRankingVisualizationProps {
  url: string;
  brandName?: string;
  industry?: string;
  businessContext?: BusinessContext;
}

export default function AIRankingVisualization({ url, brandName, industry, businessContext }: AIRankingVisualizationProps) {
  const [data, setData] = useState<AIRankingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const extractBrandFromUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.split('.')[0];
    } catch {
      return 'Brand';
    }
  };

  const detectIndustry = (url: string): string => {
    const domain = url.toLowerCase();
    if (domain.includes('shop') || domain.includes('store') || domain.includes('buy')) return 'E-commerce';
    if (domain.includes('tech') || domain.includes('software') || domain.includes('app')) return 'Technology';
    if (domain.includes('finance') || domain.includes('bank') || domain.includes('pay')) return 'Finance';
    if (domain.includes('health') || domain.includes('medical') || domain.includes('care')) return 'Healthcare';
    if (domain.includes('auto') || domain.includes('car') || domain.includes('drive')) return 'Automotive';
    return 'Technology';
  };

  const fetchAIRankingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const finalBrandName = businessContext?.companyName || brandName || extractBrandFromUrl(url);
      const finalIndustry = businessContext?.industry || industry || detectIndustry(url);
      
      const response = await fetch('/api/ai-ranking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandName: finalBrandName,
          industry: finalIndustry,
          domain: url,
          businessContext: businessContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI ranking data');
      }

      const rankingData = await response.json();
      setData(rankingData);
    } catch (err) {
      console.error('Error fetching AI ranking data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load AI ranking data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIRankingData();
  }, [url, brandName, industry, businessContext]);

  const getVolumeColor = (volume: string) => {
    switch (volume) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'easy': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'text-green-600';
    if (rank <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredRankings = data?.ranking.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  ) || [];

  const categories = Array.from(new Set(data?.ranking.map(item => item.category) || []));

  const averageRank = (data?.ranking?.reduce((sum, item) => sum + item.brandRank, 0) || 0) / (data?.ranking?.length || 1);
  const averageConfidence = (data?.ranking?.reduce((sum, item) => sum + item.brandConfidence, 0) || 0) / (data?.ranking?.length || 1);

  // Count business contextual questions
  const contextualQuestions = data?.aiQuestions.filter(q => q.isBusinessContextual).length || 0;
  const contextualCompetitors = data?.competitors.filter(c => c.isFromBusinessContext).length || 0;

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Analyzing AI Search Rankings...
            {businessContext && (
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Enhanced with Business Context
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-pulse bg-muted h-4 w-48 rounded mb-2"></div>
              <div className="animate-pulse bg-muted h-4 w-32 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <MessageSquare className="h-5 w-5" />
            AI Search Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAIRankingData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with Business Context Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              AI Search Rankings for {data.brandName}
            </div>
            {data.businessContext.hasContext && (
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Business Context Applied
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Industry: {data.industry}</span>
            <span>•</span>
            <span>Location: {data.location.countryName}</span>
            {data.location.city && (
              <>
                <span>•</span>
                <span>City: {data.location.city}</span>
              </>
            )}
          </div>
          
          {/* Business Context Summary */}
          {data.businessContext.hasContext && (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Enhanced Analysis</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-blue-700">Contextual Questions:</span>
                  <span className="font-medium ml-1">{contextualQuestions}/{data.aiQuestions.length}</span>
                </div>
                <div>
                  <span className="text-blue-700">Your Competitors:</span>
                  <span className="font-medium ml-1">{contextualCompetitors}/{data.competitors.length}</span>
                </div>
                {data.businessContext.targetAudience && (
                  <div>
                    <span className="text-blue-700">Target:</span>
                    <span className="font-medium ml-1">{data.businessContext.targetAudience.slice(0, 20)}...</span>
                  </div>
                )}
                {data.businessContext.businessModel && (
                  <div>
                    <span className="text-blue-700">Model:</span>
                    <span className="font-medium ml-1">{data.businessContext.businessModel}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Average Rank</p>
                <p className={`text-2xl font-bold ${getRankColor(averageRank)}`}>
                  #{averageRank.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className={`text-2xl font-bold ${getConfidenceColor(averageConfidence)}`}>
                  {averageConfidence.toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Competitors</p>
                <p className="text-2xl font-bold">{data.competitors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">AI Questions</p>
                <p className="text-2xl font-bold">{data.aiQuestions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questions">Questions Users Ask AI</TabsTrigger>
          <TabsTrigger value="rankings">Ranking Analysis</TabsTrigger>
          <TabsTrigger value="competitors">Competitor Landscape</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Questions Users Ask AI About Your Brand
                {data.businessContext.hasContext && contextualQuestions > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {contextualQuestions} Personalized
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {data.businessContext.hasContext 
                  ? `AI-generated questions tailored to your business context and target audience`
                  : `Common questions users ask AI tools about your brand`
                }
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {data.aiQuestions.map((question, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium mb-2">{question.question}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={getVolumeColor(question.searchVolume)}>
                            {question.searchVolume} volume
                          </Badge>
                          <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          {question.isLocationSpecific && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              <Eye className="h-3 w-3 mr-1" />
                              Location-specific
                            </Badge>
                          )}
                          {question.isBusinessContextual && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Business Context
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {question.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                AI Search Ranking Analysis
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filter by category:</span>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRankings.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{item.question}</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className={getVolumeColor(item.searchVolume)}>
                            {item.searchVolume} volume
                          </Badge>
                          <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>
                            {item.difficulty}
                          </Badge>
                          {item.isLocationSpecific && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              Location-specific
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${getRankColor(item.brandRank)}`}>
                            #{item.brandRank}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            of {item.totalResults}
                          </span>
                        </div>
                        <div className={`text-sm ${getConfidenceColor(item.brandConfidence)}`}>
                          {item.brandConfidence}% confidence
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Your Brand's AI Response:</p>
                      <p className="text-sm text-muted-foreground">{item.brandSnippet}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Competitor Rankings:</p>
                      {item.competitorRankings.map((comp, compIndex) => (
                        <div key={compIndex} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${getRankColor(comp.rank)}`}>
                              #{comp.rank}
                            </span>
                            <span className="text-sm">{comp.name}</span>
                            {comp.isLocal && (
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                                Local
                              </Badge>
                            )}
                          </div>
                          <span className={`text-xs ${getConfidenceColor(comp.confidence)}`}>
                            {comp.confidence}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Competitor Landscape
                {data.businessContext.hasContext && contextualCompetitors > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {contextualCompetitors} From Your Input
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {data.businessContext.hasContext 
                  ? `Competitor analysis including your specified competitors and industry leaders`
                  : `Key competitors in your industry and location`
                }
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {data.competitors.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {competitor.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{competitor.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {competitor.isLocal && (
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                              Local
                            </Badge>
                          )}
                          {competitor.isFromBusinessContext && (
                            <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Your Input
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Market Share</p>
                          <p className="font-medium">{competitor.marketShare}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Strength</p>
                          <div className="flex items-center gap-2">
                            <Progress value={competitor.strength} className="w-16" />
                            <span className="text-sm font-medium">{competitor.strength}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={fetchAIRankingData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>
    </div>
  );
} 