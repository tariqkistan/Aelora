/**
 * GPT-4 Response Parser Utility
 * 
 * Extracts and parses JSON blocks from GPT-4 responses that may contain
 * mixed content (explanations, markdown, etc.)
 */

export interface ParseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  originalResponse?: string;
}

export interface ParserOptions {
  logErrors?: boolean;
  returnOriginalOnFailure?: boolean;
  strictMode?: boolean;
}

/**
 * Extracts the first complete JSON block from a GPT-4 response
 * @param response - Raw GPT-4 response string
 * @param options - Parser configuration options
 * @returns Parsed JSON object or error information
 */
export function extractJSONFromGPTResponse<T = any>(
  response: string,
  options: ParserOptions = {}
): ParseResult<T> {
  const {
    logErrors = true,
    returnOriginalOnFailure = false,
    strictMode = false
  } = options;

  // Early return for empty/invalid input
  if (!response || typeof response !== 'string') {
    const error = 'Invalid input: response must be a non-empty string';
    if (logErrors) {
      console.error('[GPT Parser Error]', error);
    }
    return {
      success: false,
      error,
      originalResponse: response
    };
  }

  try {
    // Clean the response
    const cleanedResponse = response.trim();
    
    // Strategy 1: Try parsing the entire response as JSON first
    if (cleanedResponse.startsWith('{') || cleanedResponse.startsWith('[')) {
      try {
        const parsed = JSON.parse(cleanedResponse);
        return {
          success: true,
          data: parsed,
          originalResponse: response
        };
      } catch {
        // Continue to other strategies if direct parsing fails
      }
    }

    // Strategy 2: Extract JSON using regex patterns
    const jsonExtractionResults = [
      // Pattern 1: JSON blocks wrapped in code fences
      extractWithPattern(cleanedResponse, /```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/gi),
      
      // Pattern 2: JSON blocks wrapped in backticks
      extractWithPattern(cleanedResponse, /`(\{[\s\S]*?\}|\[[\s\S]*?\])`/gi),
      
      // Pattern 3: Standalone JSON objects/arrays
      extractWithPattern(cleanedResponse, /(\{[\s\S]*?\}|\[[\s\S]*?\])/g),
      
      // Pattern 4: JSON after common prefixes
      extractWithPattern(cleanedResponse, /(?:json|result|output|response):\s*(\{[\s\S]*?\}|\[[\s\S]*?\])/gi)
    ];

    // Try each extraction result
    for (const extractedJson of jsonExtractionResults) {
      if (extractedJson) {
        try {
          const parsed = JSON.parse(extractedJson);
          return {
            success: true,
            data: parsed,
            originalResponse: response
          };
        } catch (parseError) {
          // Continue to next extraction if parsing fails
          if (logErrors && strictMode) {
            console.warn('[GPT Parser Warning] Failed to parse extracted JSON:', extractedJson);
          }
        }
      }
    }

    // Strategy 3: Try to find and fix common JSON issues
    const fixedJson = attemptJSONFix(cleanedResponse);
    if (fixedJson) {
      try {
        const parsed = JSON.parse(fixedJson);
        return {
          success: true,
          data: parsed,
          originalResponse: response
        };
      } catch {
        // Continue to failure handling
      }
    }

    // All strategies failed
    const error = 'No valid JSON block found in response';
    if (logErrors) {
      console.error('[GPT Parser Error]', error);
      console.error('[GPT Parser Debug] Original response:', response);
    }

    return {
      success: false,
      error,
      originalResponse: returnOriginalOnFailure ? response : undefined
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
    if (logErrors) {
      console.error('[GPT Parser Error] Unexpected error:', errorMessage);
      console.error('[GPT Parser Debug] Original response:', response);
    }

    return {
      success: false,
      error: errorMessage,
      originalResponse: returnOriginalOnFailure ? response : undefined
    };
  }
}

/**
 * Extract JSON using a specific regex pattern
 */
function extractWithPattern(text: string, pattern: RegExp): string | null {
  const matches = text.match(pattern);
  if (!matches || matches.length === 0) {
    return null;
  }

  // For patterns with capture groups, use the captured content
  for (const match of matches) {
    const regexResult = pattern.exec(text);
    if (regexResult && regexResult[1]) {
      return regexResult[1].trim();
    }
    
    // Reset regex for next iteration
    pattern.lastIndex = 0;
    
    // For patterns without capture groups, use the full match
    const cleaned = match.replace(/```(?:json)?/gi, '').replace(/`/g, '').trim();
    if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
      return cleaned;
    }
  }

  return null;
}

/**
 * Attempt to fix common JSON formatting issues
 */
function attemptJSONFix(text: string): string | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Find the first { or [ and last } or ]
  const firstBraceIndex = Math.min(
    text.indexOf('{') >= 0 ? text.indexOf('{') : Infinity,
    text.indexOf('[') >= 0 ? text.indexOf('[') : Infinity
  );
  
  if (firstBraceIndex === Infinity) {
    return null;
  }

  const lastBraceIndex = Math.max(
    text.lastIndexOf('}'),
    text.lastIndexOf(']')
  );

  if (lastBraceIndex === -1 || lastBraceIndex <= firstBraceIndex) {
    return null;
  }

  // Extract the content between braces
  let cleaned = text.substring(firstBraceIndex, lastBraceIndex + 1).trim();

  if (!cleaned) {
    return null;
  }

  // Fix common issues
  cleaned = cleaned
    .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
    .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
    .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Validate that it looks like JSON
  if ((cleaned.startsWith('{') && cleaned.endsWith('}')) || 
      (cleaned.startsWith('[') && cleaned.endsWith(']'))) {
    return cleaned;
  }

  return null;
}

/**
 * Convenience function for extracting arrays specifically
 */
export function extractArrayFromGPTResponse<T = any>(
  response: string,
  options: ParserOptions = {}
): ParseResult<T[]> {
  const result = extractJSONFromGPTResponse<T[]>(response, options);
  
  if (result.success && result.data && !Array.isArray(result.data)) {
    return {
      success: false,
      error: 'Extracted JSON is not an array',
      originalResponse: result.originalResponse
    };
  }
  
  return result;
}

/**
 * Convenience function for extracting objects specifically
 */
export function extractObjectFromGPTResponse<T = any>(
  response: string,
  options: ParserOptions = {}
): ParseResult<T> {
  const result = extractJSONFromGPTResponse<T>(response, options);
  
  if (result.success && result.data && Array.isArray(result.data)) {
    return {
      success: false,
      error: 'Extracted JSON is not an object',
      originalResponse: result.originalResponse
    };
  }
  
  return result;
}

/**
 * Batch process multiple GPT responses
 */
export function extractJSONFromMultipleResponses<T = any>(
  responses: string[],
  options: ParserOptions = {}
): ParseResult<T>[] {
  return responses.map(response => extractJSONFromGPTResponse<T>(response, options));
}

/**
 * Validate that extracted JSON matches expected schema
 */
export function extractAndValidateJSON<T = any>(
  response: string,
  validator: (data: any) => data is T,
  options: ParserOptions = {}
): ParseResult<T> {
  const result = extractJSONFromGPTResponse(response, options);
  
  if (!result.success || !result.data) {
    return result;
  }
  
  if (!validator(result.data)) {
    return {
      success: false,
      error: 'Extracted JSON does not match expected schema',
      originalResponse: result.originalResponse
    };
  }
  
  return result as ParseResult<T>;
}

// Type guards for common validation scenarios
export const typeGuards = {
  isStringArray: (data: any): data is string[] => 
    Array.isArray(data) && data.every(item => typeof item === 'string'),
  
  isNumberArray: (data: any): data is number[] => 
    Array.isArray(data) && data.every(item => typeof item === 'number'),
  
  isObjectArray: (data: any): data is object[] => 
    Array.isArray(data) && data.every(item => typeof item === 'object' && item !== null),
  
  hasRequiredKeys: (keys: string[]) => (data: any): data is Record<string, any> => 
    typeof data === 'object' && data !== null && keys.every(key => key in data)
};

// Export default for convenience
export default extractJSONFromGPTResponse; 