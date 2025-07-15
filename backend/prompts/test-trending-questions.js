#!/usr/bin/env node

/**
 * Test script for Trending Questions Prompt
 * 
 * This script demonstrates the prompt generation without making actual API calls.
 * To test with real GPT-4, set your OPENAI_API_KEY environment variable.
 */

const { TrendingQuestionsPrompt } = require('./trending-questions-prompt');

// Test cases
const testCases = [
  { brand: 'Apple', industry: 'Technology' },
  { brand: 'Tesla', industry: 'Automotive' },
  { brand: 'Netflix', industry: 'Entertainment' },
  { brand: 'Amazon', industry: 'Retail' },
  { brand: 'Chase', industry: 'Finance' }
];

console.log('🔍 Trending Questions Prompt Generator Test\n');
console.log('='.repeat(60));

// Test basic prompt generation
console.log('\n📝 BASIC PROMPT EXAMPLES\n');

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.brand} (${testCase.industry})`);
  console.log('-'.repeat(40));
  
  const prompt = TrendingQuestionsPrompt.generate(testCase.brand, testCase.industry);
  
  // Show first few lines of the prompt
  const lines = prompt.split('\n');
  console.log(lines.slice(0, 8).join('\n'));
  console.log('...');
  console.log(lines.slice(-3).join('\n'));
  console.log('\n');
});

// Test simple prompts
console.log('\n🎯 SIMPLE PROMPT EXAMPLES\n');

testCases.slice(0, 2).forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.brand} - Simple Version`);
  console.log('-'.repeat(40));
  
  const simplePrompt = TrendingQuestionsPrompt.generateSimple(testCase.brand, testCase.industry);
  console.log(simplePrompt);
  console.log('\n');
});

// Test industry-specific prompts
console.log('\n🏭 INDUSTRY-SPECIFIC EXAMPLES\n');

const industryTests = [
  { brand: 'Microsoft', industry: 'Technology' },
  { brand: 'Johnson & Johnson', industry: 'Healthcare' },
  { brand: 'Goldman Sachs', industry: 'Finance' }
];

industryTests.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.brand} (${testCase.industry})`);
  console.log('-'.repeat(40));
  
  const industryPrompt = TrendingQuestionsPrompt.generateIndustrySpecific(
    testCase.brand, 
    testCase.industry
  );
  console.log(industryPrompt);
  console.log('\n');
});

// Test competitive analysis
console.log('\n⚔️ COMPETITIVE ANALYSIS EXAMPLES\n');

const competitiveTests = [
  { 
    brand: 'Spotify', 
    industry: 'Entertainment', 
    competitors: ['Apple Music', 'YouTube Music', 'Pandora'] 
  },
  { 
    brand: 'iPhone', 
    industry: 'Technology', 
    competitors: ['Samsung Galaxy', 'Google Pixel'] 
  }
];

competitiveTests.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.brand} vs ${testCase.competitors.join(', ')}`);
  console.log('-'.repeat(40));
  
  const competitivePrompt = TrendingQuestionsPrompt.generateCompetitive(
    testCase.brand, 
    testCase.industry, 
    testCase.competitors
  );
  console.log(competitivePrompt);
  console.log('\n');
});

// Test focused prompts
console.log('\n🎯 FOCUSED PROMPTS (Specific Areas)\n');

const focusedTests = [
  { 
    brand: 'Amazon', 
    industry: 'Retail', 
    focus: ['pricing', 'delivery', 'customer service'] 
  },
  { 
    brand: 'Apple', 
    industry: 'Technology', 
    focus: ['security', 'privacy'] 
  }
];

focusedTests.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.brand} - Focus: ${testCase.focus.join(', ')}`);
  console.log('-'.repeat(40));
  
  const focusedPrompt = TrendingQuestionsPrompt.generateFocused(
    testCase.brand, 
    testCase.industry, 
    testCase.focus
  );
  console.log(focusedPrompt);
  console.log('\n');
});

// Test with options
console.log('\n⚙️ CUSTOM OPTIONS EXAMPLES\n');

const optionsTests = [
  {
    brand: 'Tesla',
    industry: 'Automotive',
    options: {
      questionCount: 3,
      includeComparison: false,
      includeReliability: true,
      includePricing: true
    }
  },
  {
    brand: 'Netflix',
    industry: 'Entertainment',
    options: {
      questionCount: 7,
      includeFeatures: true,
      includeAlternatives: true
    }
  }
];

optionsTests.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.brand} with custom options`);
  console.log(`Options: ${JSON.stringify(testCase.options, null, 2)}`);
  console.log('-'.repeat(40));
  
  const customPrompt = TrendingQuestionsPrompt.generate(
    testCase.brand, 
    testCase.industry, 
    testCase.options
  );
  
  // Show relevant parts
  const lines = customPrompt.split('\n');
  const generateLine = lines.findIndex(line => line.includes('Generate'));
  console.log(lines.slice(generateLine, generateLine + 3).join('\n'));
  console.log('\n');
});

console.log('\n✅ Test completed! All prompts generated successfully.\n');

// If OpenAI API key is available, test actual API call
if (process.env.OPENAI_API_KEY) {
  console.log('🤖 TESTING WITH REAL GPT-4 API\n');
  
  async function testWithGPT4() {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a market research expert. Always respond with valid JSON arrays only.'
            },
            {
              role: 'user',
              content: TrendingQuestionsPrompt.generateSimple('Apple', 'Technology')
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (response.ok) {
        const data = await response.json();
        const questions = JSON.parse(data.choices[0].message.content);
        
        console.log('✅ GPT-4 API Test Successful!');
        console.log('Generated questions for Apple (Technology):');
        questions.forEach((question, index) => {
          console.log(`${index + 1}. ${question}`);
        });
      } else {
        console.log('❌ GPT-4 API Test Failed:', response.status);
      }
    } catch (error) {
      console.log('❌ GPT-4 API Test Error:', error.message);
    }
  }
  
  testWithGPT4();
} else {
  console.log('💡 To test with real GPT-4, set OPENAI_API_KEY environment variable:');
  console.log('   export OPENAI_API_KEY=your-api-key-here');
  console.log('   node test-trending-questions.js');
}

console.log('\n📚 For more examples, see trending-questions-examples.md');
console.log('🔧 For implementation details, see trending-questions-prompt.js or .ts'); 