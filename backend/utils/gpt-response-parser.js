/**
 * GPT-4 Response Parser Utility (JavaScript)
 * 
 * Extracts and parses JSON blocks from GPT-4 responses that may contain
 * mixed content (explanations, markdown, etc.)
 */

/**
 * Extracts the first complete JSON block from a GPT-4 response
 * @param {string} response - Raw GPT-4 response string
 * @param {Object} options - Parser configuration options
 * @returns {Object} Parsed JSON object or error information
 */
function extractJSONFromGPTResponse(response, options = {}) {
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
      
      // Pattern 3: Standalone JSON objects/arrays (more specific)
      extractWithPattern(cleanedResponse, /(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\])/g),
      
      // Pattern 4: JSON after common prefixes
      extractWithPattern(cleanedResponse, /(?:json|result|output|response):\s*(\{[\s\S]*?\}|\[[\s\S]*?\])/gi),
      
      // Pattern 5: Broader JSON extraction
      extractWithPattern(cleanedResponse, /(\{[\s\S]*?\}|\[[\s\S]*?\])/g)
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
          // Try to fix the extracted JSON
          const fixedJson = attemptJSONFix(extractedJson);
          if (fixedJson) {
            try {
              const parsed = JSON.parse(fixedJson);
              return {
                success: true,
                data: parsed,
                originalResponse: response
              };
            } catch {
              // Continue to next extraction if fixing fails
            }
          }
          
          // Continue to next extraction if parsing fails
          if (logErrors && strictMode) {
            console.warn('[GPT Parser Warning] Failed to parse extracted JSON:', extractedJson);
          }
        }
      }
    }

    // Strategy 3: Try to find and fix common JSON issues on the whole response
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
 * @param {string} text - Text to search in
 * @param {RegExp} pattern - Regex pattern to use
 * @returns {string|null} Extracted JSON string or null
 */
function extractWithPattern(text, pattern) {
  const matches = [...text.matchAll(pattern)];
  if (!matches || matches.length === 0) {
    return null;
  }

  // For patterns with capture groups, use the captured content
  for (const match of matches) {
    if (match[1]) {
      return match[1].trim();
    }
    
    // For patterns without capture groups, use the full match
    const cleaned = match[0].replace(/```(?:json)?/gi, '').replace(/`/g, '').trim();
    if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
      return cleaned;
    }
  }

  return null;
}

/**
 * Attempt to fix common JSON formatting issues
 * @param {string} text - Text to fix
 * @returns {string|null} Fixed JSON string or null
 */
function attemptJSONFix(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Remove common prefixes and suffixes
  let cleaned = text
    .replace(/^.*?(?=\{|\[)/s, '') // Remove everything before first { or [
    .replace(/(?<=\}|\]).*$/s, '') // Remove everything after last } or ]
    .trim();

  if (!cleaned) {
    return null;
  }

  // Apply multiple fixing strategies
  const fixingStrategies = [
    // Strategy 1: Basic cleanup
    (str) => str
      .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
      .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim(),
    
    // Strategy 2: More aggressive key quoting
    (str) => str
      .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Quote unquoted keys (more specific)
      .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
      .replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([,}\]])/g, ': "$1"$2') // Quote unquoted string values
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim(),
    
    // Strategy 3: Handle specific malformed patterns
    (str) => str
      .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Quote keys
      .replace(/:\s*'([^']*)'/g, ': "$1"') // Single to double quotes
      .replace(/:\s*([a-zA-Z][a-zA-Z0-9\s]*?)(?=\s*[,}\]])/g, ': "$1"') // Quote unquoted values
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  ];

  // Try each fixing strategy
  for (const strategy of fixingStrategies) {
    try {
      const fixed = strategy(cleaned);
      
      // Validate that it looks like JSON
      if ((fixed.startsWith('{') && fixed.endsWith('}')) || 
          (fixed.startsWith('[') && fixed.endsWith(']'))) {
        
        // Try to parse it to validate
        JSON.parse(fixed);
        return fixed;
      }
    } catch {
      // Continue to next strategy if this one fails
    }
  }

  return null;
}

/**
 * Convenience function for extracting arrays specifically
 * @param {string} response - GPT response
 * @param {Object} options - Parser options
 * @returns {Object} Parse result
 */
function extractArrayFromGPTResponse(response, options = {}) {
  const result = extractJSONFromGPTResponse(response, options);
  
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
 * @param {string} response - GPT response
 * @param {Object} options - Parser options
 * @returns {Object} Parse result
 */
function extractObjectFromGPTResponse(response, options = {}) {
  const result = extractJSONFromGPTResponse(response, options);
  
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
 * @param {string[]} responses - Array of GPT responses
 * @param {Object} options - Parser options
 * @returns {Object[]} Array of parse results
 */
function extractJSONFromMultipleResponses(responses, options = {}) {
  return responses.map(response => extractJSONFromGPTResponse(response, options));
}

/**
 * Validate that extracted JSON matches expected schema
 * @param {string} response - GPT response
 * @param {Function} validator - Validation function
 * @param {Object} options - Parser options
 * @returns {Object} Parse result
 */
function extractAndValidateJSON(response, validator, options = {}) {
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
  
  return result;
}

// Type guards for common validation scenarios
const typeGuards = {
  isStringArray: (data) => 
    Array.isArray(data) && data.every(item => typeof item === 'string'),
  
  isNumberArray: (data) => 
    Array.isArray(data) && data.every(item => typeof item === 'number'),
  
  isObjectArray: (data) => 
    Array.isArray(data) && data.every(item => typeof item === 'object' && item !== null),
  
  hasRequiredKeys: (keys) => (data) => 
    typeof data === 'object' && data !== null && keys.every(key => key in data)
};

// Usage examples
const examples = {
  // Basic usage
  basic: `
const response = "Here are the questions: ['Q1', 'Q2', 'Q3']";
const result = extractJSONFromGPTResponse(response);

if (result.success) {
  console.log('Extracted:', result.data);
} else {
  console.log('Error:', result.error);
}`,

  // With options
  withOptions: `
const result = extractJSONFromGPTResponse(response, {
  logErrors: false,
  returnOriginalOnFailure: true,
  strictMode: true
});`,

  // Array-specific extraction
  arrayExtraction: `
const arrayResult = extractArrayFromGPTResponse(response);
if (arrayResult.success) {
  console.log('Array length:', arrayResult.data.length);
}`,

  // With validation
  withValidation: `
const validatedResult = extractAndValidateJSON(
  response,
  typeGuards.isStringArray
);`,

  // Integration with trending questions
  trendingQuestions: `
// Use with trending questions prompt
const gptResponse = \`Here are 5 questions about Apple:
[
  "Is Apple reliable for business?",
  "How does Apple compare to Samsung?",
  "What are Apple's main advantages?",
  "Are there issues with Apple products?",
  "Should I choose Apple or alternatives?"
]\`;

const result = extractArrayFromGPTResponse(gptResponse);
if (result.success) {
  console.log('Trending questions:', result.data);
}`
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractJSONFromGPTResponse,
    extractArrayFromGPTResponse,
    extractObjectFromGPTResponse,
    extractJSONFromMultipleResponses,
    extractAndValidateJSON,
    typeGuards,
    examples
  };
}

// Export for browsers
if (typeof window !== 'undefined') {
  window.GPTResponseParser = {
    extractJSONFromGPTResponse,
    extractArrayFromGPTResponse,
    extractObjectFromGPTResponse,
    extractJSONFromMultipleResponses,
    extractAndValidateJSON,
    typeGuards,
    examples
  };
} 