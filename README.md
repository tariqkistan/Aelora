# Aelora - AI Visibility Optimization Tool

Aelora is a SaaS tool that analyzes website content and helps businesses improve their visibility on AI-driven search engines (Answer Engine Optimization or AEO).

## Features

- **AEO Content Analyzer**: Analyze a page's content structure, schema, and optimization for AI engines.
- **AI Visibility Tracker**: Estimate how likely a page is to be picked up and answered by AI-driven search platforms.
- **Recommendation Engine**: Get actionable recommendations to improve your content for AI search engines.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) with Tailwind CSS and shadcn/ui
- **Backend**: AWS (Lambda, API Gateway, DynamoDB or RDS, S3)
- **Language**: TypeScript
- **Deployment**: AWS Amplify or Vercel
- **AI**: Claude or OpenAI for content analysis logic

## Getting Started

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
   # or
   yarn
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # AWS Configuration
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key

   # API Endpoints
   NEXT_PUBLIC_API_URL=http://localhost:3000/api

   # AI Provider (OpenAI or Claude)
   OPENAI_API_KEY=your-openai-api-key
   ANTHROPIC_API_KEY=your-anthropic-api-key

   # Database
   DYNAMODB_TABLE_NAME=aelora-analysis-history
   ```

4. Run the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
aelora/
├── app/ - Next.js app router pages
│   ├── api/ - API routes
│   │   └── analyze/ - Analysis API endpoint
│   ├── analyzer/ - Analyzer page
│   ├── results/ - Results page
│   └── page.tsx - Homepage
├── components/ - UI Components
│   ├── ui/ - shadcn/ui components
│   ├── Navbar.tsx - Navigation component
│   ├── Footer.tsx - Footer component
│   ├── InputForm.tsx - URL input form
│   ├── ScoreCard.tsx - Score display component
│   ├── ReportCard.tsx - Recommendations display
│   └── Loader.tsx - Loading indicator
├── lib/ - Utility functions
│   ├── contentFetcher.ts - URL content fetching
│   ├── contentAnalyzer.ts - Content analysis logic
│   └── utils.ts - Utility functions
└── public/ - Static assets
```

## AWS Infrastructure (Planned)

- AWS Lambda function for content analysis
- API Gateway endpoint for the Lambda function
- DynamoDB for storing analysis history
- S3 for storing uploaded reports or snapshots
- IAM roles and policies for secure access

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [AWS](https://aws.amazon.com/) 