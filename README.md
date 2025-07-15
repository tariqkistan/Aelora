# Aelora - AI Search Optimization Platform

Aelora is a SaaS platform that analyzes website content and helps businesses improve their visibility on AI-driven search engines (Answer Engine Optimization or AEO).

## Features

- **Business Context Analysis**: Gather detailed business information to provide personalized AI search recommendations
- **AEO Content Analyzer**: Analyze a page's content structure, schema, and optimization for AI engines
- **AI Ranking Visualization**: See how your content performs against competitors in AI search results
- **Brand Visibility Dashboard**: Track sentiment trends, mentions, and AI visibility over time
- **Recommendation Engine**: Get actionable recommendations to improve your content for AI search engines

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
│   │   ├── analyze/ - Content analysis API
│   │   ├── ai-ranking/ - AI ranking simulation API
│   │   ├── visibility/ - Brand visibility API
│   │   └── compare/ - Competitor comparison API
│   ├── analyzer/ - Analyzer page with business questionnaire
│   ├── visibility/ - Brand visibility dashboard
│   ├── compare/ - Competitor comparison tool
│   ├── results/ - Analysis results page
│   └── page.tsx - Homepage
├── components/ - UI Components
│   ├── BusinessQuestionnaire.tsx - Multi-step business context form
│   ├── InputForm.tsx - URL input and analysis form
│   ├── ResultsContent.tsx - Analysis results display
│   ├── AIRankingVisualization.tsx - AI search ranking visualization
│   └── ui/ - shadcn/ui components
├── lib/ - Utility functions
│   ├── apiClient.ts - API client for making requests
│   ├── contentFetcher.ts - Fetches and processes website content
│   ├── contentAnalyzer.ts - Analyzes content for AI optimization
│   └── aiService.ts - AI-related utility functions
└── backend/ - Backend logic and prompts
    ├── prompts/ - AI prompt templates
    └── utils/ - Backend utility functions
```

## Development Setup

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Git

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
   
   # OpenAI API Key (for local development)
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Run the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Version Control Guidelines

We use Git for version control. Please follow these guidelines for a stable development workflow:

### Branch Strategy

- `main` - Production-ready code, always stable
- `development` - Integration branch for new features
- `feature/feature-name` - Feature branches for new development
- `bugfix/bug-name` - Bug fix branches
- `hotfix/fix-name` - Urgent fixes for production

### Development Workflow

1. Always create a new branch from `development` for your work:
   ```
   git checkout development
   git pull
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit regularly with descriptive messages:
   ```
   git add .
   git commit -m "feat: add business questionnaire validation"
   ```

3. Push your branch to the remote repository:
   ```
   git push -u origin feature/your-feature-name
   ```

4. Create a Pull Request to merge into `development`

5. After code review and testing, merge into `development`

6. Periodically, `development` is merged into `main` for production releases

### Commit Message Format

Follow conventional commits format:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code changes that neither fix bugs nor add features
- `test:` - Adding or updating tests
- `chore:` - Changes to build process or auxiliary tools

## Testing

### Running Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Manual Testing Checklist

Before submitting a PR, please verify:

1. Business questionnaire works through all steps
2. URL analysis works with and without business context
3. AI ranking visualization displays correctly
4. Responsive design works on mobile and desktop
5. No console errors appear during normal operation

## Deployment

### Frontend Deployment (Vercel)

1. Push your code to the `main` branch

2. Vercel will automatically deploy changes from the `main` branch

3. Ensure environment variables are configured in Vercel:
   - `NEXT_PUBLIC_AWS_API_URL`: Your AWS API Gateway URL

### Backend Deployment (AWS Lambda)

1. Navigate to the Lambda directory
   ```
   cd lambda
   ```

2. Build and deploy the Lambda function
   ```
   npm run build
   npm run deploy
   ```

## Troubleshooting

### Common Issues

1. **API Errors**:
   - Check AWS Lambda CloudWatch logs
   - Verify API Gateway CORS configuration
   - Ensure environment variables are set correctly

2. **Build Errors**:
   - Clear `.next` cache: `rm -rf .next`
   - Reinstall dependencies: `npm ci`
   - Check TypeScript errors: `npm run type-check`

3. **Content Analysis Issues**:
   - Verify the website is publicly accessible
   - Check for anti-bot protections on the target site
   - Try analyzing a specific page rather than the homepage

### Getting Help

If you encounter issues not covered here, please:

1. Check existing GitHub issues
2. Create a new issue with detailed reproduction steps
3. Include error messages and environment details

## License

This project is licensed under the MIT License - see the LICENSE file for details 