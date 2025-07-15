import { Suspense } from 'react'
import BrandAnalysisTrigger from '@/components/BrandAnalysisTrigger'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Cloud, Database, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Lambda Integration Test - Aelora',
  description: 'Test the integration between Next.js frontend and AWS Lambda backend',
}

export default function LambdaTestPage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Lambda Integration Test
            </h1>
          </div>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Test the complete integration flow from Next.js frontend to AWS Lambda backend via API Gateway
          </p>
        </div>

        {/* Architecture Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Integration Architecture
            </CardTitle>
            <CardDescription>
              How the frontend communicates with your Lambda functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-blue-600 font-medium">Next.js</span>
                </div>
                <span className="text-sm text-muted-foreground">Frontend</span>
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-green-600 font-medium">API Route</span>
                </div>
                <span className="text-sm text-muted-foreground">/api/visibility</span>
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-orange-100 rounded-full">
                  <span className="text-orange-600 font-medium">API Gateway</span>
                </div>
                <span className="text-sm text-muted-foreground">AWS Proxy</span>
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-purple-100 rounded-full">
                  <span className="text-purple-600 font-medium">Lambda</span>
                </div>
                <span className="text-sm text-muted-foreground">Brand Analysis</span>
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-red-100 rounded-full">
                  <Database className="h-5 w-5 text-red-600" />
                </div>
                <span className="text-sm text-muted-foreground">DynamoDB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
            <CardDescription>
              Current environment configuration for Lambda integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AWS API Gateway URL</span>
                <Badge variant={process.env.NEXT_PUBLIC_AWS_API_URL ? 'default' : 'secondary'}>
                  {process.env.NEXT_PUBLIC_AWS_API_URL ? 'Configured' : 'Not Set'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Environment</span>
                <Badge variant="outline">
                  {process.env.NODE_ENV || 'development'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fallback Mode</span>
                <Badge variant="secondary">
                  {process.env.NEXT_PUBLIC_AWS_API_URL ? 'Lambda + Mock' : 'Mock Only'}
                </Badge>
              </div>
            </div>
            
            {!process.env.NEXT_PUBLIC_AWS_API_URL && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> NEXT_PUBLIC_AWS_API_URL is not configured. 
                  The system will use mock data for testing. Set this environment variable 
                  to enable actual Lambda integration.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Interface */}
        <Suspense fallback={<div className="text-center">Loading test interface...</div>}>
          <BrandAnalysisTrigger />
        </Suspense>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              How to integrate with the visibility API endpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">POST /api/visibility</h4>
              <div className="bg-muted p-3 rounded-md text-sm font-mono">
                <div className="text-muted-foreground">// Request body</div>
                <div>{`{`}</div>
                <div className="ml-2">{`"brandName": "Apple",`}</div>
                <div className="ml-2">{`"domain": "apple.com", // optional`}</div>
                <div className="ml-2">{`"industry": "Technology" // optional`}</div>
                <div>{`}`}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Response Format</h4>
              <div className="bg-muted p-3 rounded-md text-sm font-mono">
                <div className="text-muted-foreground">// Success response</div>
                <div>{`{`}</div>
                <div className="ml-2">{`"success": true,`}</div>
                <div className="ml-2">{`"data": {`}</div>
                <div className="ml-4">{`"brand": "Apple",`}</div>
                <div className="ml-4">{`"sentimentHistory": [...],`}</div>
                <div className="ml-4">{`"mentions": [...],`}</div>
                <div className="ml-4">{`"summary": "...",`}</div>
                <div className="ml-4">{`"averageSentiment": 0.75`}</div>
                <div className="ml-2">{`}`}</div>
                <div>{`}`}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Error Handling</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automatic fallback to mock data if Lambda is unavailable</li>
                <li>• 30-second timeout for Lambda requests</li>
                <li>• Comprehensive error logging for debugging</li>
                <li>• Graceful degradation with meaningful error messages</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Environment Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Setup</CardTitle>
            <CardDescription>
              Required environment variables for Lambda integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md text-sm font-mono">
              <div className="text-muted-foreground"># .env.local</div>
              <div className="mt-2">
                <div>NEXT_PUBLIC_AWS_API_URL=https://your-api-gateway-url.amazonaws.com/prod</div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                Replace <code className="bg-muted px-1 rounded">your-api-gateway-url</code> with 
                your actual API Gateway endpoint URL from AWS Console.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 