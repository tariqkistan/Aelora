# GPT-4 Response Parser Utility

A robust TypeScript/JavaScript utility for extracting and parsing JSON blocks from GPT-4 responses that may contain mixed content (explanations, markdown, code fences, etc.).

## 🎯 Purpose

Sometimes GPT-4 returns responses with explanations around the JSON data:

```
Here are 5 trending questions about Apple:

[
  "Is Apple reliable for business use?",
  "How does Apple compare to Samsung?",
  "What are the main advantages of Apple?"
]

These questions reflect common user concerns about the brand.
```

This utility extracts the JSON block and parses it into a JavaScript object, handling various edge cases and malformed JSON.

## 📁 Files

- **`gpt-response-parser.ts`** - TypeScript implementation with full type safety
- **`gpt-response-parser.js`** - JavaScript implementation for broader compatibility
- **`test-gpt-parser.ts`** - Comprehensive TypeScript test suite
- **`test-gpt-parser.js`** - JavaScript test runner

## 🚀 Quick Start

### TypeScript Usage

```typescript
import { extractJSONFromGPTResponse } from './gpt-response-parser';

const gptResponse = `Here are the questions: ["Q1", "Q2", "Q3"]`;
const result = extractJSONFromGPTResponse<string[]>(gptResponse);

if (result.success) {
  console.log('Extracted questions:', result.data);
} else {
  console.log('Error:', result.error);
}
```

### JavaScript Usage

```javascript
const { extractJSONFromGPTResponse } = require('./gpt-response-parser');

const gptResponse = `Here are the questions: ["Q1", "Q2", "Q3"]`;
const result = extractJSONFromGPTResponse(gptResponse);

if (result.success) {
  console.log('Extracted questions:', result.data);
} else {
  console.log('Error:', result.error);
}
```

## 🔧 API Reference

### Main Functions

#### `extractJSONFromGPTResponse<T>(response: string, options?: ParserOptions): ParseResult<T>`

Extracts the first complete JSON block from a GPT-4 response.

**Parameters:**
- `response` - Raw GPT-4 response string
- `options` - Optional configuration object

**Returns:** `ParseResult<T>` object with success/error information

#### `extractArrayFromGPTResponse<T>(response: string, options?: ParserOptions): ParseResult<T[]>`

Extracts JSON and validates it's an array.

#### `extractObjectFromGPTResponse<T>(response: string, options?: ParserOptions): ParseResult<T>`

Extracts JSON and validates it's an object (not an array).

#### `extractAndValidateJSON<T>(response: string, validator: (data: any) => data is T, options?: ParserOptions): ParseResult<T>`

Extracts JSON and validates it against a custom type guard.

### Configuration Options

```typescript
interface ParserOptions {
  logErrors?: boolean;           // Default: true
  returnOriginalOnFailure?: boolean; // Default: false
  strictMode?: boolean;          // Default: false
}
```

### Response Format

```typescript
interface ParseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  originalResponse?: string;
}
```

## 🎨 Extraction Strategies

The parser uses multiple strategies to extract JSON:

### 1. Direct Parsing
Tries to parse the entire response as JSON first.

### 2. Regex Patterns
- **Code Fences**: `\`\`\`json ... \`\`\``
- **Backticks**: `\`{...}\``
- **Standalone Objects**: `{...}` or `[...]`
- **Prefixed JSON**: `result: {...}`

### 3. Auto-Fix Common Issues
- Removes trailing commas
- Quotes unquoted keys
- Converts single quotes to double quotes
- Normalizes whitespace

## 📋 Supported Input Formats

### Perfect JSON
```javascript
const response = `["Question 1", "Question 2", "Question 3"]`;
// ✅ Extracts: ["Question 1", "Question 2", "Question 3"]
```

### JSON with Explanation
```javascript
const response = `Here are the questions:
["Question 1", "Question 2", "Question 3"]
These are trending questions.`;
// ✅ Extracts: ["Question 1", "Question 2", "Question 3"]
```

### Code Fence Format
```javascript
const response = `\`\`\`json
{
  "questions": ["Q1", "Q2", "Q3"],
  "brand": "Apple"
}
\`\`\``;
// ✅ Extracts: { questions: ["Q1", "Q2", "Q3"], brand: "Apple" }
```

### Malformed JSON (Auto-Fix)
```javascript
const response = `{
  brand: "Apple",
  questions: [
    'Question 1',
    'Question 2',
  ]
}`;
// ✅ Auto-fixes and extracts: { brand: "Apple", questions: ["Question 1", "Question 2"] }
```

## 🔍 Type Guards

Built-in type guards for common validation scenarios:

```typescript
import { typeGuards } from './gpt-response-parser';

// Validate string array
const result = extractAndValidateJSON(response, typeGuards.isStringArray);

// Validate number array
const result = extractAndValidateJSON(response, typeGuards.isNumberArray);

// Validate object array
const result = extractAndValidateJSON(response, typeGuards.isObjectArray);

// Validate required keys
const result = extractAndValidateJSON(
  response, 
  typeGuards.hasRequiredKeys(['questions', 'brand'])
);
```

## 🧪 Testing

### Run Tests

```bash
# TypeScript tests
cd backend/utils
npx ts-node test-gpt-parser.ts

