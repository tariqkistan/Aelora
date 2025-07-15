/**
 * API client for interacting with the backend
 */

// Custom error classes for better error handling
export class ApiError extends Error {
  status?: number;
  code?: string;
  
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
    this.code = 'TIMEOUT';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
    this.code = 'NETWORK';
  }
}

export class AccessError extends ApiError {
  constructor(message: string) {
    super(message);
    this.name = 'AccessError';
    this.code = 'ACCESS_DENIED';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION';
  }
}

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
  retryDelay: 2000,
  
  // Enable detailed logging
  debug: process.env.NODE_ENV !== 'production'
};

/**
 * Logger utility that respects debug setting
 */
const logger = {
  log: (message: string, ...args: any[]) => {
    if (CONFIG.debug) console.log(`[API Client] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    if (CONFIG.debug) console.error(`[API Client] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    if (CONFIG.debug) console.warn(`[API Client] ${message}`, ...args);
  }
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
 * Determine if an error is retryable
 */
function isRetryableError(error: Error): boolean {
  // Don't retry for certain types of errors
  if (
    error instanceof NetworkError || 
    error instanceof AccessError ||
    error instanceof ValidationError ||
    error.message.includes('not found') ||
    error.message.includes('not accessible')
  ) {
    return false;
  }
  
  // Retry server errors, timeouts, and unknown errors
  return true;
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
  return Math.min(
    CONFIG.retryDelay * Math.pow(1.5, attempt - 1) + Math.random() * 1000,
    10000 // Max 10 seconds
  );
}

/**
 * Analyze a URL for AI visibility optimization
 */
export async function analyzeUrl(url: string): Promise<any> {
  if (!url) {
    throw new ValidationError('URL is required');
  }
  
  try {
    // Basic URL validation
    new URL(url);
  } catch (e) {
    throw new ValidationError('Invalid URL format. Please provide a valid HTTP or HTTPS URL.');
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= CONFIG.maxRetries + 1; attempt++) {
    try {
      logger.log(`Analyzing URL (attempt ${attempt}/${CONFIG.maxRetries + 1}): ${url}`);
      
      // Determine the endpoint based on configuration
      const apiBaseUrl = getApiBaseUrl();
      const endpoint = `${apiBaseUrl}/analyze?url=${encodeURIComponent(url)}`;
      
      logger.log(`Using endpoint: ${endpoint}`);
      
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        logger.warn(`Request timeout after ${CONFIG.timeoutMs / 1000} seconds`);
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
          logger.error(`API error (${response.status}):`, errorData);
          
          // Handle specific HTTP errors
          if (response.status === 400) {
            throw new ValidationError(errorData.error || 'Invalid request parameters');
          } else if (response.status === 401 || response.status === 403) {
            throw new AccessError('Authentication or authorization failed. Please check your credentials.');
          } else if (response.status === 404) {
            throw new AccessError('Website not found or not accessible. Please check the URL and try again.');
          } else if (response.status === 429) {
            throw new ApiError('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT');
          } else if (response.status >= 500) {
            throw new ApiError('Server error occurred. Please try again in a few moments.', response.status);
          }
          
          throw new ApiError(errorData.error || `API error: ${response.status} ${response.statusText}`, response.status);
        }
        
        const data = await response.json();
        logger.log('Analysis completed successfully');
        return data;
        
      } catch (fetchError) {
        // Clear the timeout to prevent memory leaks
        clearTimeout(timeoutId);
        
        // Handle timeout specifically
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new TimeoutError(`Analysis timed out after ${CONFIG.timeoutMs / 1000} seconds. This could be because:
• The website is very large or slow to respond
• The website has complex content that takes time to analyze
• Our servers are experiencing high load

Try again with a simpler page or contact support if the issue persists.`);
        }
        
        // Handle network errors
        if (fetchError instanceof Error && (
          fetchError.message.includes('Failed to fetch') ||
          fetchError.message.includes('Network error') ||
          fetchError.message.includes('ERR_NETWORK')
        )) {
          throw new NetworkError('Network connection failed. Please check your internet connection and try again.');
        }
        
        throw fetchError;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      logger.error(`Attempt ${attempt} failed:`, lastError.message);
      
      // Check if we should retry
      if (!isRetryableError(lastError) || attempt > CONFIG.maxRetries) {
        break;
      }
      
      // Calculate backoff delay
      const delay = getRetryDelay(attempt);
      logger.log(`Retrying in ${delay / 1000} seconds...`);
      await sleep(delay);
    }
  }
  
  // If we get here, all attempts failed
  logger.error('All retry attempts failed. Final error:', lastError);
  throw lastError || new Error('Analysis failed after multiple attempts');
}

/**
 * Configure the API client
 */
export function configureApiClient(options: Partial<typeof CONFIG>): void {
  Object.assign(CONFIG, options);
  logger.log('API client configured:', { 
    useDirectApi: CONFIG.useDirectApi,
    apiBaseUrl: getApiBaseUrl(),
    timeoutMs: CONFIG.timeoutMs,
    maxRetries: CONFIG.maxRetries,
    debug: CONFIG.debug
  });
} 