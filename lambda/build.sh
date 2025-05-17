#!/bin/bash
# Lambda build and packaging script

set -e

# Echo commands for debugging
set -x

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Lambda function build process...${NC}"

# Step 1: Install dependencies
echo -e "${YELLOW}Installing npm packages...${NC}"
npm install

# Step 2: Clean and build the TypeScript code
echo -e "${YELLOW}Building TypeScript code...${NC}"
npm run clean
npm run build

# Step 3: Install production dependencies in the dist folder
echo -e "${YELLOW}Installing production dependencies...${NC}"
mkdir -p dist/node_modules
cp package.json dist/
cd dist
npm install --only=production
cd ..

# Step 4: Create a deployment package
echo -e "${YELLOW}Creating deployment package...${NC}"
cd dist
zip -r ../function.zip .
cd ..

echo -e "${GREEN}Lambda function build process completed!${NC}"
echo -e "${YELLOW}Deployment package: function.zip${NC}"

# Step 5: Output file size information
echo -e "${YELLOW}Deployment package size:${NC}"
du -h function.zip

echo -e "${GREEN}Ready to deploy to AWS Lambda!${NC}"
echo "Use the following command to deploy:"
echo -e "${YELLOW}aws lambda update-function-code --function-name YOUR_FUNCTION_NAME --zip-file fileb://function.zip${NC}" 