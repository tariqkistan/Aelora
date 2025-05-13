/**
 * API client for interacting with the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Analyze a URL for AI visibility optimization
 */
export async function analyzeUrl(url: string): Promise<any> {
  try {
    // In development, use the local API
    // In production, this will use the AWS API Gateway endpoint
    const endpoint = process.env.NODE_ENV === 'production' 
      ? `${API_URL}/analyze?url=${encodeURIComponent(url)}`
      : `/api/analyze?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze URL');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing URL:', error);
    throw error;
  }
} 