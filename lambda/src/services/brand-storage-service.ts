import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { BrandVisibilitySnapshot, BrandProfile, TABLE_NAMES } from '../types/brand-models';

/**
 * DynamoDB Storage Service for Brand Data
 */
export class BrandStorageService {
  private docClient: DynamoDBDocumentClient;
  private visibilityTableName: string;
  private profilesTableName: string;

  constructor(region: string = 'us-east-1') {
    const client = new DynamoDBClient({ region });
    this.docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true
      }
    });
    
    // Use environment variables or defaults
    this.visibilityTableName = process.env.BRAND_VISIBILITY_TABLE_NAME || TABLE_NAMES.BRAND_VISIBILITY_SNAPSHOTS;
    this.profilesTableName = process.env.BRAND_PROFILES_TABLE_NAME || TABLE_NAMES.BRAND_PROFILES;
  }

  /**
   * Save a brand visibility snapshot to DynamoDB
   */
  async saveBrandVisibilitySnapshot(snapshot: BrandVisibilitySnapshot): Promise<void> {
    try {
      console.log(`Saving brand visibility snapshot for: ${snapshot.brandName}`);
      
      // Clean the data before saving
      const cleanedSnapshot = this.removeUndefinedValues(snapshot);
      
      await this.docClient.send(
        new PutCommand({
          TableName: this.visibilityTableName,
          Item: cleanedSnapshot
        })
      );
      
      console.log('Brand visibility snapshot saved successfully');
    } catch (error) {
      console.error('Error saving brand visibility snapshot:', error);
      throw new Error(`Failed to save brand visibility snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the latest brand visibility snapshot
   */
  async getLatestBrandVisibilitySnapshot(brandName: string): Promise<BrandVisibilitySnapshot | null> {
    try {
      console.log(`Fetching latest snapshot for brand: ${brandName}`);
      
      const result = await this.docClient.send(
        new QueryCommand({
          TableName: this.visibilityTableName,
          KeyConditionExpression: 'brandName = :brandName',
          ExpressionAttributeValues: {
            ':brandName': brandName
          },
          ScanIndexForward: false, // Sort by timestamp descending
          Limit: 1
        })
      );

      if (result.Items && result.Items.length > 0) {
        return result.Items[0] as BrandVisibilitySnapshot;
      }

      return null;
    } catch (error) {
      console.error('Error fetching brand visibility snapshot:', error);
      throw new Error(`Failed to fetch brand visibility snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get brand visibility history (multiple snapshots)
   */
  async getBrandVisibilityHistory(
    brandName: string, 
    limit: number = 10
  ): Promise<BrandVisibilitySnapshot[]> {
    try {
      console.log(`Fetching visibility history for brand: ${brandName}, limit: ${limit}`);
      
      const result = await this.docClient.send(
        new QueryCommand({
          TableName: this.visibilityTableName,
          KeyConditionExpression: 'brandName = :brandName',
          ExpressionAttributeValues: {
            ':brandName': brandName
          },
          ScanIndexForward: false, // Sort by timestamp descending
          Limit: limit
        })
      );

      return (result.Items || []) as BrandVisibilitySnapshot[];
    } catch (error) {
      console.error('Error fetching brand visibility history:', error);
      throw new Error(`Failed to fetch brand visibility history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save or update a brand profile
   */
  async saveBrandProfile(profile: BrandProfile): Promise<void> {
    try {
      console.log(`Saving brand profile for: ${profile.brandName}`);
      
      // Clean the data before saving
      const cleanedProfile = this.removeUndefinedValues(profile);
      
      await this.docClient.send(
        new PutCommand({
          TableName: this.profilesTableName,
          Item: cleanedProfile
        })
      );
      
      console.log('Brand profile saved successfully');
    } catch (error) {
      console.error('Error saving brand profile:', error);
      throw new Error(`Failed to save brand profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a brand profile
   */
  async getBrandProfile(brandName: string): Promise<BrandProfile | null> {
    try {
      console.log(`Fetching brand profile for: ${brandName}`);
      
      const result = await this.docClient.send(
        new GetCommand({
          TableName: this.profilesTableName,
          Key: {
            brandName: brandName
          }
        })
      );

      if (result.Item) {
        return result.Item as BrandProfile;
      }

      return null;
    } catch (error) {
      console.error('Error fetching brand profile:', error);
      throw new Error(`Failed to fetch brand profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a brand visibility snapshot from analysis data
   */
  createVisibilitySnapshot(
    brandName: string,
    domain: string,
    industry: string,
    analysis: any,
    analysisVersion: string = '1.0'
  ): BrandVisibilitySnapshot {
    const now = new Date().toISOString();
    
    return {
      brandName,
      timestamp: now,
      sentimentScore: analysis.sentimentScore,
      mentions: analysis.mentions,
      summary: analysis.summary,
      domain,
      industry,
      analysisVersion,
      // Set TTL for 1 year from now (optional)
      expiresAt: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
    };
  }

  /**
   * Create or update a brand profile
   */
  createBrandProfile(
    brandName: string,
    domain: string,
    industry: string,
    competitors: string[] = []
  ): BrandProfile {
    const now = new Date().toISOString();
    
    return {
      brandName,
      domain,
      industry,
      competitors,
      createdAt: now,
      updatedAt: now,
      analysisFrequency: 'weekly',
      isActive: true
    };
  }

  /**
   * Remove undefined values from objects recursively
   */
  private removeUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedValues(item)).filter(item => item !== undefined);
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
} 