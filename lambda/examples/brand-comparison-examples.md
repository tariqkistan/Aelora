# Brand Comparison API Documentation

This document provides comprehensive examples and usage instructions for the Brand Comparison Lambda function.

## API Endpoint

```
POST /compare
```

## Request Format

```json
{
  "brandA": "string",
  "brandB": "string", 
  "industry": "string"
}
```

### Field Descriptions

- **brandA**: First brand name for comparison (required, max 100 characters)
- **brandB**: Second brand name for comparison (required, max 100 characters, must be different from brandA)
- **industry**: Industry context for the comparison (required, max 100 characters)

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "comparisonId": "apple#microsoft",
    "timestamp": "2025-01-03T10:30:00.000Z",
    "brandA": "Apple",
    "brandB": "Microsoft",
    "industry": "Technology",
    "brandAStrengths": [
      "Exceptional brand loyalty and customer retention",
      "Premium product design and user experience",
      "Strong ecosystem integration across devices"
    ],
    "brandAWeaknesses": [
      "Higher pricing compared to competitors",
      "Limited customization options for users",
      "Dependency on hardware sales revenue"
    ],
    "brandBStrengths": [
      "Dominant enterprise software market position",
      "Strong cloud computing and Azure growth",
      "Diverse revenue streams and business model"
    ],
    "brandBWeaknesses": [
      "Consumer brand perception challenges",
      "Mobile platform market share limitations",
      "Legacy software maintenance burden"
    ],
    "verdict": "Both brands are technology leaders with distinct strengths. Apple excels in consumer products and brand loyalty, while Microsoft dominates enterprise software and cloud services.",
    "winner": "tie",
    "analysisDate": "2025-01-03",
    "confidence": 0.9,
    "summary": "Apple and Microsoft represent different approaches to technology leadership, with Apple focusing on consumer experience and Microsoft on enterprise solutions.",
    "methodology": "GPT-4 Competitive Analysis",
    "createdAt": "2025-01-03T10:30:00.000Z",
    "updatedAt": "2025-01-03T10:30:00.000Z"
  }
}
```

### Error Response (400/500)

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Example Requests

### 1. Technology Companies

```bash
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/compare \
  -H 'Content-Type: application/json' \
  -d '{
    "brandA": "Apple",
    "brandB": "Microsoft",
    "industry": "Technology"
  }'
```

### 2. Automotive Brands

```bash
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/compare \
  -H 'Content-Type: application/json' \
  -d '{
    "brandA": "Tesla",
    "brandB": "Ford",
    "industry": "Automotive"
  }'
```

### 3. Streaming Services

```bash
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/compare \
  -H 'Content-Type: application/json' \
  -d '{
    "brandA": "Netflix",
    "brandB": "Disney+",
    "industry": "Entertainment"
  }'
```

### 4. E-commerce Platforms

```bash
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/compare \
  -H 'Content-Type: application/json' \
  -d '{
    "brandA": "Amazon",
    "brandB": "Shopify",
    "industry": "E-commerce"
  }'
```

### 5. Fast Food Chains

```bash
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/compare \
  -H 'Content-Type: application/json' \
  -d '{
    "brandA": "McDonald's",
    "brandB": "Burger King",
    "industry": "Fast Food"
  }'
```

## Expected GPT-4 Analysis Results

### Technology Comparison (Apple vs Microsoft)

```json
{
  "brandA": {
    "name": "Apple",
    "strengths": [
      "Exceptional brand loyalty and customer retention",
      "Premium product design and user experience",
      "Strong ecosystem integration across devices"
    ],
    "weaknesses": [
      "Higher pricing compared to competitors",
      "Limited customization options for users", 
      "Dependency on hardware sales revenue"
    ]
  },
  "brandB": {
    "name": "Microsoft",
    "strengths": [
      "Dominant enterprise software market position",
      "Strong cloud computing and Azure growth",
      "Diverse revenue streams and business model"
    ],
    "weaknesses": [
      "Consumer brand perception challenges",
      "Mobile platform market share limitations",
      "Legacy software maintenance burden"
    ]
  },
  "verdict": {
    "winner": "tie",
    "reasoning": "Both brands are technology leaders with distinct strengths. Apple excels in consumer products and brand loyalty, while Microsoft dominates enterprise software and cloud services.",
    "confidence": 0.9
  },
  "summary": "Apple and Microsoft represent different approaches to technology leadership, with Apple focusing on consumer experience and Microsoft on enterprise solutions."
}
```

### Automotive Comparison (Tesla vs Ford)

```json
{
  "brandA": {
    "name": "Tesla",
    "strengths": [
      "Pioneer in electric vehicle technology",
      "Strong brand association with innovation",
      "Direct-to-consumer sales model advantage"
    ],
    "weaknesses": [
      "Limited production capacity and scale",
      "Higher price point than traditional vehicles",
      "Quality control and service network challenges"
    ]
  },
  "brandB": {
    "name": "Ford",
    "strengths": [
      "Established manufacturing and distribution network",
      "Strong brand heritage and trust",
      "Diverse vehicle portfolio and market reach"
    ],
    "weaknesses": [
      "Slower transition to electric vehicles",
      "Legacy costs and infrastructure burden",
      "Brand perception as traditional vs innovative"
    ]
  },
  "verdict": {
    "winner": "tie",
    "reasoning": "Tesla leads in EV innovation and brand perception, while Ford has manufacturing scale and market experience. Both face different challenges in the evolving automotive landscape.",
    "confidence": 0.8
  },
  "summary": "Tesla represents the future of automotive with electric innovation, while Ford brings established manufacturing expertise and market presence."
}
```

## Integration Examples

### JavaScript/Node.js

```javascript
async function compareBrands(brandA, brandB, industry) {
  const response = await fetch('https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/compare', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      brandA,
      brandB,
      industry
    })
  });

  const result = await response.json();
  
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error);
  }
}

