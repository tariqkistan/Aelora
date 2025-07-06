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
  BRAND_PROFILES: 'BrandProfiles'
} as const; 