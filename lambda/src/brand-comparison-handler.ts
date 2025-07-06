import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BrandComparisonService } from './services/brand-comparison-service';
import { BrandComparisonStorageService } from './services/brand-comparison-storage';
import { BrandComparisonRequest, BrandComparisonResponse } from './types/brand-models';

/**
 * AWS Lambda handler for brand comparison functionality
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Brand comparison request received:', JSON.stringify(event, null, 2));

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Method not allowed. Use POST.' 
      })
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Request body is required' 
        })
      };
    }

    const requestData: BrandComparisonRequest = JSON.parse(event.body);
    
    // Validate required fields
    const validationError = validateRequest(requestData);
    if (validationError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: validationError 
        })
      };
    }

    const { brandA, brandB, industry } = requestData;

    // Initialize services
    const comparisonService = new BrandComparisonService();
    const storageService = new BrandComparisonStorageService();

    console.log(`Starting brand comparison: ${brandA} vs ${brandB} in ${industry}`);

    // Check if we have a recent comparison (within 24 hours)
    const hasRecentComparison = await storageService.hasRecentComparison(brandA, brandB, 24);
    
    if (hasRecentComparison) {
      console.log('Recent comparison found, retrieving from storage');
      const history = await storageService.getBrandComparisonHistory(brandA, brandB);
      
      if (history.length > 0) {
        const response: BrandComparisonResponse = {
          success: true,
          data: history[0] // Most recent comparison
        };
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(response)
        };
      }
    }

    // Perform GPT-4 analysis
    console.log('Performing new GPT-4 analysis');
    const gptResult = await comparisonService.compareBrands(brandA, brandB, industry);
    
    // Store the result in DynamoDB
    console.log('Storing comparison result in DynamoDB');
    const storedComparison = await storageService.storeBrandComparison(
      brandA, 
      brandB, 
      industry, 
      gptResult
    );

    // Return successful response
    const response: BrandComparisonResponse = {
      success: true,
      data: storedComparison
    };

    console.log('Brand comparison completed successfully');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error in brand comparison handler:', error);
    
    // Return error response
    const errorResponse: BrandComparisonResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(errorResponse)
    };
  }
};

/**
 * Validate the brand comparison request
 */
function validateRequest(request: any): string | null {
  if (!request) {
    return 'Request data is required';
  }

  if (!request.brandA || typeof request.brandA !== 'string') {
    return 'brandA is required and must be a string';
  }

  if (!request.brandB || typeof request.brandB !== 'string') {
    return 'brandB is required and must be a string';
  }

  if (!request.industry || typeof request.industry !== 'string') {
    return 'industry is required and must be a string';
  }

  // Validate brand names are not empty after trimming
  if (request.brandA.trim().length === 0) {
    return 'brandA cannot be empty';
  }

  if (request.brandB.trim().length === 0) {
    return 'brandB cannot be empty';
  }

  if (request.industry.trim().length === 0) {
    return 'industry cannot be empty';
  }

  // Validate brands are different
  if (request.brandA.toLowerCase().trim() === request.brandB.toLowerCase().trim()) {
    return 'brandA and brandB must be different brands';
  }

  // Validate string lengths
  if (request.brandA.length > 100) {
    return 'brandA must be 100 characters or less';
  }

  if (request.brandB.length > 100) {
    return 'brandB must be 100 characters or less';
  }

  if (request.industry.length > 100) {
    return 'industry must be 100 characters or less';
  }

  return null; // No validation errors
}

/**
 * Health check endpoint
 */
export const healthCheck = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      service: 'brand-comparison',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })
  };
}; 