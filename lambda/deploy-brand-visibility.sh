#!/bin/bash
# Brand Visibility Lambda deployment script

set -e

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Aelora Brand Visibility Lambda Deployment ===${NC}"

# Function name for brand visibility
FUNCTION_NAME="AeloraStack-BrandVisibilityFunction"

# Check if OpenAI API key is provided
if [ -z "$1" ]; then
  echo -e "${YELLOW}Please provide your OpenAI API key as the first argument:${NC}"
  echo -e "${YELLOW}./deploy-brand-visibility.sh YOUR_OPENAI_API_KEY${NC}"
  exit 1
fi

OPENAI_API_KEY=$1

echo -e "${GREEN}Building brand visibility Lambda function...${NC}"

# Build the function
./build.sh

echo -e "${YELLOW}Creating brand visibility Lambda function...${NC}"

# Create the Lambda function (this will fail if it already exists, which is fine)
aws lambda create-function \
  --function-name "${FUNCTION_NAME}" \
  --runtime nodejs18.x \
  --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/AeloraStack-AnalyzeContentFunctionServiceRole589819-fQmHtTlaZGP8 \
  --handler brand-visibility-handler.handler \
  --zip-file fileb://function.zip \
  --timeout 60 \
  --memory-size 512 \
  --environment Variables="{OPENAI_API_KEY=$OPENAI_API_KEY,BRAND_VISIBILITY_TABLE_NAME=BrandVisibilitySnapshots,BRAND_PROFILES_TABLE_NAME=BrandProfiles,AWS_REGION=us-east-1}" \
  --description "Aelora Brand Visibility Analysis Function" \
  2>/dev/null || echo -e "${YELLOW}Function already exists, updating...${NC}"

# Update function code
echo -e "${YELLOW}Updating Lambda function code...${NC}"
aws lambda update-function-code \
  --function-name "${FUNCTION_NAME}" \
  --zip-file fileb://function.zip

# Wait for function to update
echo -e "${YELLOW}Waiting for function update to complete...${NC}"
aws lambda wait function-updated \
  --function-name "${FUNCTION_NAME}"

# Update environment variables
echo -e "${YELLOW}Setting environment variables...${NC}"
aws lambda update-function-configuration \
  --function-name "${FUNCTION_NAME}" \
  --environment Variables="{OPENAI_API_KEY=$OPENAI_API_KEY,BRAND_VISIBILITY_TABLE_NAME=BrandVisibilitySnapshots,BRAND_PROFILES_TABLE_NAME=BrandProfiles,AWS_REGION=us-east-1}"

echo -e "${GREEN}Creating DynamoDB tables...${NC}"

# Create BrandVisibilitySnapshots table
aws dynamodb create-table \
  --table-name BrandVisibilitySnapshots \
  --attribute-definitions \
    AttributeName=brandName,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=brandName,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --tags Key=Project,Value=Aelora Key=Purpose,Value=BrandVisibility \
  2>/dev/null || echo -e "${YELLOW}BrandVisibilitySnapshots table already exists${NC}"

# Create BrandProfiles table
aws dynamodb create-table \
  --table-name BrandProfiles \
  --attribute-definitions \
    AttributeName=brandName,AttributeType=S \
  --key-schema \
    AttributeName=brandName,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --tags Key=Project,Value=Aelora Key=Purpose,Value=BrandProfiles \
  2>/dev/null || echo -e "${YELLOW}BrandProfiles table already exists${NC}"

echo -e "${GREEN}Setting up API Gateway integration...${NC}"

# Get the existing API Gateway ID
API_ID=$(aws apigateway get-rest-apis --query 'items[?name==`Aelora API`].id' --output text)

if [ -n "$API_ID" ] && [ "$API_ID" != "None" ]; then
  echo -e "${YELLOW}Found existing API Gateway: $API_ID${NC}"
  
  # Get root resource ID
  ROOT_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query 'items[?path==`/`].id' --output text)
  
  # Create brand-visibility resource
  RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_RESOURCE_ID \
    --path-part brand-visibility \
    --query 'id' --output text 2>/dev/null || \
    aws apigateway get-resources --rest-api-id $API_ID --query 'items[?pathPart==`brand-visibility`].id' --output text)
  
  echo -e "${YELLOW}Brand visibility resource ID: $RESOURCE_ID${NC}"
  
  # Create POST method
  aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --authorization-type NONE \
    2>/dev/null || echo -e "${YELLOW}POST method already exists${NC}"
  
  # Create OPTIONS method for CORS
  aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --authorization-type NONE \
    2>/dev/null || echo -e "${YELLOW}OPTIONS method already exists${NC}"
  
  # Get Lambda function ARN
  LAMBDA_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --query 'Configuration.FunctionArn' --output text)
  
  # Set up Lambda integration for POST
  aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations \
    2>/dev/null || echo -e "${YELLOW}POST integration already exists${NC}"
  
  # Add Lambda permission for API Gateway
  aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id api-gateway-invoke-brand-visibility \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:us-east-1:$(aws sts get-caller-identity --query Account --output text):$API_ID/*/*" \
    2>/dev/null || echo -e "${YELLOW}Lambda permission already exists${NC}"
  
  # Deploy the API
  aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod \
    --description "Brand visibility endpoint deployment"
  
  echo -e "${GREEN}API Gateway setup complete!${NC}"
  echo -e "${BLUE}Brand Visibility API Endpoint:${NC}"
  echo -e "${YELLOW}https://$API_ID.execute-api.us-east-1.amazonaws.com/prod/brand-visibility${NC}"
else
  echo -e "${RED}Could not find existing API Gateway. Please create one first.${NC}"
fi

echo -e "${GREEN}Brand Visibility Lambda deployment completed successfully!${NC}"
echo -e "${BLUE}Function Name: ${FUNCTION_NAME}${NC}"
echo -e "${BLUE}Test the function with:${NC}"
echo -e "${YELLOW}aws lambda invoke --function-name ${FUNCTION_NAME} --cli-binary-format raw-in-base64-out --payload file://test-brand-payload.json response.json${NC}" 