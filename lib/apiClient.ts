/**
 * API client for interacting with the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fcfz0pijd5.execute-api.us-east-1.amazonaws.com/prod';
const API_TIMEOUT = 30000; // 30 seconds timeout for API calls

/**
 * Analyze a URL for AI visibility optimization
 */
export async function analyzeUrl(url: string): Promise<any> {
  try {
    console.log(`Analyzing URL: ${url}`);
    
    // Determine the endpoint based on environment
    const isLocalhost = API_URL.includes('localhost');
    const endpoint = isLocalhost 
      ? `${API_URL}/analyze?url=${encodeURIComponent(url)}`
      : `${API_URL}/analyze?url=${encodeURIComponent(url)}`;
    
    console.log(`Using endpoint: ${endpoint}`);
    
    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    // Make the API call with timeout
    try {
      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error(`API error (${response.status}):`, errorData);
        throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Analysis completed successfully');
      return data;
    } catch (fetchError) {
      // Clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
      // Handle timeout specifically
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('API request timed out after', API_TIMEOUT / 1000, 'seconds');
        throw new Error(`Analysis timed out after ${API_TIMEOUT / 1000} seconds. The website might be too large or our servers are busy.`);
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error analyzing URL:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred during analysis');
  }
} 