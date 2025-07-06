import { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { BrandComparison, GPTBrandComparisonResult, TABLE_NAMES } from '../types/brand-models';

/**
 * Service for storing and retrieving brand comparison data from DynamoDB
 */
export class BrandComparisonStorageService {
  private dynamoClient: DynamoDBClient;
  private tableName: string;

  constructor() {
    this.dynamoClient = new DynamoDBClient({ 
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.tableName = process.env.BRAND_COMPARISONS_TABLE || TABLE_NAMES.BRAND_COMPARISONS;
  }

  /**
   * Store a brand comparison result in DynamoDB
   */
  async storeBrandComparison(
    brandA: string, 
    brandB: string, 
    industry: string, 
    gptResult: GPTBrandComparisonResult
  ): Promise<BrandComparison> {
    try {
      const timestamp = new Date().toISOString();
      const comparisonId = this.generateComparisonId(brandA, brandB);
      
      const brandComparison: BrandComparison = {
        comparisonId,
        timestamp,
        brandA,
        brandB,
        industry,
        brandAStrengths: gptResult.brandA.strengths,
        brandAWeaknesses: gptResult.brandA.weaknesses,
        brandBStrengths: gptResult.brandB.strengths,
        brandBWeaknesses: gptResult.brandB.weaknesses,
        verdict: gptResult.verdict.reasoning,
        winner: gptResult.verdict.winner,
        analysisDate: timestamp.split('T')[0], // YYYY-MM-DD format
        confidence: gptResult.verdict.confidence,
        summary: gptResult.summary,
        methodology: 'GPT-4 Competitive Analysis',
        createdAt: timestamp,
        updatedAt: timestamp
      };

      // Clean undefined values recursively
      const cleanedComparison = this.removeUndefinedValues(brandComparison);

      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(cleanedComparison),
        // Prevent overwriting existing comparisons with same ID and timestamp
        ConditionExpression: 'attribute_not_exists(comparisonId) AND attribute_not_exists(#ts)',
        ExpressionAttributeNames: {
          '#ts': 'timestamp'
        }
      });

      await this.dynamoClient.send(command);
      
      console.log(`Brand comparison stored successfully: ${comparisonId}`);
      return brandComparison;
    } catch (error) {
      console.error('Error storing brand comparison:', error);
      throw new Error(`Failed to store brand comparison: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve a specific brand comparison by ID and timestamp
   */
  async getBrandComparison(comparisonId: string, timestamp: string): Promise<BrandComparison | null> {
    try {
      const command = new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({
          comparisonId,
          timestamp
        })
      });

      const response = await this.dynamoClient.send(command);
      
      if (!response.Item) {
        return null;
      }

      return unmarshall(response.Item) as BrandComparison;
    } catch (error) {
      console.error('Error retrieving brand comparison:', error);
      throw new Error(`Failed to retrieve brand comparison: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all comparisons for a specific brand pair
   */
  async getBrandComparisonHistory(brandA: string, brandB: string): Promise<BrandComparison[]> {
    try {
      const comparisonId = this.generateComparisonId(brandA, brandB);
      
      const command = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'comparisonId = :comparisonId',
        ExpressionAttributeValues: marshall({
          ':comparisonId': comparisonId
        }),
        ScanIndexForward: false, // Sort by timestamp descending (newest first)
        Limit: 10 // Limit to last 10 comparisons
      });

      const response = await this.dynamoClient.send(command);
      
      if (!response.Items) {
        return [];
      }

      return response.Items.map(item => unmarshall(item) as BrandComparison);
    } catch (error) {
      console.error('Error retrieving brand comparison history:', error);
      throw new Error(`Failed to retrieve brand comparison history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a consistent comparison ID for brand pairs
   * Ensures A-B and B-A comparisons have the same ID by sorting alphabetically
   */
  private generateComparisonId(brandA: string, brandB: string): string {
    const brands = [brandA.toLowerCase(), brandB.toLowerCase()].sort();
    return `${brands[0]}#${brands[1]}`;
  }

  /**
   * Recursively remove undefined values from an object
   */
  private removeUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedValues(item));
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.removeUndefinedValues(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  }

  /**
   * Check if a recent comparison exists for the brand pair
   */
  async hasRecentComparison(brandA: string, brandB: string, hoursThreshold: number = 24): Promise<boolean> {
    try {
      const comparisonId = this.generateComparisonId(brandA, brandB);
      const cutoffTime = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000).toISOString();
      
      const command = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'comparisonId = :comparisonId AND #ts > :cutoffTime',
        ExpressionAttributeNames: {
          '#ts': 'timestamp'
        },
        ExpressionAttributeValues: marshall({
          ':comparisonId': comparisonId,
          ':cutoffTime': cutoffTime
        }),
        Limit: 1
      });

      const response = await this.dynamoClient.send(command);
      return !!(response.Items && response.Items.length > 0);
    } catch (error) {
      console.error('Error checking for recent comparison:', error);
      return false; // Assume no recent comparison if error occurs
    }
  }
} 