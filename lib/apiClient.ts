/**
 * API client for interacting with the backend
 */

// Configuration options - can be changed based on environment
const CONFIG = {
  // Use direct AWS API Gateway or Next.js proxy
  useDirectApi: false,
  
  // API endpoints
  nextJsApiUrl: '/api',
  awsApiUrl: process.env.NEXT_PUBLIC_AWS_API_URL || 'https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/prod',
  
  // Timeout for API calls
  timeoutMs: 30000 // 30 seconds timeout for API calls
};

/**
 * Get the appropriate API base URL based on configuration
 */
function getApiBaseUrl(): string {
  return CONFIG.useDirectApi ? CONFIG.awsApiUrl : CONFIG.nextJsApiUrl;
}

/**
 * Analyze a URL for AI visibility optimization
 */
export async function analyzeUrl(url: string): Promise<any> {
  try {
    console.log(`Analyzing URL: ${url}`);
    
    // Determine the endpoint based on configuration
    const apiBaseUrl = getApiBaseUrl();
    const endpoint = `${apiBaseUrl}/analyze?url=${encodeURIComponent(url)}`;
    
    console.log(`Using endpoint: ${endpoint}`);
    
    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    
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
        console.error('API request timed out after', CONFIG.timeoutMs / 1000, 'seconds');
        throw new Error(`Analysis timed out after ${CONFIG.timeoutMs / 1000} seconds. The website might be too large or our servers are busy.`);
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error analyzing URL:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred during analysis');
  }
}

/**
 * Configure the API client
 */
export function configureApiClient(options: Partial<typeof CONFIG>): void {
  Object.assign(CONFIG, options);
  console.log('API client configured:', { 
    useDirectApi: CONFIG.useDirectApi,
    apiBaseUrl: getApiBaseUrl()
  });
} 