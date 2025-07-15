# Lambda Integration Guide

This guide explains how to integrate your Next.js frontend with AWS Lambda functions via API Gateway for brand visibility analysis.

## Overview

The Lambda integration allows your frontend to trigger AWS Lambda functions for real-time brand analysis, sentiment scoring, and competitive intelligence. The system includes automatic fallback to mock data for development and testing.

## Architecture

```
Frontend (Next.js) → API Route (/api/visibility) → API Gateway → Lambda Function → DynamoDB
```

### Components

1. **Frontend Component** (`BrandAnalysisTrigger`): User interface for triggering analysis
2. **API Route** (`/api/visibility`): Next.js proxy to AWS services
3. **API Gateway**: AWS service for routing requests to Lambda
4. **Lambda Function**: Brand analysis logic with GPT-4 integration
5. **DynamoDB**: Data storage for analysis results

## Setup Instructions

### 1. Environment Configuration

Create or update your `.env.local` file:

```bash
# AWS API Gateway URL (required for Lambda integration)
NEXT_PUBLIC_AWS_API_URL=https://your-api-gateway-id.execute-api.region.amazonaws.com/prod

# Optional: Additional AWS configuration
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
```

### 2. API Gateway Setup

Your API Gateway should have the following endpoint:

- **Method**: POST
- **Path**: `/brand-visibility`
- **Integration**: Lambda Function
- **CORS**: Enabled for your domain

### 3. Lambda Function Requirements

Your Lambda function should accept this payload:

```json
{
  "brandName": "Apple",
  "domain": "apple.com",
  "industry": "Technology"
}
```

And return this response format:

```json
{
  "success": true,
  "data": {
    "brand": "Apple",
    "sentimentHistory": [
      {
        "date": "2024-01-01",
        "sentimentScore": 0.75,
        "mentions": 45,
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ],
    "mentions": [
      {
        "keyword": "innovative",
        "tone": "positive",
        "frequency": 12
      }
    ],
    "summary": "Apple shows strong positive sentiment...",
    "lastUpdated": "2024-01-01T00:00:00Z",
    "totalMentions": 150,
    "averageSentiment": 0.75
  }
}
```

## API Reference

### POST /api/visibility

Triggers brand analysis via Lambda function.

#### Request Body

```typescript
interface BrandVisibilityRequest {
  brandName: string        // Required: Brand name to analyze
  domain?: string         // Optional: Brand domain (auto-generated if not provided)
  industry?: string       // Optional: Industry category (defaults to "Technology")
}
```

#### Response Format

```typescript
interface BrandVisibilityResponse {
  success: boolean
  data?: {
    brand: string
    sentimentHistory: Array<{
      date: string
      sentimentScore: number    // -1 to 1 scale
      mentions: number
      timestamp: string
    }>
    mentions: Array<{
      keyword: string
      tone: 'positive' | 'neutral' | 'negative'
      frequency: number
    }>
    summary: string
    lastUpdated: string
    totalMentions: number
    averageSentiment: number  // -1 to 1 scale
  }
  error?: string
}
```

### GET /api/visibility

Retrieves mock data for dashboard display (backwards compatibility).

#### Query Parameters

- `brand`: Brand name (required)

## Frontend Integration

### Basic Usage

```typescript
// Trigger Lambda analysis
const response = await fetch('/api/visibility', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    brandName: 'Apple',
    domain: 'apple.com',
    industry: 'Technology'
  })
})

const result = await response.json()

if (result.success) {
  console.log('Analysis complete:', result.data)
} else {
  console.error('Analysis failed:', result.error)
}
```

### React Component Integration

```jsx
import { useState } from 'react'

function BrandAnalysis() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const analyzeBrand = async (brandName) => {
    setLoading(true)
    try {
      const response = await fetch('/api/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={() => analyzeBrand('Apple')} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Brand'}
      </button>
      {result && <div>{JSON.stringify(result, null, 2)}</div>}
    </div>
  )
}
```

## Error Handling

The system includes comprehensive error handling:

### Automatic Fallback

- If `NEXT_PUBLIC_AWS_API_URL` is not configured, uses mock data
- If Lambda function is unavailable, falls back to mock data
- If API Gateway returns an error, provides graceful degradation

### Error Types

1. **Configuration Error**: Missing AWS API URL
2. **Network Error**: Unable to reach API Gateway
3. **Lambda Error**: Function execution failure
4. **Timeout Error**: Request exceeds 30-second limit
5. **Validation Error**: Invalid request parameters

### Error Response Format

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

