#!/usr/bin/env node

/**
 * Test suite for GPT-4 Response Parser
 * 
 * This file demonstrates the parser's capabilities with various real-world scenarios
 * including mixed content, malformed JSON, and edge cases.
 */

import { 
  extractJSONFromGPTResponse, 
  extractArrayFromGPTResponse, 
  extractObjectFromGPTResponse,
  extractAndValidateJSON,
  typeGuards,
  ParseResult 
} from './gpt-response-parser';

// Test data representing various GPT-4 response formats
const testResponses = {
  // Perfect JSON response
  perfectJSON: `[
    "Is Apple reliable for business use?",
    "How does Apple compare to Samsung?",
    "What are the pros and cons of Apple?",
    "Should I choose Apple or alternatives?",
    "What do users say about Apple quality?"
  ]`,

  // JSON with explanation before
  jsonWithExplanation: `Here are 5 trending questions about Tesla:

  [
    "Is Tesla reliable for long-term ownership?",
    "How does Tesla compare to BMW in safety?",
    "What's the real-world range of Tesla?",
    "Should I buy Tesla or wait for alternatives?",
    "What are the hidden costs of Tesla ownership?"
  ]

  These questions reflect common user concerns about electric vehicles.`,

  // JSON wrapped in code fences
  jsonInCodeFence: `\`\`\`json
  {
    "questions": [
      "Is Netflix worth the subscription cost?",
      "How does Netflix compare to Disney+?",
      "What devices support Netflix?",
      "Should I choose Netflix or Hulu?",
      "What's the content quality on Netflix?"
    ],
    "brand": "Netflix",
    "industry": "Entertainment"
  }
  \`\`\``,

  // JSON with markdown formatting
  jsonWithMarkdown: `## Analysis Results

  Based on the brand analysis, here are the trending questions:

  \`{
    "brand": "Amazon",
    "questions": [
      "Is Amazon reliable for fast delivery?",
      "How does Amazon Prime compare to competitors?",
      "What are Amazon's return policies?",
      "Is Amazon customer service helpful?",
      "Should I trust Amazon with my data?"
    ]
  }\`

  This data can be used for further analysis.`,

  // Multiple JSON blocks (should extract first)
  multipleJSONBlocks: `Here's the analysis:

  First result:
  ["Question 1", "Question 2", "Question 3"]

  Alternative format:
  {
    "questions": ["Alt 1", "Alt 2", "Alt 3"],
    "confidence": 0.95
  }

  Use whichever format works best.`,

  // Malformed JSON (missing quotes)
  malformedJSON: `The questions are:
  {
    brand: "Apple",
    questions: [
      'Is Apple reliable?',
      'How does Apple compare?',
      'What are the pros and cons?',
    ]
  }`,

  // JSON with trailing comma
  trailingCommaJSON: `[
    "Question 1",
    "Question 2",
    "Question 3",
  ]`,

  // No JSON content
  noJSON: `I cannot provide specific questions about this brand as it would require more context about the industry and target audience. Please provide additional information.`,

  // Mixed content with explanation
  mixedContent: `Based on market research, users typically ask these questions about Spotify:

  Result: ["How much does Spotify cost?", "Is Spotify better than Apple Music?", "Can I download songs on Spotify?", "What's Spotify's audio quality?", "Does Spotify have podcasts?"]

  These questions cover pricing, competition, features, and content variety.`,

  // Nested JSON
  nestedJSON: `{
    "analysis": {
      "brand": "Tesla",
      "questions": [
        "Is Tesla reliable?",
        "How does Tesla compare to competitors?",
        "What's Tesla's range?"
      ],
      "metadata": {
        "generated_at": "2024-01-15",
        "confidence": 0.92
      }
    }
  }`,

  // JSON with escape characters
  jsonWithEscapes: `["Is Apple \"innovative\" enough?", "How does Apple compare to \"Android\"?", "What's Apple's \"ecosystem\" like?"]`,

  // Large JSON response
  largeJSON: JSON.stringify({
    questions: Array.from({ length: 20 }, (_, i) => `Question ${i + 1} about the brand?`),
    metadata: {
      total: 20,
      categories: ['pricing', 'features', 'competition', 'reliability'],
      generated: new Date().toISOString()
    }
  })
};