# JavaScript tests
cd backend/utils
node test-gpt-parser.js
```

### Test Coverage

The test suite covers:
- ✅ Perfect JSON responses
- ✅ JSON with explanatory text
- ✅ JSON in code fences
- ✅ JSON with markdown formatting
- ✅ Multiple JSON blocks (extracts first)
- ✅ Malformed JSON auto-fixing
- ✅ Array-specific extraction
- ✅ Object-specific extraction
- ✅ Type validation
- ✅ Error handling options
- ✅ No JSON content (proper failure)
- ✅ Large JSON responses
- ✅ Custom schema validation

## 🔗 Integration Examples

### With Trending Questions Prompt

```javascript
const { extractArrayFromGPTResponse } = require('./gpt-response-parser');
const { TrendingQuestionsPrompt } = require('../prompts/trending-questions-prompt');

async function getTrendingQuestions(brand, industry) {
  const prompt = TrendingQuestionsPrompt.generateSimple(brand, industry);
  
  // Call GPT-4 API
  const gptResponse = await callGPT4(prompt);
  
  // Extract questions array
  const result = extractArrayFromGPTResponse(gptResponse);
  
  if (result.success) {
    return result.data; // Array of questions
  } else {
    throw new Error(`Failed to extract questions: ${result.error}`);
  }
}
```

### Next.js API Route

```javascript
// pages/api/extract-json.js
import { extractJSONFromGPTResponse } from '../../backend/utils/gpt-response-parser';

export default async function handler(req, res) {
  const { gptResponse } = req.body;
  
  const result = extractJSONFromGPTResponse(gptResponse, {
    logErrors: false // Don't log errors in production
  });
  
  if (result.success) {
    res.json({ success: true, data: result.data });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
}
```

### Lambda Function Integration

```javascript
// AWS Lambda function
const { extractJSONFromGPTResponse } = require('./gpt-response-parser');

exports.handler = async (event) => {
  const { gptResponse } = JSON.parse(event.body);
  
  const result = extractJSONFromGPTResponse(gptResponse);
  
  return {
    statusCode: result.success ? 200 : 400,
    body: JSON.stringify(result)
  };
};
```

### Batch Processing

```javascript
const { extractJSONFromMultipleResponses } = require('./gpt-response-parser');

const responses = [
  "Questions: ['Q1', 'Q2']",
  "Result: {'brand': 'Apple'}",
  "Data: [1, 2, 3]"
];

const results = extractJSONFromMultipleResponses(responses);
results.forEach((result, index) => {
  if (result.success) {
    console.log(`Response ${index + 1}:`, result.data);
  } else {
    console.log(`Response ${index + 1} failed:`, result.error);
  }
});
```

## 🛠️ Error Handling

### Graceful Degradation

```javascript
const result = extractJSONFromGPTResponse(response, {
  logErrors: false,
  returnOriginalOnFailure: true
});

if (!result.success) {
  // Fallback to mock data or alternative processing
  const fallbackData = generateMockData();
  return { success: true, data: fallbackData };
}
```

### Custom Error Handling

```javascript
function safeExtractJSON(response) {
  try {
    const result = extractJSONFromGPTResponse(response);
    
    if (result.success) {
      return result.data;
    } else {
      console.warn('JSON extraction failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}
```

## 📊 Performance Considerations

### Caching Strategy

```javascript
const cache = new Map();

function extractWithCache(response) {
  const cacheKey = response.slice(0, 100); // Use first 100 chars as key
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = extractJSONFromGPTResponse(response);
  cache.set(cacheKey, result);
  
  return result;
}
```

### Batch Processing

```javascript
// Process multiple responses in parallel
const responses = [...]; // Array of GPT responses

const results = await Promise.all(
  responses.map(response => 
    Promise.resolve(extractJSONFromGPTResponse(response))
  )
);
```

## 🔒 Security Considerations

### Input Validation

```javascript
function secureExtractJSON(response) {
  // Validate input size
  if (response.length > 100000) {
    return { success: false, error: 'Response too large' };
  }
  
  // Validate input type
  if (typeof response !== 'string') {
    return { success: false, error: 'Invalid input type' };
  }
  
  return extractJSONFromGPTResponse(response);
}
```

### Content Sanitization

```javascript
function sanitizeAndExtract(response) {
  // Remove potentially dangerous content
  const sanitized = response
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  return extractJSONFromGPTResponse(sanitized);
}
```

## 🚀 Best Practices

1. **Always check `result.success`** before using `result.data`
2. **Use type-specific extractors** when you know the expected format
3. **Implement fallback strategies** for production use
4. **Cache results** for repeated processing of similar responses
5. **Validate extracted data** against expected schemas
6. **Handle errors gracefully** with meaningful user feedback
7. **Use appropriate logging levels** for different environments

## 🔄 Version Compatibility

- **TypeScript**: Requires TypeScript 4.0+
- **JavaScript**: Compatible with Node.js 12+
- **Browser**: Works in all modern browsers (ES2018+)

## 📝 Contributing

To add new extraction patterns or improve auto-fixing:

1. Add test cases to `test-gpt-parser.ts/js`
2. Implement new patterns in `extractWithPattern()`
3. Add fixing strategies to `attemptJSONFix()`
4. Update documentation

## 🎉 Ready to Use

The GPT response parser is production-ready and handles most real-world scenarios where GPT-4 returns mixed content with JSON blocks. It's designed to be robust, fast, and easy to integrate into existing applications.

Perfect for use with:
- ✅ Trending questions prompts
- ✅ Brand analysis responses
- ✅ Structured data extraction
- ✅ API response parsing
- ✅ Batch processing workflows 