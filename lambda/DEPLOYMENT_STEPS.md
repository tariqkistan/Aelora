# Lambda Deployment Steps

Follow these step-by-step instructions to deploy your new Lambda function code to AWS.

## 1. Build the Lambda Function

1. Navigate to the lambda directory
   ```
   cd lambda
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Build and package the function
   ```
   ./build.sh
   ```
   This will create a file called `function.zip` in the lambda directory.

## 2. Update the Lambda Function in AWS Console

1. Open the [AWS Lambda Console](https://console.aws.amazon.com/lambda/home)
2. Find and select your Lambda function (`AeloraStack-AnalyzeContentFunction500EE4D1-QD1gwucYgLjZ`)
3. In the "Code" tab, look for the "Upload from" dropdown and select ".zip file"
4. Click "Upload" and select the `function.zip` file you created
5. Click "Save"

## 3. Update the Lambda Function Handler

1. In the Lambda function configuration page, go to the "Runtime settings" section
2. Click "Edit"
3. Change the Handler to `index.handler` (this should match the exported handler in your index.ts file)
4. Click "Save"

## 4. Set Environment Variables

1. Go to the "Configuration" tab
2. Select "Environment variables"
3. Click "Edit"
4. Make sure you have the following environment variables:
   - Key: `OPENAI_API_KEY`, Value: your OpenAI API key
   - Key: `DYNAMODB_TABLE_NAME`, Value: your DynamoDB table name (e.g., `aelora-analysis-history`)
5. Click "Save"

## 5. Test the Lambda Function

1. Go to the "Test" tab
2. Create a new test event if you don't have one already
   - Name it "TestAnalyzeContent"
   - Use the following JSON as the event body:
     ```json
     {
       "queryStringParameters": {
         "url": "https://www.example.com"
       },
       "headers": {
         "content-type": "application/json",
         "origin": "https://aelora.vercel.app"
       }
     }
     ```
3. Click "Test"
4. Check the execution results
   - If successful, you should see a 200 status code and analysis results in the response
   - If there's an error, check the logs for details

## 6. Alternative Deployment Using AWS CLI

You can also deploy using the AWS CLI directly:

```bash
# From the lambda directory
./deploy.sh AeloraStack-AnalyzeContentFunction500EE4D1-QD1gwucYgLjZ
```

This will update the Lambda function code with your new package.

## 7. Update API Gateway Configuration (if needed)

If your API Gateway configuration needs updating:

1. Open the [API Gateway Console](https://console.aws.amazon.com/apigateway)
2. Select your API
3. Go to Resources
4. Select the analyze method (GET or POST)
5. Click "Integration Request"
6. Verify that it's pointing to your Lambda function
7. Click "Deploy API" to apply changes

## 8. Verify the Integration

1. Open Postman or use curl to make a request to your API Gateway endpoint
2. Include a URL query parameter in the request
3. Verify that you receive the expected analysis results

## 9. Troubleshooting

If you encounter issues:

1. Check the CloudWatch Logs for your Lambda function
2. Verify that the handler name matches the name in your code
3. Ensure all required environment variables are set
4. Check that the Lambda execution role has the necessary permissions
5. Verify CORS headers if making requests from a browser 