// Interface for trending questions validation
interface TrendingQuestionsResponse {
  questions: string[];
  brand?: string;
  industry?: string;
}

// Validator function
const isTrendingQuestions = (data: any): data is TrendingQuestionsResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray(data.questions) &&
    data.questions.every((q: any) => typeof q === 'string')
  );
};

// Test runner
function runTests() {
  console.log('🧪 GPT-4 Response Parser Test Suite\n');
  console.log('='.repeat(60));

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Perfect JSON
  console.log('\n📝 Test 1: Perfect JSON Response');
  console.log('-'.repeat(40));
  totalTests++;
  
  const result1 = extractJSONFromGPTResponse(testResponses.perfectJSON);
  if (result1.success && Array.isArray(result1.data) && result1.data.length === 5) {
    console.log('✅ PASSED: Extracted array with 5 questions');
    console.log('Sample:', result1.data[0]);
    passedTests++;
  } else {
    console.log('❌ FAILED:', result1.error);
  }

  // Test 2: JSON with explanation
  console.log('\n📝 Test 2: JSON with Explanation');
  console.log('-'.repeat(40));
  totalTests++;
  
  const result2 = extractJSONFromGPTResponse(testResponses.jsonWithExplanation);
  if (result2.success && Array.isArray(result2.data)) {
    console.log('✅ PASSED: Extracted JSON despite explanatory text');
    console.log('Questions found:', result2.data.length);
    passedTests++;
  } else {
    console.log('❌ FAILED:', result2.error);
  }

  // Test 3: JSON in code fence
  console.log('\n📝 Test 3: JSON in Code Fence');
  console.log('-'.repeat(40));
  totalTests++;
  
  const result3 = extractJSONFromGPTResponse(testResponses.jsonInCodeFence);
  if (result3.success && result3.data && typeof result3.data === 'object') {
    console.log('✅ PASSED: Extracted JSON from code fence');
    console.log('Brand:', (result3.data as any).brand);
    passedTests++;
  } else {
    console.log('❌ FAILED:', result3.error);
  }

  // Test 4: JSON with markdown
  console.log('\n📝 Test 4: JSON with Markdown');
  console.log('-'.repeat(40));
  totalTests++;
  
  const result4 = extractJSONFromGPTResponse(testResponses.jsonWithMarkdown);
  if (result4.success && result4.data) {
    console.log('✅ PASSED: Extracted JSON from markdown');
    console.log('Questions:', (result4.data as any).questions?.length);
    passedTests++;
  } else {
    console.log('❌ FAILED:', result4.error);
  }

  // Test 5: Multiple JSON blocks
  console.log('\n📝 Test 5: Multiple JSON Blocks');
  console.log('-'.repeat(40));
  totalTests++;
  
  const result5 = extractJSONFromGPTResponse(testResponses.multipleJSONBlocks);
  if (result5.success && Array.isArray(result5.data) && result5.data.length === 3) {
    console.log('✅ PASSED: Extracted first JSON block');
    console.log('First block:', result5.data);
    passedTests++;
  } else {
    console.log('❌ FAILED:', result5.error);
  }

  // Test 6: Malformed JSON (should fix)
  console.log('\n📝 Test 6: Malformed JSON Auto-Fix');
  console.log('-'.repeat(40));
  totalTests++;
  
  const result6 = extractJSONFromGPTResponse(testResponses.malformedJSON);
  if (result6.success && result6.data) {
    console.log('✅ PASSED: Auto-fixed malformed JSON');
    console.log('Brand:', (result6.data as any).brand);
    passedTests++;
  } else {
    console.log('❌ FAILED:', result6.error);
  }

  // Test 7: Array extraction
  console.log('\n📝 Test 7: Array-Specific Extraction');
  console.log('-'.repeat(40));
  totalTests++;
  
  const result7 = extractArrayFromGPTResponse(testResponses.perfectJSON);
  if (result7.success && Array.isArray(result7.data)) {
    console.log('✅ PASSED: Extracted as array');
    console.log('Array length:', result7.data.length);
    passedTests++;
  } else {
    console.log('❌ FAILED:', result7.error);
  }

  // Test 8: Object extraction
  console.log('\n📝 Test 8: Object-Specific Extraction');
  console.log('-'.repeat(40));
  totalTests++;
  
  const result8 = extractObjectFromGPTResponse(testResponses.jsonInCodeFence);
  if (result8.success && result8.data && !Array.isArray(result8.data)) {
    console.log('✅ PASSED: Extracted as object');
    console.log('Object keys:', Object.keys(result8.data));
    passedTests++;
  } else {
    console.log('❌ FAILED:', result8.error);
  }

  // Test 9: Validation with type guard
  console.log('\n📝 Test 9: Type Validation');
  console.log('-'.repeat(40));
  totalTests++;
  
  const result9 = extractAndValidateJSON(
    testResponses.perfectJSON,
    typeGuards.isStringArray
  );
  if (result9.success && result9.data) {
    console.log('✅ PASSED: Validated as string array');
    console.log('Validated data:', result9.data.slice(0, 2));
    passedTests++;
  } else {
    console.log('❌ FAILED:', result9.error);
  }

  // Test 10: No JSON content
  console.log('\n📝 Test 10: No JSON Content');
  console.log('-'.repeat(40));
  totalTests++;
  
  const result10 = extractJSONFromGPTResponse(testResponses.noJSON, { logErrors: false });
  if (!result10.success) {
    console.log('✅ PASSED: Correctly identified no JSON');
    console.log('Error:', result10.error);
    passedTests++;
  } else {
    console.log('❌ FAILED: Should have failed to find JSON');
  }

  // Test 11: Large JSON
  console.log('\n📝 Test 11: Large JSON Response');
  console.log('-'.repeat(40));
  totalTests++;
  
  const result11 = extractJSONFromGPTResponse(testResponses.largeJSON);
  if (result11.success && result11.data && (result11.data as any).questions?.length === 20) {
    console.log('✅ PASSED: Handled large JSON response');
    console.log('Questions count:', (result11.data as any).questions.length);
    passedTests++;
  } else {
    console.log('❌ FAILED:', result11.error);
  }

  // Test 12: Custom validation
  console.log('\n📝 Test 12: Custom Schema Validation');
  console.log('-'.repeat(40));
  totalTests++;
  
  const result12 = extractAndValidateJSON(
    testResponses.jsonInCodeFence,
    isTrendingQuestions
  );
  if (result12.success && result12.data) {
    console.log('✅ PASSED: Custom validation successful');
    console.log('Questions:', result12.data.questions.length);
    passedTests++;
  } else {
    console.log('❌ FAILED:', result12.error);
  }

  // Test 13: Error handling options
  console.log('\n📝 Test 13: Error Handling Options');
  console.log('-'.repeat(40));
  totalTests++;
  
  const result13 = extractJSONFromGPTResponse(testResponses.noJSON, {
    logErrors: false,
    returnOriginalOnFailure: true
  });
  if (!result13.success && result13.originalResponse) {
    console.log('✅ PASSED: Error handling options work');
    console.log('Original returned:', result13.originalResponse.length > 0);
    passedTests++;
  } else {
    console.log('❌ FAILED: Error handling options not working');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Parser is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the implementation.');
  }

  // Usage examples
  console.log('\n📚 Usage Examples:');
  console.log('-'.repeat(40));
  
  console.log(`
// Basic usage
import { extractJSONFromGPTResponse } from './gpt-response-parser';

const response = "Here are the questions: ['Q1', 'Q2', 'Q3']";
const result = extractJSONFromGPTResponse(response);

if (result.success) {
  console.log('Extracted:', result.data);
} else {
  console.log('Error:', result.error);
}

// With options
const result2 = extractJSONFromGPTResponse(response, {
  logErrors: false,
  returnOriginalOnFailure: true,
  strictMode: true
});

// Array-specific extraction
const arrayResult = extractArrayFromGPTResponse(response);

// With validation
const validatedResult = extractAndValidateJSON(
  response,
  typeGuards.isStringArray
);`);

  console.log('\n✅ Test suite completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

export { runTests }; 