/**
 * DynamoDB Data Models for Brand Visibility Tracking
 */

export interface BrandMention {
  keyword: string;
  tone: 'positive' | 'neutral' | 'negative';
  frequency: number;
}

export interface BrandVisibilitySnapshot {
  // DynamoDB partition key
  brandName: string;
  
  // DynamoDB sort key
  timestamp: string; // ISO string
  
  // Analysis data
  sentimentScore: number; // -1 to 1 scale
  mentions: BrandMention[];
  summary: string;
  
  // Metadata
  domain?: string;
  industry?: string;
  analysisVersion: string; // Track which version of analysis was used
  
  // TTL for automatic cleanup (optional)
  expiresAt?: number; // Unix timestamp
}

export interface BrandProfile {
  // DynamoDB partition key
  brandName: string;
  
  // Brand information
  domain: string;
  industry: string;
  competitors: string[];
  
  // Metadata
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  
  // Configuration
  analysisFrequency?: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
}

/**
 * Request/Response Types for API
 */
export interface BrandVisibilityRequest {
  brandName: string;
  domain: string;
  industry: string;
}

export interface BrandVisibilityResponse {
  success: boolean;
  data?: BrandVisibilitySnapshot;
  error?: string;
}

/**
 * OpenAI Analysis Response Structure
 */
export interface OpenAIBrandAnalysis {
  sentimentScore: number;
  mentions: BrandMention[];
  summary: string;
  confidence: number; // 0-1 scale for analysis confidence
}

/**
 * DynamoDB Table Names (for environment configuration)
 */
export const TABLE_NAMES = {
  BRAND_VISIBILITY_SNAPSHOTS: 'BrandVisibilitySnapshots',
  BRAND_PROFILES: 'BrandProfiles',
  BRAND_COMPARISONS: 'BrandComparisons'
} as const;

/**
 * Brand Comparison Result stored in DynamoDB
 */
export interface BrandComparison {
  // Primary key: brandA#brandB (e.g., "Apple#Microsoft")
  comparisonId: string;
  
  // Sort key: timestamp
  timestamp: string;
  
  // Comparison details
  brandA: string;
  brandB: string;
  industry: string;
  
  // Analysis results
  brandAStrengths: string[];
  brandAWeaknesses: string[];
  brandBStrengths: string[];
  brandBWeaknesses: string[];
  
  // GPT-4 verdict
  verdict: string;
  winner: string; // "brandA" | "brandB" | "tie"
  
  // Metadata
  analysisDate: string;
  confidence: number;
  
  // Optional fields
  summary?: string;
  methodology?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Brand Comparison Request payload
 */
export interface BrandComparisonRequest {
  brandA: string;
  brandB: string;
  industry: string;
}

/**
 * Brand Comparison Response
 */
export interface BrandComparisonResponse {
  success: boolean;
  data?: BrandComparison;
  error?: string;
}

/**
 * GPT-4 Brand Comparison Analysis Result
 */
export interface GPTBrandComparisonResult {
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
    confidence: number;
  };
  summary: string;
} 