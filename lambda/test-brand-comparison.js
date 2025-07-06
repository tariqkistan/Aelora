/**
 * Test script for Brand Comparison Lambda Function
 * 
 * This script tests the brand comparison functionality locally
 * before deployment to AWS Lambda.
 */

const { BrandComparisonService } = require('./dist/services/brand-comparison-service');
const { BrandComparisonStorageService } = require('./dist/services/brand-comparison-storage');

// Mock environment variables for testing
process.env.OPENAI_API_KEY = 'your-openai-api-key-here';
process.env.AWS_REGION = 'us-east-1';
process.env.BRAND_COMPARISONS_TABLE = 'BrandComparisons';

/**
 * Test the brand comparison service
 */
async function testBrandComparisonService() {
  console.log('🧪 Testing Brand Comparison Service...\n');
  
  const service = new BrandComparisonService();
  
  try {
    console.log('📋 Testing Apple vs Microsoft comparison...');
    const result = await service.compareBrands('Apple', 'Microsoft', 'Technology');
    
    console.log('✅ GPT-4 Analysis Result:');
    console.log(JSON.stringify(result, null, 2));
    
    // Validate result structure
    if (result.brandA && result.brandB && result.verdict) {
      console.log('✅ Result structure is valid');
    } else {
      console.log('❌ Result structure is invalid');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Brand comparison service test failed:', error.message);
    return null;
  }
}

/**
 * Test the storage service (requires DynamoDB setup)
 */
async function testBrandComparisonStorage() {
  console.log('\n🗄️ Testing Brand Comparison Storage Service...\n');
  
  const storageService = new BrandComparisonStorageService();
  
  // Mock GPT result for testing
  const mockGPTResult = {
    brandA: {
      name: 'Apple',
      strengths: [
        'Exceptional brand loyalty and customer retention',
        'Premium product design and user experience',
        'Strong ecosystem integration across devices'
      ],
      weaknesses: [
        'Higher pricing compared to competitors',
        'Limited customization options for users',
        'Dependency on hardware sales revenue'
      ]
    },
    brandB: {
      name: 'Microsoft',
      strengths: [
        'Dominant enterprise software market position',
        'Strong cloud computing and Azure growth',
        'Diverse revenue streams and business model'
      ],
      weaknesses: [
        'Consumer brand perception challenges',
        'Mobile platform market share limitations',
        'Legacy software maintenance burden'
      ]
    },
    verdict: {
      winner: 'tie',
      reasoning: 'Both brands are technology leaders with distinct strengths. Apple excels in consumer products and brand loyalty, while Microsoft dominates enterprise software and cloud services.',
      confidence: 0.9
    },
    summary: 'Apple and Microsoft represent different approaches to technology leadership, with Apple focusing on consumer experience and Microsoft on enterprise solutions.'
  };
  
  try {
    console.log('📋 Testing storage of comparison result...');
    const storedResult = await storageService.storeBrandComparison(
      'Apple',
      'Microsoft', 
      'Technology',
      mockGPTResult
    );
    
    console.log('✅ Stored comparison result:');
    console.log(JSON.stringify(storedResult, null, 2));
    
    // Test retrieval
    console.log('\n📋 Testing retrieval of comparison history...');
    const history = await storageService.getBrandComparisonHistory('Apple', 'Microsoft');
    
    console.log('✅ Retrieved comparison history:');
    console.log(`Found ${history.length} comparisons`);
    
    // Test recent comparison check
    console.log('\n📋 Testing recent comparison check...');
    const hasRecent = await storageService.hasRecentComparison('Apple', 'Microsoft', 24);
    console.log(`✅ Has recent comparison: ${hasRecent}`);
    
    return storedResult;
  } catch (error) {
    console.error('❌ Storage service test failed:', error.message);
    console.log('ℹ️  This is expected if DynamoDB table is not set up yet');
    return null;
  }
}

/**
 * Test the complete Lambda handler
 */
async function testLambdaHandler() {
  console.log('\n🚀 Testing Complete Lambda Handler...\n');
  
  const { handler } = require('./dist/brand-comparison-handler');
  
  // Mock API Gateway event
  const mockEvent = {
    httpMethod: 'POST',
    body: JSON.stringify({
      brandA: 'Tesla',
      brandB: 'Ford',
      industry: 'Automotive'
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    console.log('📋 Testing Lambda handler with Tesla vs Ford...');
    const result = await handler(mockEvent);
    
    console.log('✅ Lambda handler result:');
    console.log(`Status Code: ${result.statusCode}`);
    console.log(`Headers:`, result.headers);
    
    const responseBody = JSON.parse(result.body);
    console.log('Response Body:');
    console.log(JSON.stringify(responseBody, null, 2));
    
    return result;
  } catch (error) {
    console.error('❌ Lambda handler test failed:', error.message);
    return null;
  }
}

/**
 * Test validation logic
 */
function testValidation() {
  console.log('\n🔍 Testing Validation Logic...\n');
  
  const testCases = [
    {
      name: 'Valid request',
      data: { brandA: 'Apple', brandB: 'Microsoft', industry: 'Technology' },
      shouldPass: true
    },
    {
      name: 'Missing brandA',
      data: { brandB: 'Microsoft', industry: 'Technology' },
      shouldPass: false
    },
    {
      name: 'Same brands',
      data: { brandA: 'Apple', brandB: 'Apple', industry: 'Technology' },
      shouldPass: false
    },
    {
      name: 'Empty industry',
      data: { brandA: 'Apple', brandB: 'Microsoft', industry: '' },
      shouldPass: false
    },
    {
      name: 'Long brand name',
      data: { brandA: 'A'.repeat(101), brandB: 'Microsoft', industry: 'Technology' },
      shouldPass: false
    }
  ];
  
  // Import validation function (we'll need to export it from the handler)
  console.log('📋 Running validation test cases...');
  
  testCases.forEach(testCase => {
    console.log(`\n  Testing: ${testCase.name}`);
    console.log(`  Data: ${JSON.stringify(testCase.data)}`);
    console.log(`  Expected: ${testCase.shouldPass ? 'PASS' : 'FAIL'}`);
    
    // Note: We'd need to export the validation function to test it properly
    // For now, we'll just log the test cases
  });
  
  console.log('\n✅ Validation tests logged (requires exported validation function)');
}

/**
 * Performance test
 */
async function testPerformance() {
  console.log('\n⚡ Testing Performance...\n');
  
  const service = new BrandComparisonService();
  
  console.log('📋 Testing response time for brand comparison...');
  const startTime = Date.now();
  
  try {
    await service.compareBrands('Netflix', 'Disney+', 'Entertainment');
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Comparison completed in ${duration}ms`);
    
    if (duration < 30000) { // 30 seconds
      console.log('✅ Performance is acceptable');
    } else {
      console.log('⚠️  Performance may be slow for production use');
    }
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Brand Comparison Tests\n');
  console.log('=' * 50);
  
  // Check environment setup
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
    console.log('⚠️  Warning: OPENAI_API_KEY not set. Some tests will fail.');
    console.log('   Set your OpenAI API key in environment variables or at the top of this file.\n');
  }
  
  // Run tests
  await testBrandComparisonService();
  await testBrandComparisonStorage();
  await testLambdaHandler();
  testValidation();
  
  // Performance test (optional, requires API key)
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
    await testPerformance();
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Set up your OpenAI API key');
  console.log('   2. Run: chmod +x deploy-brand-comparison.sh');
  console.log('   3. Run: ./deploy-brand-comparison.sh');
  console.log('   4. Test the deployed API endpoint');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testBrandComparisonService,
  testBrandComparisonStorage,
  testLambdaHandler,
  testValidation,
  testPerformance
}; 