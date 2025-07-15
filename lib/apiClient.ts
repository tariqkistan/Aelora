/**
 * API client for interacting with the backend
 */

// Configuration options - can be changed based on environment
const CONFIG = {
  // Use direct AWS API Gateway or Next.js proxy
  useDirectApi: false,
  
  // API endpoints
  nextJsApiUrl: '/api',
  awsApiUrl: process.env.NEXT_PUBLIC_AWS_API_URL || 'https://fcfz0pijd5.execute-api.us-east-1.amazonaws.com/prod',
  
  // Timeout for API calls - increased to 45 seconds to handle large websites
  timeoutMs: 45000,
  
  // Retry configuration
  maxRetries: 2,
  retryDelay: 2000
};

/**
 * Get the appropriate API base URL based on configuration
 */
function getApiBaseUrl(): string {
  return CONFIG.useDirectApi ? CONFIG.awsApiUrl : CONFIG.nextJsApiUrl;
}

/**
 * Sleep function for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Analyze a URL for AI visibility optimization
 */
export async function analyzeUrl(url: string): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      console.log(`Analyzing URL (attempt ${attempt}/${CONFIG.maxRetries}): ${url}`);
      
      // Determine the endpoint based on configuration
      const apiBaseUrl = getApiBaseUrl();
      const endpoint = `${apiBaseUrl}/analyze?url=${encodeURIComponent(url)}`;
      
      console.log(`Using endpoint: ${endpoint}`);
      
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`Request timeout after ${CONFIG.timeoutMs / 1000} seconds`);
        controller.abort();
      }, CONFIG.timeoutMs);
      
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
          
          // Handle specific HTTP errors
          if (response.status === 404) {
            throw new Error('Website not found or not accessible. Please check the URL and try again.');
          } else if (response.status === 500) {
            throw new Error('Server error occurred. Please try again in a few moments.');
          } else if (response.status === 503) {
            throw new Error('Service temporarily unavailable. Please try again later.');
          }
          
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
          const timeoutError = new Error(`Analysis timed out after ${CONFIG.timeoutMs / 1000} seconds. This could be because:
• The website is very large or slow to respond
• The website has complex content that takes time to analyze
• Our servers are experiencing high load

Try again with a simpler page or contact support if the issue persists.`);
          timeoutError.name = 'TimeoutError';
          throw timeoutError;
        }
        
        // Handle network errors
        if (fetchError instanceof Error && (
          fetchError.message.includes('Failed to fetch') ||
          fetchError.message.includes('Network error') ||
          fetchError.message.includes('ERR_NETWORK')
        )) {
          const networkError = new Error('Network connection failed. Please check your internet connection and try again.');
          networkError.name = 'NetworkError';
          throw networkError;
        }
        
        throw fetchError;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error(`Attempt ${attempt} failed:`, lastError.message);
      
      // Don't retry for certain types of errors
      if (lastError.name === 'NetworkError' || 
          lastError.message.includes('not found') ||
          lastError.message.includes('not accessible')) {
        break;
      }
      
      // If this isn't the last attempt, wait before retrying
      if (attempt < CONFIG.maxRetries) {
        console.log(`Retrying in ${CONFIG.retryDelay / 1000} seconds...`);
        await sleep(CONFIG.retryDelay);
      }
    }
  }
  
  // If we get here, all attempts failed
  console.error('All retry attempts failed. Final error:', lastError);
  throw lastError || new Error('Analysis failed after multiple attempts');
}

/**
 * Configure the API client
 */
export function configureApiClient(options: Partial<typeof CONFIG>): void {
  Object.assign(CONFIG, options);
  console.log('API client configured:', { 
    useDirectApi: CONFIG.useDirectApi,
    apiBaseUrl: getApiBaseUrl(),
    timeoutMs: CONFIG.timeoutMs,
    maxRetries: CONFIG.maxRetries
  });
} 