#!/bin/bash

# Aelora EventBridge Deployment Script
# This script deploys the automated weekly brand scanning infrastructure

set -e  # Exit on any error

# Configuration
STACK_NAME="aelora-eventbridge"
TEMPLATE_FILE="eventbridge-stack.yaml"
REGION="us-east-1"
LAMBDA_FUNCTION_NAME="aelora-visibility-lambda"
NOTIFICATION_EMAIL="admin@aelora.com"
ENVIRONMENT="production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if AWS CLI is installed and configured
check_aws_cli() {
    print_status "Checking AWS CLI configuration..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "AWS CLI is configured"
}

# Function to validate CloudFormation template
validate_template() {
    print_status "Validating CloudFormation template..."
    
    if ! aws cloudformation validate-template --template-body file://$TEMPLATE_FILE --region $REGION &> /dev/null; then
        print_error "CloudFormation template validation failed"
        exit 1
    fi
    
    print_success "Template validation passed"
}

# Function to check if stack exists
stack_exists() {
    aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null
}

# Function to deploy the stack
deploy_stack() {
    print_status "Deploying EventBridge stack..."
    
    # Get user input for parameters
    read -p "Lambda Function Name [$LAMBDA_FUNCTION_NAME]: " input_lambda_name
    LAMBDA_FUNCTION_NAME=${input_lambda_name:-$LAMBDA_FUNCTION_NAME}
    
    read -p "Notification Email [$NOTIFICATION_EMAIL]: " input_email
    NOTIFICATION_EMAIL=${input_email:-$NOTIFICATION_EMAIL}
    
    read -p "Environment [$ENVIRONMENT]: " input_env
    ENVIRONMENT=${input_env:-$ENVIRONMENT}
    
    # Deploy the stack
    if stack_exists; then
        print_status "Stack exists, updating..."
        OPERATION="update"
    else
        print_status "Stack does not exist, creating..."
        OPERATION="create"
    fi
    
    aws cloudformation deploy \
        --template-file $TEMPLATE_FILE \
        --stack-name $STACK_NAME \
        --parameter-overrides \
            LambdaFunctionName=$LAMBDA_FUNCTION_NAME \
            NotificationEmail=$NOTIFICATION_EMAIL \
            Environment=$ENVIRONMENT \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION \
        --no-fail-on-empty-changeset
    
    if [ $? -eq 0 ]; then
        print_success "Stack deployment completed successfully"
    else
        print_error "Stack deployment failed"
        exit 1
    fi
}

# Function to get stack outputs
get_stack_outputs() {
    print_status "Retrieving stack outputs..."
    
    aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs' \
        --output table
}

# Function to test the EventBridge rule
test_eventbridge_rule() {
    print_status "Testing EventBridge rule..."
    
    # Get the Lambda function ARN from stack outputs
    LAMBDA_ARN=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`LambdaFunctionArn`].OutputValue' \
        --output text)
    
    if [ -z "$LAMBDA_ARN" ]; then
        print_error "Could not retrieve Lambda function ARN"
        return 1
    fi
    
    # Send a test event
    aws events put-events \
        --entries '[
            {
                "Source": "custom.aelora.test",
                "DetailType": "Test Scheduled Scan",
                "Detail": "{\"source\": \"eventbridge-scheduled\", \"brands\": [{\"brandName\": \"Apple\", \"domain\": \"apple.com\", \"industry\": \"Technology\"}]}"
            }
        ]' \
        --region $REGION
    
    if [ $? -eq 0 ]; then
        print_success "Test event sent successfully"
    else
        print_error "Failed to send test event"
        return 1
    fi
}

# Function to setup monitoring dashboard
setup_monitoring() {
    print_status "Setting up CloudWatch dashboard..."
    
    # Create dashboard JSON
    cat > dashboard.json << EOF
{
    "widgets": [
        {
            "type": "metric",
            "x": 0,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    ["Aelora/BrandScans", "ScanCount", "Status", "completed"],
                    [".", ".", ".", "failure"],
                    [".", ".", ".", "skipped"]
                ],
                "period": 86400,
                "stat": "Sum",
                "region": "$REGION",
                "title": "Daily Scan Results"
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    ["AWS/Lambda", "Duration", "FunctionName", "$LAMBDA_FUNCTION_NAME"],
                    [".", "Errors", ".", "."],
                    [".", "Invocations", ".", "."]
                ],
                "period": 300,
                "stat": "Average",
                "region": "$REGION",
                "title": "Lambda Performance"
            }
        }
    ]
}
EOF
    
    # Create the dashboard
    aws cloudwatch put-dashboard \
        --dashboard-name "Aelora-Brand-Scanning" \
        --dashboard-body file://dashboard.json \
        --region $REGION
    
    if [ $? -eq 0 ]; then
        print_success "CloudWatch dashboard created"
        rm dashboard.json
    else
        print_error "Failed to create CloudWatch dashboard"
        rm dashboard.json
        return 1
    fi
}

