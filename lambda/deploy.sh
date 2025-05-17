#!/bin/bash
# Lambda deployment script

set -e

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function name from argument or default
FUNCTION_NAME=${1:-"AeloraStack-AnalyzeContentFunction500EE4D1-QD1gwucYgLjZ"}

echo -e "${GREEN}Deploying Lambda function to AWS...${NC}"
echo -e "${YELLOW}Function name: ${FUNCTION_NAME}${NC}"

# Check if function.zip exists
if [ ! -f "function.zip" ]; then
  echo -e "${RED}Error: function.zip not found!${NC}"
  echo -e "${YELLOW}Please run ./build.sh first to create the deployment package.${NC}"
  exit 1
fi

# Update Lambda function code
echo -e "${YELLOW}Updating Lambda function code...${NC}"
aws lambda update-function-code \
  --function-name "${FUNCTION_NAME}" \
  --zip-file fileb://function.zip

# Wait for function to update
echo -e "${YELLOW}Waiting for function update to complete...${NC}"
aws lambda wait function-updated \
  --function-name "${FUNCTION_NAME}"

echo -e "${GREEN}Lambda function deployment completed successfully!${NC}" 