# Aelora Lambda Functions

This directory contains the source code for the AWS Lambda functions used by Aelora to analyze website content with AI assistance.

## Prerequisites

- Node.js 18 or higher
- AWS CLI configured with appropriate credentials
- Basic knowledge of TypeScript and AWS Lambda

## Project Structure

- `/src` - TypeScript source code
- `/dist` - Compiled JavaScript output (generated during build)
- `build.sh` - Script to build and package the Lambda function
- `deploy.sh` - Script to deploy the Lambda function to AWS
- `test-event.json` - Sample event for testing the Lambda function

## Setup and Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Build and Package

```bash
./build.sh
```

This will:
- Compile TypeScript to JavaScript
- Install production dependencies
- Create a `function.zip` deployment package

### 3. Deploy to AWS Lambda

```bash
./deploy.sh [FUNCTION_NAME]
```

Replace `[FUNCTION_NAME]` with your Lambda function name. If not provided, it will use the default Aelora function name.

## Environment Variables

The Lambda function requires the following environment variables:

- `OPENAI_API_KEY` - Your OpenAI API key for AI analysis
- `DYNAMODB_TABLE_NAME` - The DynamoDB table for storing analysis results (optional)

## Manual Testing

You can test the Lambda function locally before deployment:

```bash
# Compile the TypeScript code
npm run build

# Run the function with a test event
node -e "const { handler } = require('./dist/index'); const event = require('./test-event.json'); handler(event).then(response => console.log(JSON.stringify(response, null, 2)));"
```

## Troubleshooting

If you encounter any issues, check the following:

1. Make sure all environment variables are correctly set
2. Verify AWS credentials are properly configured
3. Check CloudWatch Logs for error messages
4. Ensure the Lambda execution role has appropriate permissions
5. Verify the deployment package size is within AWS Lambda limits 