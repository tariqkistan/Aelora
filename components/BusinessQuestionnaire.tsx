"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  MapPin, 
  Users, 
  Target, 
  Globe, 
  DollarSign, 
  ArrowRight, 
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export interface BusinessInfo {
  // Company basics
  companyName: string;
  website: string;
  industry: string;
  companySize: string;
  
  // Location & Market
  primaryLocation: string;
  country: string;
  targetMarkets: string[];
  languages: string[];
  
  // Business model & audience
  businessModel: string;
  targetAudience: string;
  priceRange: string;
  
  // Competitive landscape
  mainCompetitors: string[];
  uniqueSellingPoints: string[];
  
  // Goals & challenges
  primaryGoals: string[];
  currentChallenges: string[];
  
  // Additional context
  brandPersonality: string;
  additionalInfo: string;
}

interface BusinessQuestionnaireProps {
  onComplete: (businessInfo: BusinessInfo) => void;
  onSkip: () => void;
}

export default function BusinessQuestionnaire({ onComplete, onSkip }: BusinessQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    companyName: "",
    website: "",
    industry: "",
    companySize: "",
    primaryLocation: "",
    country: "",
    targetMarkets: [],
    languages: [],
    businessModel: "",
    targetAudience: "",
    priceRange: "",
    mainCompetitors: [],
    uniqueSellingPoints: [],
    primaryGoals: [],
    currentChallenges: [],
    brandPersonality: "",
    additionalInfo: ""
  });

  const totalSteps = 5;

  // Form validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(businessInfo.companyName && businessInfo.website && businessInfo.industry);
      case 2:
        return !!(businessInfo.primaryLocation && businessInfo.country);
      case 3:
        return !!(businessInfo.businessModel && businessInfo.targetAudience);
      case 4:
        return businessInfo.primaryGoals.length > 0;
      case 5:
        return true; // Optional step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleComplete = () => {
    onComplete(businessInfo);
  };

  const updateBusinessInfo = (field: keyof BusinessInfo, value: any) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: keyof BusinessInfo, value: string) => {
    if (value.trim()) {
      updateBusinessInfo(field, [...(businessInfo[field] as string[]), value.trim()]);
    }
  };

  const removeFromArray = (field: keyof BusinessInfo, index: number) => {
    const array = businessInfo[field] as string[];
    updateBusinessInfo(field, array.filter((_, i) => i !== index));
  };

  const industries = [
    "Technology", "Healthcare", "Finance", "E-commerce", "Retail", "Manufacturing",
    "Education", "Real Estate", "Automotive", "Food & Beverage", "Travel & Tourism",
    "Entertainment", "Professional Services", "Construction", "Energy", "Non-profit",
    "Government", "Agriculture", "Fashion", "Sports & Fitness", "Other"
  ];

  const companySizes = [
    "Solo/Freelancer (1 person)",
    "Small Business (2-10 employees)",
    "Medium Business (11-50 employees)",
    "Large Business (51-200 employees)",
    "Enterprise (201+ employees)"
  ];

  const countries = [
    "United States", "Canada", "United Kingdom", "Australia", "Germany", "France",
    "Netherlands", "Sweden", "Norway", "Denmark", "Switzerland", "Belgium",
    "Spain", "Italy", "Portugal", "Ireland", "Austria", "Finland", "Poland",
    "Czech Republic", "Hungary", "Romania", "Greece", "Turkey", "Russia",
    "Japan", "South Korea", "China", "India", "Singapore", "Malaysia",
    "Thailand", "Indonesia", "Philippines", "Vietnam", "Hong Kong", "Taiwan",
    "Brazil", "Mexico", "Argentina", "Chile", "Colombia", "Peru", "Venezuela",
    "South Africa", "Nigeria", "Kenya", "Ghana", "Egypt", "Morocco",
    "Israel", "UAE", "Saudi Arabia", "Qatar", "Kuwait", "Jordan", "Other"
  ];

  const businessModels = [
    "B2B (Business to Business)",
    "B2C (Business to Consumer)",
    "B2B2C (Business to Business to Consumer)",
    "SaaS (Software as a Service)",
    "E-commerce/Retail",
    "Marketplace",
    "Subscription Service",
    "Freemium",
    "Consulting/Professional Services",
    "Manufacturing",
    "Non-profit",
    "Other"
  ];

  const priceRanges = [
    "Free/Open Source",
    "Budget ($1-$50)",
    "Mid-range ($51-$500)",
    "Premium ($501-$2,000)",
    "Enterprise ($2,001-$10,000)",
    "High-end ($10,000+)",
    "Custom Pricing"
  ];

  const goalOptions = [
    "Increase brand awareness",
    "Generate more leads",
    "Improve search rankings",
    "Enhance customer trust",
    "Expand to new markets",
    "Compete with larger brands",
    "Improve customer education",
    "Increase sales conversions",
    "Build thought leadership",
    "Improve customer support"
  ];

  const challengeOptions = [
    "Low brand visibility",
    "Strong competition",
    "Limited marketing budget",
    "Difficulty reaching target audience",
    "Poor search rankings",
    "Lack of customer trust",
    "Complex product/service explanation",
    "Seasonal business fluctuations",
    "Regulatory compliance",
    "Technical limitations"
  ];

  const brandPersonalities = [
    "Professional & Trustworthy",
    "Innovative & Cutting-edge",
    "Friendly & Approachable",
    "Luxury & Premium",
    "Fun & Playful",
    "Reliable & Dependable",
    "Expert & Authoritative",
    "Caring & Supportive",
    "Bold & Disruptive",
    "Traditional & Established"
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building2 className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Company Basics</h3>
              <p className="text-muted-foreground">Tell us about your company</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Acme Corporation"
                  value={businessInfo.companyName}
                  onChange={(e) => updateBusinessInfo('companyName', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website URL *</Label>
                <Input
                  id="website"
                  placeholder="e.g., https://www.acme.com"
                  value={businessInfo.website}
                  onChange={(e) => updateBusinessInfo('website', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select value={businessInfo.industry} onValueChange={(value) => updateBusinessInfo('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="companySize">Company Size</Label>
                <Select value={businessInfo.companySize} onValueChange={(value) => updateBusinessInfo('companySize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Location & Markets</h3>
              <p className="text-muted-foreground">Where are you based and who do you serve?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="primaryLocation">Primary Location/City *</Label>
                <Input
                  id="primaryLocation"
                  placeholder="e.g., New York, NY or London, UK"
                  value={businessInfo.primaryLocation}
                  onChange={(e) => updateBusinessInfo('primaryLocation', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="country">Country *</Label>
                <Select value={businessInfo.country} onValueChange={(value) => updateBusinessInfo('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Target Markets (Optional)</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add target market/region"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray('targetMarkets', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addToArray('targetMarkets', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {businessInfo.targetMarkets.map((market, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFromArray('targetMarkets', index)}>
                        {market} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Business Model & Audience</h3>
              <p className="text-muted-foreground">How does your business work?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessModel">Business Model *</Label>
                <Select value={businessInfo.businessModel} onValueChange={(value) => updateBusinessInfo('businessModel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business model" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="targetAudience">Target Audience *</Label>
                <Textarea
                  id="targetAudience"
                  placeholder="Describe your ideal customers (e.g., Small business owners, Tech professionals, Parents with young children)"
                  value={businessInfo.targetAudience}
                  onChange={(e) => updateBusinessInfo('targetAudience', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="priceRange">Price Range</Label>
                <Select value={businessInfo.priceRange} onValueChange={(value) => updateBusinessInfo('priceRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your price range" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Goals & Challenges</h3>
              <p className="text-muted-foreground">What are you trying to achieve?</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Primary Goals *</Label>
                <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {goalOptions.map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={businessInfo.primaryGoals.includes(goal)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateBusinessInfo('primaryGoals', [...businessInfo.primaryGoals, goal]);
                          } else {
                            updateBusinessInfo('primaryGoals', businessInfo.primaryGoals.filter(g => g !== goal));
                          }
                        }}
                      />
                      <Label htmlFor={goal} className="text-sm">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-base font-medium">Current Challenges</Label>
                <p className="text-sm text-muted-foreground mb-3">Select any that apply</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {challengeOptions.map((challenge) => (
                    <div key={challenge} className="flex items-center space-x-2">
                      <Checkbox
                        id={challenge}
                        checked={businessInfo.currentChallenges.includes(challenge)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateBusinessInfo('currentChallenges', [...businessInfo.currentChallenges, challenge]);
                          } else {
                            updateBusinessInfo('currentChallenges', businessInfo.currentChallenges.filter(c => c !== challenge));
                          }
                        }}
                      />
                      <Label htmlFor={challenge} className="text-sm">{challenge}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Additional Context</h3>
              <p className="text-muted-foreground">Help us understand your brand better</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="brandPersonality">Brand Personality</Label>
                <Select value={businessInfo.brandPersonality} onValueChange={(value) => updateBusinessInfo('brandPersonality', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="How would you describe your brand?" />
                  </SelectTrigger>
                  <SelectContent>
                    {brandPersonalities.map((personality) => (
                      <SelectItem key={personality} value={personality}>
                        {personality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Main Competitors (Optional)</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add competitor name"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray('mainCompetitors', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addToArray('mainCompetitors', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {businessInfo.mainCompetitors.map((competitor, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFromArray('mainCompetitors', index)}>
                        {competitor} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Any other information that might help us analyze your website better..."
                  value={businessInfo.additionalInfo}
                  onChange={(e) => updateBusinessInfo('additionalInfo', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Business Information</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i + 1 === currentStep 
                      ? 'bg-blue-600' 
                      : i + 1 < currentStep 
                        ? 'bg-green-600' 
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            This information helps us provide better AI analysis for your website
          </p>
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip for now
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStepContent()}
        
        <div className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep === totalSteps ? (
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete & Analyze
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Validation message */}
        {!validateStep(currentStep) && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>Please fill in all required fields to continue</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 