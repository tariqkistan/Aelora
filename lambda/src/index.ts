import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { analyzeWebsite } from './analyzer';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

// Use the environment variable from CDK, fallback to default
const TABLE_NAME = process.env.TABLE_NAME || process.env.DYNAMODB_TABLE_NAME || 'aelora-analysis-history';

/**
 * Remove undefined values from an object recursively
 */
function removeUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedValues(value);
      }
    }
    return cleaned;
  }
  
  return obj;
}

/**
 * Main Lambda handler function for analyzing websites
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event received:', JSON.stringify(event));
  
  try {
    // Get URL from query parameters
    const url = event.queryStringParameters?.url;
    
    if (!url) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'URL parameter is required' })
      };
    }
    
    console.log(`Analyzing URL: ${url}`);
    const startTime = Date.now();
    
    // Analyze the website with AI assistance
    const analysisResult = await analyzeWebsite(url);
    
    // Calculate processing time
    const totalTime = Date.now() - startTime;
    
    // Add performance metrics
    const resultWithPerformance = {
      ...analysisResult,
      performance: {
        totalTimeMs: totalTime
      }
    };
    
    // Store the analysis result in DynamoDB
    try {
      const cleanedResult = removeUndefinedValues({
        id: `${url}-${Date.now()}`,
        ...resultWithPerformance
      });
      
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: cleanedResult
        })
      );
      console.log('Analysis result stored in DynamoDB');
    } catch (dbError) {
      console.error('Error storing analysis result in DynamoDB:', dbError);
      // Continue even if DB storage fails
    }
    
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify(resultWithPerformance)
    };
  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ 
        error: 'Failed to analyze content',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

/**
 * Generate CORS headers for API responses
 */
function corsHeaders(): { [key: string]: string | boolean } {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };
} 