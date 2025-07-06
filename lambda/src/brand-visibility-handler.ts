import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BrandAnalysisService } from './services/brand-analysis-service';
import { BrandStorageService } from './services/brand-storage-service';
import { 
  BrandVisibilityRequest, 
  BrandVisibilityResponse, 
  BrandVisibilitySnapshot 
} from './types/brand-models';

/**
 * AWS Lambda Handler for Brand Visibility Analysis
 * 
 * Endpoint: POST /brand-visibility
 * Body: { brandName: string, domain: string, industry: string }
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Brand visibility analysis request received:', JSON.stringify(event));
  
  try {
    // Validate request method
    if (event.httpMethod !== 'POST') {
      return createErrorResponse(405, 'Method not allowed. Use POST.');
    }

    // Parse and validate request body
    const requestData = parseRequestBody(event.body);
    if (!requestData) {
      return createErrorResponse(400, 'Invalid request body. Expected JSON with brandName, domain, and industry.');
    }

    const { brandName, domain, industry } = requestData;

    // Validate required fields
    if (!brandName || !domain || !industry) {
      return createErrorResponse(400, 'Missing required fields: brandName, domain, industry');
    }

    console.log(`Processing brand visibility analysis for: ${brandName}`);

    // Initialize services
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY environment variable not set');
      return createErrorResponse(500, 'OpenAI API key not configured');
    }

    const analysisService = new BrandAnalysisService(openaiApiKey);
    const storageService = new BrandStorageService(process.env.AWS_REGION);

    // Perform brand analysis
    console.log('Starting brand visibility analysis...');
    const startTime = Date.now();
    
    const analysis = await analysisService.analyzeBrandVisibility(brandName, domain, industry);
    
    const analysisTime = Date.now() - startTime;
    console.log(`Brand analysis completed in ${analysisTime}ms`);

    // Create visibility snapshot
    const snapshot = storageService.createVisibilitySnapshot(
      brandName,
      domain,
      industry,
      analysis,
      '1.0'
    );

    // Save to DynamoDB
    console.log('Saving brand visibility snapshot to DynamoDB...');
    await storageService.saveBrandVisibilitySnapshot(snapshot);

    // Create or update brand profile
    const existingProfile = await storageService.getBrandProfile(brandName);
    if (!existingProfile) {
      console.log('Creating new brand profile...');
      const newProfile = storageService.createBrandProfile(brandName, domain, industry);
      await storageService.saveBrandProfile(newProfile);
    } else {
      console.log('Brand profile already exists, updating timestamp...');
      existingProfile.updatedAt = new Date().toISOString();
      await storageService.saveBrandProfile(existingProfile);
    }

    // Create success response
    const response: BrandVisibilityResponse = {
      success: true,
      data: snapshot
    };

    console.log('Brand visibility analysis completed successfully');

    return {
      statusCode: 200,
      headers: createCorsHeaders(),
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error in brand visibility analysis:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return createErrorResponse(500, `Brand analysis failed: ${errorMessage}`);
  }
};

/**
 * Parse and validate request body
 */
function parseRequestBody(body: string | null): BrandVisibilityRequest | null {
  if (!body) {
    return null;
  }

  try {
    const parsed = JSON.parse(body);
    
    // Basic validation
    if (typeof parsed.brandName === 'string' && 
        typeof parsed.domain === 'string' && 
        typeof parsed.industry === 'string') {
      return {
        brandName: parsed.brandName.trim(),
        domain: parsed.domain.trim(),
        industry: parsed.industry.trim()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing request body:', error);
    return null;
  }
}

/**
 * Create error response
 */
function createErrorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  const response: BrandVisibilityResponse = {
    success: false,
    error: message
  };

  return {
    statusCode,
    headers: createCorsHeaders(),
    body: JSON.stringify(response)
  };
}

/**
 * Create CORS headers for API responses
 */
function createCorsHeaders(): { [key: string]: string | boolean } {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Credentials': true,
  };
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export const optionsHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: createCorsHeaders(),
    body: ''
  };
}; 