#!/bin/bash
# Lambda deployment script with OpenAI API key

set -e

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function name from argument or default
FUNCTION_NAME=${1:-"AeloraStack-AnalyzeContentFunction500EE4D1-QD1gwucYgLjZ"}

# Prompt for OpenAI API key
echo -e "${YELLOW}Please enter your OpenAI API key (it will not be shown as you type):${NC}"
read -s OPENAI_API_KEY

if [ -z "$OPENAI_API_KEY" ]; then
  echo -e "${RED}Error: OpenAI API key is required!${NC}"
  exit 1
fi

echo -e "${GREEN}OpenAI API key collected. Building and deploying Lambda function...${NC}"

# Build the function
echo -e "${YELLOW}Building Lambda function...${NC}"
./build.sh

# Update Lambda function code
echo -e "${YELLOW}Updating Lambda function code...${NC}"
aws lambda update-function-code \
  --function-name "${FUNCTION_NAME}" \
  --zip-file fileb://function.zip

# Wait for function to update
echo -e "${YELLOW}Waiting for function update to complete...${NC}"
aws lambda wait function-updated \
  --function-name "${FUNCTION_NAME}"

# Update Lambda environment variables with OpenAI API key
echo -e "${YELLOW}Setting OpenAI API key in Lambda environment variables...${NC}"
aws lambda update-function-configuration \
  --function-name "${FUNCTION_NAME}" \
  --environment "Variables={OPENAI_API_KEY=$OPENAI_API_KEY}"

echo -e "${GREEN}Lambda function deployment completed successfully!${NC}"
echo -e "${GREEN}OpenAI API key has been set in Lambda environment variables.${NC}"
echo -e "${YELLOW}Note: Your website analysis should now use real OpenAI-powered AI analysis.${NC}" 