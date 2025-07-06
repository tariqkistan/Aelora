#!/bin/bash

# Deploy Brand Comparison Lambda Function
# This script builds and deploys the brand comparison functionality

set -e

echo "🚀 Deploying Brand Comparison Lambda Function..."

# Configuration
FUNCTION_NAME="aelora-brand-comparison"
REGION="us-east-1"
RUNTIME="nodejs18.x"
HANDLER="brand-comparison-handler.handler"
TIMEOUT=60
MEMORY_SIZE=512

# Build the TypeScript code
echo "📦 Building TypeScript code..."
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
if [ -f "brand-comparison.zip" ]; then
    rm brand-comparison.zip
fi

# Create zip with all necessary files
zip -r brand-comparison.zip \
    dist/brand-comparison-handler.js \
    dist/services/brand-comparison-service.js \
    dist/services/brand-comparison-storage.js \
    dist/types/brand-models.js \
    node_modules/ \
    package.json

echo "📦 Deployment package created: brand-comparison.zip"

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION >/dev/null 2>&1; then
    echo "🔄 Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://brand-comparison.zip \
        --region $REGION
    
    echo "⚙️ Updating function configuration..."
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --handler $HANDLER \
        --runtime $RUNTIME \
        --timeout $TIMEOUT \
        --memory-size $MEMORY_SIZE \
        --region $REGION
else
    echo "🆕 Creating new Lambda function..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/lambda-execution-role \
        --handler $HANDLER \
        --zip-file fileb://brand-comparison.zip \
        --timeout $TIMEOUT \
        --memory-size $MEMORY_SIZE \
        --region $REGION \
        --description "Brand comparison analysis using GPT-4"
fi

# Set environment variables
echo "🔧 Setting environment variables..."
aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment Variables="{
        OPENAI_API_KEY=$OPENAI_API_KEY,
        BRAND_COMPARISONS_TABLE=BrandComparisons,
        AWS_REGION=$REGION
    }" \
    --region $REGION

# Create or update DynamoDB table
echo "🗄️ Setting up DynamoDB table..."
TABLE_NAME="BrandComparisons"

if aws dynamodb describe-table --table-name $TABLE_NAME --region $REGION >/dev/null 2>&1; then
    echo "✅ DynamoDB table $TABLE_NAME already exists"
else
    echo "🆕 Creating DynamoDB table $TABLE_NAME..."
    aws dynamodb create-table \
        --table-name $TABLE_NAME \
        --attribute-definitions \
            AttributeName=comparisonId,AttributeType=S \
            AttributeName=timestamp,AttributeType=S \
        --key-schema \
            AttributeName=comparisonId,KeyType=HASH \
            AttributeName=timestamp,KeyType=RANGE \
        --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
        --region $REGION
    
    echo "⏳ Waiting for table to become active..."
    aws dynamodb wait table-exists --table-name $TABLE_NAME --region $REGION
    echo "✅ DynamoDB table $TABLE_NAME created successfully"
fi

# Create API Gateway if it doesn't exist
echo "🌐 Setting up API Gateway..."
API_NAME="aelora-brand-comparison-api"

# Check if API already exists
API_ID=$(aws apigateway get-rest-apis --region $REGION --query "items[?name=='$API_NAME'].id" --output text)

if [ -z "$API_ID" ] || [ "$API_ID" = "None" ]; then
    echo "🆕 Creating API Gateway..."
    API_ID=$(aws apigateway create-rest-api \
        --name $API_NAME \
        --description "Brand Comparison API" \
        --region $REGION \
        --query 'id' --output text)
    echo "✅ API Gateway created with ID: $API_ID"
else
    echo "✅ Using existing API Gateway: $API_ID"
fi

# Get root resource ID
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $REGION \
    --query 'items[?path==`/`].id' --output text)

# Create or get compare resource
COMPARE_RESOURCE_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $REGION \
    --query 'items[?pathPart==`compare`].id' --output text)

if [ -z "$COMPARE_RESOURCE_ID" ] || [ "$COMPARE_RESOURCE_ID" = "None" ]; then
    echo "🆕 Creating /compare resource..."
    COMPARE_RESOURCE_ID=$(aws apigateway create-resource \
        --rest-api-id $API_ID \
        --parent-id $ROOT_RESOURCE_ID \
        --path-part compare \
        --region $REGION \
        --query 'id' --output text)
fi

# Create POST method
echo "🔧 Setting up POST method..."
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $COMPARE_RESOURCE_ID \
    --http-method POST \
    --authorization-type NONE \
    --region $REGION >/dev/null 2>&1 || true

# Create OPTIONS method for CORS
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $COMPARE_RESOURCE_ID \
    --http-method OPTIONS \
    --authorization-type NONE \
    --region $REGION >/dev/null 2>&1 || true

# Set up Lambda integration
echo "🔗 Setting up Lambda integration..."
LAMBDA_ARN="arn:aws:lambda:$REGION:$(aws sts get-caller-identity --query Account --output text):function:$FUNCTION_NAME"

aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $COMPARE_RESOURCE_ID \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" \
    --region $REGION >/dev/null 2>&1 || true

# Set up CORS integration
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $COMPARE_RESOURCE_ID \
    --http-method OPTIONS \
    --type MOCK \
    --integration-http-method OPTIONS \
    --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
    --region $REGION >/dev/null 2>&1 || true

# Set up integration responses
aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $COMPARE_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Origin": "'\''*'\''",
        "method.response.header.Access-Control-Allow-Headers": "'\''Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\''",
        "method.response.header.Access-Control-Allow-Methods": "'\''OPTIONS,POST'\''"
    }' \
    --region $REGION >/dev/null 2>&1 || true

# Set up method responses
aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $COMPARE_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{
        "method.response.header.Access-Control-Allow-Origin": true,
        "method.response.header.Access-Control-Allow-Headers": true,
        "method.response.header.Access-Control-Allow-Methods": true
    }' \
    --region $REGION >/dev/null 2>&1 || true

# Add Lambda permission for API Gateway
echo "🔐 Adding Lambda permissions..."
aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id api-gateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:$(aws sts get-caller-identity --query Account --output text):$API_ID/*/*" \
    --region $REGION >/dev/null 2>&1 || true

# Deploy API
echo "🚀 Deploying API..."
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod \
    --region $REGION >/dev/null

# Get API endpoint
API_ENDPOINT="https://$API_ID.execute-api.$REGION.amazonaws.com/prod"

echo ""
echo "✅ Brand Comparison Lambda deployment completed!"
echo ""
echo "📋 Deployment Summary:"
echo "   Function Name: $FUNCTION_NAME"
echo "   Region: $REGION"
echo "   API Endpoint: $API_ENDPOINT/compare"
echo "   DynamoDB Table: $TABLE_NAME"
echo ""
echo "🧪 Test the API:"
echo "   curl -X POST $API_ENDPOINT/compare \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"brandA\": \"Apple\", \"brandB\": \"Microsoft\", \"industry\": \"Technology\"}'"
echo ""
echo "🔧 Next Steps:"
echo "   1. Make sure your OPENAI_API_KEY environment variable is set"
echo "   2. Test the API endpoint with the curl command above"
echo "   3. Check CloudWatch logs for any issues"
echo "   4. Update your frontend to use the new API endpoint"
echo ""

# Clean up
rm brand-comparison.zip

echo "🎉 Deployment script completed successfully!" 