// Usage
try {
  const comparison = await compareBrands('Apple', 'Microsoft', 'Technology');
  console.log('Winner:', comparison.winner);
  console.log('Verdict:', comparison.verdict);
} catch (error) {
  console.error('Comparison failed:', error.message);
}
```

### Python

```python
import requests
import json

def compare_brands(brand_a, brand_b, industry):
    url = "https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/compare"
    
    payload = {
        "brandA": brand_a,
        "brandB": brand_b,
        "industry": industry
    }
    
    response = requests.post(url, json=payload)
    result = response.json()
    
    if result["success"]:
        return result["data"]
    else:
        raise Exception(result["error"])

# Usage
try:
    comparison = compare_brands("Apple", "Microsoft", "Technology")
    print(f"Winner: {comparison['winner']}")
    print(f"Verdict: {comparison['verdict']}")
except Exception as e:
    print(f"Comparison failed: {e}")
```

### React Component

```jsx
import React, { useState } from 'react';

function BrandComparison() {
  const [brandA, setBrandA] = useState('');
  const [brandB, setBrandB] = useState('');
  const [industry, setIndustry] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandA,
          brandB,
          industry
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to compare brands');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-comparison">
      <h2>Brand Comparison Tool</h2>
      
      <div className="form-group">
        <input
          type="text"
          placeholder="Brand A"
          value={brandA}
          onChange={(e) => setBrandA(e.target.value)}
        />
        <input
          type="text"
          placeholder="Brand B"
          value={brandB}
          onChange={(e) => setBrandB(e.target.value)}
        />
        <input
          type="text"
          placeholder="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
        <button onClick={handleCompare} disabled={loading}>
          {loading ? 'Comparing...' : 'Compare Brands'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      
      {result && (
        <div className="results">
          <h3>Comparison Results</h3>
          <div className="winner">
            <strong>Winner:</strong> {result.winner}
          </div>
          <div className="verdict">
            <strong>Verdict:</strong> {result.verdict}
          </div>
          <div className="summary">
            <strong>Summary:</strong> {result.summary}
          </div>
          
          <div className="strengths-weaknesses">
            <div className="brand-analysis">
              <h4>{result.brandA}</h4>
              <div className="strengths">
                <strong>Strengths:</strong>
                <ul>
                  {result.brandAStrengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div className="weaknesses">
                <strong>Weaknesses:</strong>
                <ul>
                  {result.brandAWeaknesses.map((weakness, index) => (
                    <li key={index}>{weakness}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="brand-analysis">
              <h4>{result.brandB}</h4>
              <div className="strengths">
                <strong>Strengths:</strong>
                <ul>
                  {result.brandBStrengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div className="weaknesses">
                <strong>Weaknesses:</strong>
                <ul>
                  {result.brandBWeaknesses.map((weakness, index) => (
                    <li key={index}>{weakness}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrandComparison;
```

## Error Handling

### Common Error Responses

1. **Missing Required Fields**
```json
{
  "success": false,
  "error": "brandA is required and must be a string"
}
```

2. **Invalid Brand Names**
```json
{
  "success": false,
  "error": "brandA and brandB must be different brands"
}
```

3. **Field Length Validation**
```json
{
  "success": false,
  "error": "brandA must be 100 characters or less"
}
```

4. **OpenAI API Error**
```json
{
  "success": false,
  "error": "Failed to analyze brand comparison: OpenAI API error"
}
```

5. **DynamoDB Storage Error**
```json
{
  "success": false,
  "error": "Failed to store brand comparison: DynamoDB error"
}
```

## Caching Behavior

The API implements intelligent caching to avoid redundant GPT-4 calls:

- **Cache Duration**: 24 hours
- **Cache Key**: Combination of brandA + brandB (normalized)
- **Cache Behavior**: If a comparison for the same brand pair exists within 24 hours, returns cached result
- **Cache Invalidation**: Automatic after 24 hours, or manual via new deployment

## Performance Considerations

- **Response Time**: 5-15 seconds for new comparisons (GPT-4 processing)
- **Cached Response Time**: <1 second for recent comparisons
- **Rate Limiting**: AWS API Gateway default limits apply
- **Concurrent Requests**: Lambda handles up to 1000 concurrent executions

## Best Practices

1. **Input Validation**: Always validate inputs on the frontend before API calls
2. **Error Handling**: Implement proper error handling for all API responses
3. **Loading States**: Show loading indicators during API calls
4. **Caching**: Consider client-side caching for frequently accessed comparisons
5. **Retry Logic**: Implement exponential backoff for failed requests

## Monitoring and Troubleshooting

### CloudWatch Logs
- Function Name: `aelora-brand-comparison`
- Log Group: `/aws/lambda/aelora-brand-comparison`

### Common Issues
1. **OpenAI API Key**: Ensure environment variable is set correctly
2. **DynamoDB Permissions**: Check Lambda execution role has DynamoDB access
3. **Timeout**: Increase Lambda timeout if GPT-4 responses are slow
4. **Memory**: Monitor memory usage and increase if needed

### Health Check
```bash
curl -X GET https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/health
```

This comprehensive documentation covers all aspects of using the Brand Comparison API effectively. 