## Testing

### Test Page

Visit `/lambda-test` to access the testing interface with:

- Configuration status display
- Interactive form for triggering analysis
- Real-time results display
- Error handling demonstration

### Manual Testing

```bash
# Test with curl
curl -X POST http://localhost:3000/api/visibility \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "Apple",
    "domain": "apple.com",
    "industry": "Technology"
  }'
```

### Development Mode

When `NEXT_PUBLIC_AWS_API_URL` is not set:

- System automatically uses mock data
- All functionality works for development
- Console logs indicate fallback mode
- No AWS charges incurred

## Monitoring and Logging

### Frontend Logs

The API route logs all requests and responses:

```
[API] POST /api/visibility - Request: { brandName: "Apple", ... }
[API] POST /api/visibility - Calling Lambda: { url: "...", payload: {...} }
[API] POST /api/visibility - Lambda response status: 200
[API] POST /api/visibility - Lambda success: { success: true, hasData: true }
```

### Error Logs

```
[API] POST /api/visibility - AWS_API_URL not configured
[API] POST /api/visibility - Lambda error (500): Internal server error
[API] POST /api/visibility - Using mock data fallback due to Lambda error
```

## Performance Considerations

### Timeouts

- **Lambda Request**: 30-second timeout
- **API Gateway**: Configure appropriate timeout (recommended: 29 seconds)
- **DynamoDB**: Fast queries with proper indexing

### Caching

- Frontend caches results in component state
- Consider implementing Redis cache for Lambda responses
- DynamoDB provides built-in caching with DAX

### Rate Limiting

- API Gateway supports rate limiting
- Consider implementing request throttling
- Monitor Lambda concurrent executions

## Security

### Environment Variables

- Never expose AWS credentials in frontend code
- Use `NEXT_PUBLIC_` prefix only for API Gateway URLs
- Store sensitive data in server-side environment variables

### API Gateway Security

- Enable CORS for your domain only
- Use API keys for additional security
- Implement request validation
- Consider AWS WAF for protection

### Lambda Security

- Use IAM roles with minimal permissions
- Validate all input parameters
- Implement proper error handling
- Log security events

## Deployment

### Vercel Deployment

```bash
# Set environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_AWS_API_URL

# Deploy
vercel --prod
```

### AWS Lambda Deployment

```bash
# Deploy your Lambda function
aws lambda update-function-code \
  --function-name brand-visibility-analyzer \
  --zip-file fileb://function.zip

# Update API Gateway
aws apigateway create-deployment \
  --rest-api-id your-api-id \
  --stage-name prod
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure API Gateway has CORS enabled
   - Check allowed origins and methods

2. **Lambda Timeout**
   - Increase Lambda timeout (max 15 minutes)
   - Optimize function performance
   - Consider async processing

3. **Mock Data Always Returned**
   - Verify `NEXT_PUBLIC_AWS_API_URL` is set
   - Check API Gateway URL format
   - Test Lambda function directly

4. **DynamoDB Errors**
   - Verify Lambda has DynamoDB permissions
   - Check table names and regions
   - Monitor DynamoDB capacity

### Debug Mode

Enable debug logging:

```bash
# .env.local
NODE_ENV=development
DEBUG=true
```

### Health Check

Test your integration:

```bash
# Check API Gateway
curl https://your-api-gateway-url.amazonaws.com/prod/brand-visibility

# Check Lambda directly
aws lambda invoke --function-name brand-visibility-analyzer output.json
```

## Cost Optimization

### Lambda Costs

- Use appropriate memory allocation
- Optimize function execution time
- Consider provisioned concurrency for high traffic

### API Gateway Costs

- Monitor request volume
- Use caching to reduce Lambda invocations
- Consider WebSocket API for real-time updates

### DynamoDB Costs

- Use on-demand billing for variable workloads
- Implement proper indexing strategy
- Monitor read/write capacity units

## Future Enhancements

### Planned Features

1. **WebSocket Integration**: Real-time updates
2. **Batch Processing**: Multiple brand analysis
3. **Scheduled Analysis**: Automated monitoring
4. **Advanced Caching**: Redis integration
5. **Analytics Dashboard**: Usage metrics

### Scalability Considerations

- Implement SQS for queue-based processing
- Use Step Functions for complex workflows
- Consider Lambda@Edge for global deployment
- Implement proper monitoring with CloudWatch

This integration provides a robust foundation for connecting your Next.js frontend with AWS Lambda backend services, with comprehensive error handling and fallback mechanisms for reliable operation. 