#!/usr/bin/env node

/**
 * Simple test runner for GPT-4 Response Parser (JavaScript)
 * 
 * This script demonstrates the parser's capabilities with various real-world scenarios.
 */

const {
  extractJSONFromGPTResponse,
  extractArrayFromGPTResponse,
  extractObjectFromGPTResponse,
  extractAndValidateJSON,
  typeGuards
} = require('./gpt-response-parser');

// Test responses
const testResponses = {
  perfectJSON: `["Question 1", "Question 2", "Question 3"]`,
  
  jsonWithExplanation: `Here are the trending questions:
  
  ["Is Apple reliable?", "How does Apple compare?", "What are the pros?"]
  
  These questions reflect user concerns.`,
  
  jsonInCodeFence: `\`\`\`json
  {
    "questions": ["Q1", "Q2", "Q3"],
    "brand": "Tesla"
  }
  \`\`\``,
  
  malformedJSON: `{
    brand: "Apple",
    questions: [
      'Question 1',
      'Question 2',
    ]
  }`,
  
  noJSON: `I cannot provide questions without more context.`,
  
  mixedContent: `Analysis shows users ask: ["Price question", "Feature question", "Comparison question"]`
};

// Simple test runner
function runTests() {
  console.log('🧪 GPT Response Parser Tests (JavaScript)\n');
  console.log('='.repeat(50));
  
  let passed = 0;
  let total = 0;
  
  // Test 1: Perfect JSON
  console.log('\n📝 Test 1: Perfect JSON');
  console.log('-'.repeat(30));
  total++;
  
  const result1 = extractJSONFromGPTResponse(testResponses.perfectJSON);
  if (result1.success && Array.isArray(result1.data)) {
    console.log('✅ PASSED: Extracted array');
    console.log('Data:', result1.data);
    passed++;
  } else {
    console.log('❌ FAILED:', result1.error);
  }
  
  // Test 2: JSON with explanation
  console.log('\n📝 Test 2: JSON with Explanation');
  console.log('-'.repeat(30));
  total++;
  
  const result2 = extractJSONFromGPTResponse(testResponses.jsonWithExplanation);
  if (result2.success && Array.isArray(result2.data)) {
    console.log('✅ PASSED: Extracted despite explanation');
    console.log('Questions:', result2.data.length);
    passed++;
  } else {
    console.log('❌ FAILED:', result2.error);
  }
  
  // Test 3: Code fence
  console.log('\n📝 Test 3: Code Fence');
  console.log('-'.repeat(30));
  total++;
  
  const result3 = extractJSONFromGPTResponse(testResponses.jsonInCodeFence);
  if (result3.success && result3.data && result3.data.brand) {
    console.log('✅ PASSED: Extracted from code fence');
    console.log('Brand:', result3.data.brand);
    passed++;
  } else {
    console.log('❌ FAILED:', result3.error);
  }
  
  // Test 4: Malformed JSON
  console.log('\n📝 Test 4: Malformed JSON Auto-Fix');
  console.log('-'.repeat(30));
  total++;
  
  const result4 = extractJSONFromGPTResponse(testResponses.malformedJSON);
  if (result4.success && result4.data) {
    console.log('✅ PASSED: Auto-fixed malformed JSON');
    console.log('Brand:', result4.data.brand);
    passed++;
  } else {
    console.log('❌ FAILED:', result4.error);
  }
  
  // Test 5: Array extraction
  console.log('\n📝 Test 5: Array-Specific Extraction');
  console.log('-'.repeat(30));
  total++;
  
  const result5 = extractArrayFromGPTResponse(testResponses.perfectJSON);
  if (result5.success && Array.isArray(result5.data)) {
    console.log('✅ PASSED: Array extraction');
    console.log('Length:', result5.data.length);
    passed++;
  } else {
    console.log('❌ FAILED:', result5.error);
  }
  
  // Test 6: Object extraction
  console.log('\n📝 Test 6: Object-Specific Extraction');
  console.log('-'.repeat(30));
  total++;
  
  const result6 = extractObjectFromGPTResponse(testResponses.jsonInCodeFence);
  if (result6.success && result6.data && !Array.isArray(result6.data)) {
    console.log('✅ PASSED: Object extraction');
    console.log('Keys:', Object.keys(result6.data));
    passed++;
  } else {
    console.log('❌ FAILED:', result6.error);
  }
  
  // Test 7: Validation
  console.log('\n📝 Test 7: Type Validation');
  console.log('-'.repeat(30));
  total++;
  
  const result7 = extractAndValidateJSON(
    testResponses.perfectJSON,
    typeGuards.isStringArray
  );
  if (result7.success && result7.data) {
    console.log('✅ PASSED: String array validation');
    console.log('Validated:', result7.data.slice(0, 2));
    passed++;
  } else {
    console.log('❌ FAILED:', result7.error);
  }
  
  // Test 8: No JSON (should fail)
  console.log('\n📝 Test 8: No JSON Content');
  console.log('-'.repeat(30));
  total++;
  
  const result8 = extractJSONFromGPTResponse(testResponses.noJSON, { logErrors: false });
  if (!result8.success) {
    console.log('✅ PASSED: Correctly identified no JSON');
    console.log('Error:', result8.error);
    passed++;
  } else {
    console.log('❌ FAILED: Should have failed');
  }
  
  // Test 9: Mixed content
  console.log('\n📝 Test 9: Mixed Content');
  console.log('-'.repeat(30));
  total++;
  
  const result9 = extractJSONFromGPTResponse(testResponses.mixedContent);
  if (result9.success && Array.isArray(result9.data)) {
    console.log('✅ PASSED: Extracted from mixed content');
    console.log('Questions:', result9.data);
    passed++;
  } else {
    console.log('❌ FAILED:', result9.error);
  }
  
  // Test 10: Error handling options
  console.log('\n📝 Test 10: Error Handling Options');
  console.log('-'.repeat(30));
  total++;
  
  const result10 = extractJSONFromGPTResponse(testResponses.noJSON, {
    logErrors: false,
    returnOriginalOnFailure: true
  });
  if (!result10.success && result10.originalResponse) {
    console.log('✅ PASSED: Error handling options work');
    console.log('Original preserved:', result10.originalResponse.length > 0);
    passed++;
  } else {
    console.log('❌ FAILED: Options not working');
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Results: ${passed}/${total} tests passed`);
  console.log(`Success rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Parser working correctly.');
  } else {
    console.log('⚠️  Some tests failed.');
  }
  
  // Usage examples
  console.log('\n📚 Usage Examples:');
  console.log('-'.repeat(30));
  console.log(`
// Basic usage
const { extractJSONFromGPTResponse } = require('./gpt-response-parser');

const response = "Here are the questions: ['Q1', 'Q2', 'Q3']";
const result = extractJSONFromGPTResponse(response);

if (result.success) {
  console.log('Extracted:', result.data);
} else {
  console.log('Error:', result.error);
}

// With trending questions
const trendingResponse = \`Here are 5 questions about Apple:
[
  "Is Apple reliable for business?",
  "How does Apple compare to Samsung?",
  "What are Apple's main advantages?"
]\`;

const questions = extractArrayFromGPTResponse(trendingResponse);
if (questions.success) {
  console.log('Trending questions:', questions.data);
}
`);
  
  console.log('\n✅ Test completed!');
}

// Run tests
runTests(); 