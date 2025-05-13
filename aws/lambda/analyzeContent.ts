import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'aelora-analysis-history';

interface AnalysisResult {
  url: string;
  timestamp: string;
  scores: {
    readability: number;
    schema: number;
    questionAnswerMatch: number;
    headingsStructure: number;
    overallScore: number;
  };
  recommendations: string[];
  details: {
    wordCount: number;
    hasSchema: boolean;
    headingCount: number;
    imageCount: number;
    imageAltTextRate: number;
    readabilityMetrics: {
      sentenceLength: number;
      wordLength: number;
    };
  };
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get URL from query parameters
    const url = event.queryStringParameters?.url;
    
    if (!url) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ error: 'URL parameter is required' })
      };
    }
    
    // In a real implementation, we would:
    // 1. Fetch content from the URL
    // 2. Analyze the content using AI (OpenAI or Claude)
    // 3. Generate scores and recommendations
    
    // For MVP, we'll return mock data
    const analysisResult: AnalysisResult = {
      url,
      timestamp: new Date().toISOString(),
      scores: {
        readability: Math.floor(Math.random() * 30) + 70,
        schema: Math.floor(Math.random() * 40) + 60,
        questionAnswerMatch: Math.floor(Math.random() * 20) + 80,
        headingsStructure: Math.floor(Math.random() * 25) + 75,
        overallScore: Math.floor(Math.random() * 25) + 75
      },
      recommendations: [
        "Add more structured data using Schema.org markup",
        "Improve content organization with clear headings and subheadings",
        "Include more concise answers to common questions in your niche",
        "Use shorter paragraphs and sentences to improve readability",
        "Add more descriptive meta tags and image alt text"
      ],
      details: {
        wordCount: 1500,
        hasSchema: Math.random() > 0.5,
        headingCount: Math.floor(Math.random() * 10) + 5,
        imageCount: Math.floor(Math.random() * 8) + 2,
        imageAltTextRate: Math.floor(Math.random() * 100),
        readabilityMetrics: {
          sentenceLength: Math.floor(Math.random() * 10) + 15,
          wordLength: Math.floor(Math.random() * 2) + 5
        }
      }
    };
    
    // Store the analysis result in DynamoDB
    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            id: `${url}-${Date.now()}`,
            ...analysisResult
          }
        })
      );
    } catch (dbError) {
      console.error('Error storing analysis result in DynamoDB:', dbError);
      // Continue even if DB storage fails
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(analysisResult)
    };
  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ error: 'Failed to analyze content' })
    };
  }
};