# Function to display next steps
show_next_steps() {
    print_success "Deployment completed successfully!"
    echo
    echo "🎯 Next Steps:"
    echo "1. Check your email and confirm the SNS subscription"
    echo "2. Update brand configurations in Parameter Store:"
    echo "   aws ssm put-parameter --name '/aelora/brands/config' --value '{...}' --overwrite"
    echo "3. Monitor the first scheduled run on Monday at 9 AM UTC"
    echo "4. View CloudWatch dashboard: https://console.aws.amazon.com/cloudwatch/home?region=$REGION#dashboards:name=Aelora-Brand-Scanning"
    echo "5. Check Lambda logs: https://console.aws.amazon.com/cloudwatch/home?region=$REGION#logsV2:log-groups/log-group/%2Faws%2Flambda%2F$LAMBDA_FUNCTION_NAME"
    echo
    echo "📊 Monitoring:"
    echo "- CloudWatch Dashboard: Aelora-Brand-Scanning"
    echo "- Lambda Function: $LAMBDA_FUNCTION_NAME"
    echo "- EventBridge Rule: $LAMBDA_FUNCTION_NAME-weekly-scan"
    echo "- DynamoDB Table: $LAMBDA_FUNCTION_NAME-scans"
    echo
    echo "🔧 Management Commands:"
    echo "- Test the rule: aws events put-events --entries '[{\"Source\":\"test\",\"DetailType\":\"Test\",\"Detail\":\"{}\"}]'"
    echo "- View recent scans: aws dynamodb scan --table-name $LAMBDA_FUNCTION_NAME-scans --max-items 5"
    echo "- Check rule status: aws events describe-rule --name $LAMBDA_FUNCTION_NAME-weekly-scan"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -s, --stack-name    CloudFormation stack name (default: $STACK_NAME)"
    echo "  -r, --region        AWS region (default: $REGION)"
    echo "  -f, --function-name Lambda function name (default: $LAMBDA_FUNCTION_NAME)"
    echo "  -e, --email         Notification email (default: $NOTIFICATION_EMAIL)"
    echo "  --environment       Environment (default: $ENVIRONMENT)"
    echo "  --test-only         Only run the test, don't deploy"
    echo "  --no-dashboard      Skip dashboard creation"
    echo
    echo "Examples:"
    echo "  $0                                    # Deploy with defaults"
    echo "  $0 -s my-stack -r us-west-2          # Deploy to different region"
    echo "  $0 --test-only                       # Only test existing deployment"
}

# Parse command line arguments
TEST_ONLY=false
NO_DASHBOARD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -s|--stack-name)
            STACK_NAME="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -f|--function-name)
            LAMBDA_FUNCTION_NAME="$2"
            shift 2
            ;;
        -e|--email)
            NOTIFICATION_EMAIL="$2"
            shift 2
            ;;
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --test-only)
            TEST_ONLY=true
            shift
            ;;
        --no-dashboard)
            NO_DASHBOARD=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo "🚀 Aelora EventBridge Deployment Script"
    echo "======================================="
    echo
    
    # Check prerequisites
    check_aws_cli
    
    if [ "$TEST_ONLY" = true ]; then
        print_status "Running in test-only mode"
        test_eventbridge_rule
        exit 0
    fi
    
    # Validate template
    if [ -f "$TEMPLATE_FILE" ]; then
        validate_template
    else
        print_error "Template file $TEMPLATE_FILE not found"
        exit 1
    fi
    
    # Deploy stack
    deploy_stack
    
    # Get outputs
    get_stack_outputs
    
    # Setup monitoring dashboard
    if [ "$NO_DASHBOARD" = false ]; then
        setup_monitoring
    fi
    
    # Test the deployment
    test_eventbridge_rule
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@" 