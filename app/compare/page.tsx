'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Zap, Shield, TrendingUp, AlertTriangle, Crown, Users } from 'lucide-react';

interface ComparisonData {
  brandA: {
    name: string;
    strengths: string[];
    weaknesses: string[];
  };
  brandB: {
    name: string;
    strengths: string[];
    weaknesses: string[];
  };
  verdict: {
    winner: string;
    reasoning: string;
    recommendation: string;
  };
  generatedAt: string;
}

interface ComparisonResponse {
  success: boolean;
  data?: ComparisonData;
  source?: string;
  warning?: string;
  error?: string;
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Automotive',
  'Education',
  'Entertainment',
  'Food & Beverage',
  'Real Estate',
  'Travel',
  'Fashion',
  'Sports',
  'Energy',
  'Telecommunications'
];

export default function ComparePage() {
  const [brandA, setBrandA] = useState('');
  const [brandB, setBrandB] = useState('');
  const [industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brandA.trim() || !brandB.trim() || !industry) {
      setError('Please fill in all fields');
      return;
    }

    if (brandA.toLowerCase().trim() === brandB.toLowerCase().trim()) {
      setError('Please select two different brands for comparison');
      return;
    }

    setIsLoading(true);
    setError(null);
    setWarning(null);
    setComparison(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandA: brandA.trim(),
          brandB: brandB.trim(),
          industry
        }),
      });

      const result: ComparisonResponse = await response.json();

      if (result.success && result.data) {
        setComparison(result.data);
        setSource(result.source || null);
        setWarning(result.warning || null);
      } else {
        setError(result.error || 'Failed to generate comparison');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Compare error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setBrandA('');
    setBrandB('');
    setIndustry('');
    setComparison(null);
    setError(null);
    setWarning(null);
    setSource(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Brand Comparison Tool
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Compare two brands side-by-side with AI-powered analysis of their strengths, 
          weaknesses, and competitive positioning.
        </p>
      </div>

      {/* Input Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Brands to Compare
          </CardTitle>
          <CardDescription>
            Choose two brands from the same industry for detailed comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Brand A */}
              <div className="space-y-2">
                <Label htmlFor="brandA">Brand A</Label>
                <Input
                  id="brandA"
                  type="text"
                  placeholder="e.g., Apple"
                  value={brandA}
                  onChange={(e) => setBrandA(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Brand B */}
              <div className="space-y-2">
                <Label htmlFor="brandB">Brand B</Label>
                <Input
                  id="brandB"
                  type="text"
                  placeholder="e.g., Samsung"
                  value={brandB}
                  onChange={(e) => setBrandB(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Compare Brands
                  </>
                )}
              </Button>
              
              {(comparison || error) && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  New Comparison
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Warning Alert */}
      {warning && (
        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-amber-800">
            {warning}
          </AlertDescription>
        </Alert>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-8">
          {/* Source Badge */}
          {source && (
            <div className="flex justify-center">
              <Badge variant={source === 'gpt' ? 'default' : 'secondary'}>
                {source === 'gpt' ? '🤖 AI-Generated Analysis' : '📊 Sample Data'}
              </Badge>
            </div>
          )}

          {/* Two-Column Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Brand A */}
            <Card className="h-fit">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-2xl text-blue-900 flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  {comparison.brandA.name}
                </CardTitle>
                <CardDescription>
                  Competitive analysis and market position
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Strengths */}
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {comparison.brandA.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Weaknesses */}
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Weaknesses
                  </h3>
                  <ul className="space-y-2">
                    {comparison.brandA.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Brand B */}
            <Card className="h-fit">
              <CardHeader className="bg-purple-50 border-b">
                <CardTitle className="text-2xl text-purple-900 flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  {comparison.brandB.name}
                </CardTitle>
                <CardDescription>
                  Competitive analysis and market position
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Strengths */}
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {comparison.brandB.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Weaknesses */}
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Weaknesses
                  </h3>
                  <ul className="space-y-2">
                    {comparison.brandB.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Verdict Card */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-900 flex items-center gap-2">
                <Crown className="h-6 w-6" />
                Final Verdict
              </CardTitle>
              <CardDescription>
                AI analysis conclusion and recommendation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-amber-200">
                <h4 className="font-semibold text-lg mb-2 text-amber-900">
                  Winner: {comparison.verdict.winner}
                </h4>
                <p className="text-gray-700 mb-4">
                  {comparison.verdict.reasoning}
                </p>
                <div className="border-t border-amber-200 pt-4">
                  <h5 className="font-semibold text-amber-900 mb-2">Recommendation:</h5>
                  <p className="text-gray-700">
                    {comparison.verdict.recommendation}
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 text-center">
                Analysis generated on {new Date(comparison.generatedAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 