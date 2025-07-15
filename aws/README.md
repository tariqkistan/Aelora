# AWS EventBridge Automated Brand Scanning

This directory contains the AWS infrastructure setup for automated weekly brand scanning using EventBridge, Lambda, and DynamoDB.

## 🚀 Quick Start

### Prerequisites
- AWS CLI installed and configured
- Appropriate AWS permissions (Lambda, EventBridge, DynamoDB, CloudWatch, SNS, IAM)
- Email address for notifications

### One-Command Deployment
```bash
./deploy-eventbridge.sh
```

The script will:
1. ✅ Validate your AWS configuration
2. ✅ Deploy the CloudFormation stack
3. ✅ Create monitoring dashboard
4. ✅ Test the EventBridge rule
5. ✅ Show next steps and management commands

## 📁 Files Overview

| File | Description |
|------|-------------|
| `eventbridge-stack.yaml` | Complete CloudFormation template |
| `deploy-eventbridge.sh` | Automated deployment script |
| `AWS_EVENTBRIDGE_SETUP.md` | Comprehensive setup guide |
| `README.md` | This file |

## 🏗️ Architecture

```
EventBridge Rule (cron: 0 9 ? * MON *)
    ↓
Lambda Function (aelora-visibility-lambda)
    ↓
DynamoDB Table (brand scans storage)
    ↓
CloudWatch (metrics + logging)
    ↓
SNS (email notifications)
```

## ⚙️ Configuration

### Brand Configuration
Brands are configured in AWS Systems Manager Parameter Store:

```bash
aws ssm put-parameter \
    --name "/aelora/brands/config" \
    --value '{
        "brands": [
            {
                "brandName": "Apple",
                "domain": "apple.com",
                "industry": "Technology",
                "enabled": true
            },
            {
                "brandName": "Tesla",
                "domain": "tesla.com",
                "industry": "Automotive",
                "enabled": true
            }
        ]
    }' \
    --overwrite
```

### Schedule Configuration
The default schedule is **every Monday at 9 AM UTC**:
- Cron expression: `cron(0 9 ? * MON *)`
- Timezone: UTC (configurable)

To change the schedule, modify the `ScheduleExpression` in the CloudFormation template.

## 🔧 Management Commands

### Deploy/Update Stack
```bash
# Deploy with defaults
./deploy-eventbridge.sh

# Deploy with custom parameters
./deploy-eventbridge.sh -s my-stack -r us-west-2 -e admin@mycompany.com

# Test existing deployment
./deploy-eventbridge.sh --test-only
```

### Monitor Scans
```bash
# View recent scans
aws dynamodb scan --table-name aelora-visibility-lambda-scans --max-items 5

# Check EventBridge rule status
aws events describe-rule --name aelora-visibility-lambda-weekly-scan

# View Lambda logs
aws logs tail /aws/lambda/aelora-visibility-lambda --follow
```

### Test Manual Trigger
```bash
# Trigger a test scan
aws events put-events --entries '[{
    "Source": "custom.aelora.test",
    "DetailType": "Test Scheduled Scan",
    "Detail": "{\"source\": \"eventbridge-scheduled\", \"brands\": [{\"brandName\": \"Apple\", \"domain\": \"apple.com\", \"industry\": \"Technology\"}]}"
}]'
```

## 📊 Monitoring

### CloudWatch Dashboard
Access the dashboard at: [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/home#dashboards:name=Aelora-Brand-Scanning)

**Metrics tracked:**
- Daily scan results (completed, failed, skipped)
- Lambda performance (duration, errors, invocations)
- Custom brand scan metrics

### Alarms
- **Scan Failures**: Alerts when scheduled scans fail
- **High Duration**: Alerts when Lambda execution time is excessive

### Logs
- **Lambda Logs**: `/aws/lambda/aelora-visibility-lambda`
- **EventBridge Logs**: `/aws/events/aelora-visibility-lambda-weekly-scan`

## 🛡️ Security

### IAM Permissions
The Lambda function has minimal required permissions:
- DynamoDB: Read/write to scan results table
- CloudWatch: Publish custom metrics
- Parameter Store: Read brand configurations
- Logs: Write to CloudWatch logs

### Data Protection
- **TTL**: Scan results automatically expire after 90 days
- **Encryption**: All data encrypted at rest (DynamoDB, Parameter Store)
- **Access Control**: IAM roles restrict access to authorized services only

## 💰 Cost Optimization

### Estimated Monthly Costs
- **Lambda**: ~$0.50 (4 weekly executions, 3 brands each)
- **DynamoDB**: ~$0.25 (on-demand pricing)
- **EventBridge**: ~$0.10 (monthly rule executions)
- **CloudWatch**: ~$0.15 (logs and metrics)
- **Total**: ~$1.00/month

### Cost Reduction Tips
1. **Optimize Lambda memory**: Start with 512MB, adjust based on performance
2. **Use TTL**: Automatic cleanup reduces DynamoDB storage costs
3. **Batch operations**: Process multiple brands in single Lambda execution
4. **Monitor usage**: Use CloudWatch to track actual costs

## 🔄 Duplicate Prevention

The system prevents duplicate scans using multiple strategies:

1. **Timestamp checking**: Skips brands scanned within 6 days
2. **Unique scan IDs**: Prevents duplicate database entries
3. **Conditional writes**: DynamoDB conditional puts
4. **TTL cleanup**: Automatic removal of old records

## 🚨 Troubleshooting

### Common Issues

**EventBridge rule not triggering:**
```bash
# Check rule status
aws events describe-rule --name aelora-visibility-lambda-weekly-scan

# Verify Lambda permissions
aws lambda get-policy --function-name aelora-visibility-lambda
```

**Lambda function errors:**
```bash
# Check recent errors
aws logs filter-log-events \
    --log-group-name /aws/lambda/aelora-visibility-lambda \
    --filter-pattern "ERROR"
```

**DynamoDB access issues:**
```bash
# Test table access
aws dynamodb describe-table --table-name aelora-visibility-lambda-scans
```

### Debug Mode
Enable debug logging by setting Lambda environment variable:
```bash
aws lambda update-function-configuration \
    --function-name aelora-visibility-lambda \
    --environment Variables='{LOG_LEVEL=DEBUG}'
```

## 🔄 Updates and Maintenance

### Update Lambda Code
```bash
# Package new code
zip -r function.zip index.py

# Update function
aws lambda update-function-code \
    --function-name aelora-visibility-lambda \
    --zip-file fileb://function.zip
```

### Update Stack
```bash
# Modify eventbridge-stack.yaml, then:
./deploy-eventbridge.sh
```

### Health Checks
Set up weekly health checks to ensure system reliability:
```bash
# Check system health
aws lambda invoke \
    --function-name aelora-visibility-lambda \
    --payload '{"source": "health-check"}' \
    response.json
```

## 📞 Support

### Getting Help
1. Check CloudWatch logs for error details
2. Review the comprehensive setup guide: `AWS_EVENTBRIDGE_SETUP.md`
3. Test with manual triggers to isolate issues
4. Monitor CloudWatch dashboard for system health

### Useful Resources
- [AWS EventBridge Documentation](https://docs.aws.amazon.com/eventbridge/)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

## 🎯 Next Steps

After deployment:
1. ✅ Confirm SNS email subscription
2. ✅ Update brand configurations in Parameter Store
3. ✅ Monitor first scheduled run (Monday 9 AM UTC)
4. ✅ Set up additional CloudWatch alarms as needed
5. ✅ Consider adding more brands to the configuration

Your automated brand scanning system is now ready for production! 🚀 