# Aelora - AI Visibility Optimization Tool

Aelora is a SaaS tool that analyzes website content and helps businesses improve their visibility on AI-driven search engines (Answer Engine Optimization or AEO).

## Features

- **AEO Content Analyzer**: Analyze a page's content structure, schema, and optimization for AI engines.
- **AI Visibility Tracker**: Estimate how likely a page is to be picked up and answered by AI-driven search platforms.
- **Recommendation Engine**: Get actionable recommendations to improve your content for AI search engines.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) with Tailwind CSS and shadcn/ui
- **Backend**: AWS (Lambda, API Gateway, DynamoDB)
- **Language**: TypeScript
- **Deployment**: Vercel (frontend) and AWS Lambda (backend)
- **AI**: OpenAI GPT-4 for content analysis logic

## Project Structure

```
aelora/
├── app/ - Next.js app router pages
│   ├── api/ - API routes (proxy to AWS)
│   ├── analyzer/ - Analyzer page
│   ├── results/ - Results page
│   └── page.tsx - Homepage
├── components/ - UI Components
├── lambda/ - AWS Lambda functions
│   ├── src/ - TypeScript source code
│   ├── build.sh - Build script
│   └── deploy.sh - Deployment script
└── lib/ - Utility functions
```

## Setting Up the Frontend

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/aelora.git
   cd aelora
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # AWS API Gateway URL
   NEXT_PUBLIC_AWS_API_URL=https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/prod
   ```

4. Run the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Setting Up the Lambda Backend

### Prerequisites

- AWS CLI installed and configured
- Node.js 18.x or later
- npm or yarn

### Deployment Steps

1. Navigate to the Lambda directory
   ```
   cd lambda
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Build and package the Lambda function
   ```
   ./build.sh
   ```
   This will create a `function.zip` file containing the compiled code and dependencies.

4. Deploy the function to AWS Lambda
   ```
   ./deploy.sh YOUR_LAMBDA_FUNCTION_NAME
   ```
   Replace `YOUR_LAMBDA_FUNCTION_NAME` with your actual Lambda function name.

5. Configure Lambda environment variables in the AWS Console:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `DYNAMODB_TABLE_NAME`: Your DynamoDB table for storing analysis results

## API Integration Options

Aelora provides two options for calling the analysis API:

1. **Next.js API Proxy**: The frontend calls a Next.js API route, which forwards the request to the AWS API Gateway. This is the default option.

2. **Direct AWS API**: The frontend calls the AWS API Gateway directly. This can be toggled on in the UI.

## Deployment

### Frontend Deployment (Vercel)

1. Push your code to a Git repository

2. Connect your repository to Vercel

3. Configure environment variables in Vercel:
   - `NEXT_PUBLIC_AWS_API_URL`: Your AWS API Gateway URL

4. Deploy

### Backend Deployment (AWS Lambda)

Follow the Lambda deployment steps above.

## Troubleshooting

If you encounter issues with the Lambda function:

1. Check the CloudWatch Logs in AWS Console
2. Verify that the handler name is set correctly to `index.handler`
3. Ensure all environment variables are set properly
4. Check that the correct runtime (Node.js 18.x) is selected
5. Verify CORS headers if making requests from a browser

## License

This project is licensed under the MIT License - see the LICENSE file for details 