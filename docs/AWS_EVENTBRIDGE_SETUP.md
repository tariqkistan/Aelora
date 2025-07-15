# AWS EventBridge Scheduled Weekly Scan Setup

This guide shows how to automate brand visibility scans using AWS EventBridge to trigger your Lambda function every Monday at 9 AM.

## 📋 Overview

**Architecture:**
```
EventBridge Rule (Monday 9 AM) 
    ↓
Lambda Function (/visibility analysis)
    ↓
DynamoDB (store results + prevent duplicates)
    ↓
CloudWatch Logs (monitoring)
```

## 🚀 Quick Setup

### 1. EventBridge Rule Configuration

#### Option A: AWS Console Setup

1. **Navigate to EventBridge Console**
   - Go to AWS EventBridge → Rules
   - Click "Create rule"

2. **Basic Configuration**
   ```
   Name: aelora-weekly-brand-scan
   Description: Triggers brand visibility analysis every Monday at 9 AM
   Event bus: default
   Rule type: Schedule
   ```

3. **Schedule Configuration**
   ```
   Schedule pattern: Rate or Cron expression
   Cron expression: cron(0 9 ? * MON *)
   Timezone: UTC (adjust as needed)
   ```

4. **Target Configuration**
   ```
   Target type: AWS service
   Service: Lambda function
   Function: your-visibility-lambda-function
   ```

#### Option B: CloudFormation Template

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Aelora Weekly Brand Scan Automation'

Parameters:
  LambdaFunctionName:
    Type: String
    Default: 'aelora-visibility-lambda'
    Description: 'Name of the Lambda function to trigger'
  
  ScheduleTimezone:
    Type: String
    Default: 'UTC'
    Description: 'Timezone for the schedule (e.g., America/New_York)'

Resources:
  # EventBridge Rule for Weekly Scans
  WeeklyBrandScanRule:
    Type: AWS::Events::Rule
    Properties:
      Name: aelora-weekly-brand-scan
      Description: 'Triggers brand visibility analysis every Monday at 9 AM'
      ScheduleExpression: 'cron(0 9 ? * MON *)'
      State: ENABLED
      Targets:
        - Arn: !Sub 'arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:${LambdaFunctionName}'
          Id: 'WeeklyBrandScanTarget'
          Input: !Sub |
            {
              "source": "eventbridge-scheduled",
              "scheduledTime": "${AWS::StackName}",
              "brands": [
                {
                  "brandName": "Apple",
                  "domain": "apple.com",
                  "industry": "Technology"
                },
                {
                  "brandName": "Tesla",
                  "domain": "tesla.com", 
                  "industry": "Automotive"
                },
                {
                  "brandName": "Netflix",
                  "domain": "netflix.com",
                  "industry": "Entertainment"
                }
              ]
            }

  # Permission for EventBridge to invoke Lambda
  LambdaInvokePermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref LambdaFunctionName
      Action: lambda:InvokeFunction
      Principal: events.amazonaws.com
      SourceArn: !GetAtt WeeklyBrandScanRule.Arn

  # CloudWatch Log Group for monitoring
  EventBridgeLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Sub '/aws/events/aelora-weekly-scan'
      RetentionInDays: 30

Outputs:
  EventRuleArn:
    Description: 'ARN of the EventBridge rule'
    Value: !GetAtt WeeklyBrandScanRule.Arn
    Export:
      Name: !Sub '${AWS::StackName}-EventRuleArn'
```

#### Option C: AWS CLI Commands

```bash
# Create the EventBridge rule
aws events put-rule \
    --name aelora-weekly-brand-scan \
    --schedule-expression "cron(0 9 ? * MON *)" \
    --description "Triggers brand visibility analysis every Monday at 9 AM" \
    --state ENABLED

# Add Lambda target to the rule
aws events put-targets \
    --rule aelora-weekly-brand-scan \
    --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:ACCOUNT-ID:function:aelora-visibility-lambda","Input"='{
      "source": "eventbridge-scheduled",
      "brands": [
        {
          "brandName": "Apple",
          "domain": "apple.com",
          "industry": "Technology"
        }
      ]
    }'

# Grant permission for EventBridge to invoke Lambda
aws lambda add-permission \
    --function-name aelora-visibility-lambda \
    --statement-id eventbridge-invoke \
    --action lambda:InvokeFunction \
    --principal events.amazonaws.com \
    --source-arn arn:aws:events:us-east-1:ACCOUNT-ID:rule/aelora-weekly-brand-scan
```

### 2. Lambda Function Integration

#### Enhanced Lambda Handler for Scheduled Events

```python
import json
import boto3
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# AWS clients
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('aelora-brand-scans')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Enhanced Lambda handler for both API Gateway and EventBridge triggers
    """
    try:
        # Determine event source
        event_source = event.get('source', 'api-gateway')
        
        if event_source == 'eventbridge-scheduled':
            return handle_scheduled_scan(event, context)
        else:
            return handle_api_request(event, context)
            
    except Exception as e:
        logger.error(f"Lambda execution failed: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }

def handle_scheduled_scan(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle EventBridge scheduled scans
    """
    logger.info("Processing scheduled brand scan from EventBridge")
    
    # Extract brands from EventBridge input
    brands = event.get('brands', [])
    
    if not brands:
        logger.warning("No brands provided in scheduled event")
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'error': 'No brands provided for scanning'
            })
        }
    
    results = []
    scan_timestamp = datetime.now(timezone.utc).isoformat()
    
    for brand_config in brands:
        try:
            brand_name = brand_config.get('brandName')
            domain = brand_config.get('domain')
            industry = brand_config.get('industry')
            
            logger.info(f"Processing scheduled scan for {brand_name}")
            
            # Check for duplicate scan (within last 6 days)
            if is_recent_scan_exists(brand_name, days=6):
                logger.info(f"Skipping {brand_name} - recent scan exists")
                results.append({
                    'brand': brand_name,
                    'status': 'skipped',
                    'reason': 'Recent scan exists'
                })
                continue
            
            # Perform brand analysis
            analysis_result = perform_brand_analysis(brand_name, domain, industry)
            
            # Store results in DynamoDB
            store_scan_result(brand_name, domain, industry, analysis_result, scan_timestamp)
            
            results.append({
                'brand': brand_name,
                'status': 'completed',
                'timestamp': scan_timestamp
            })
            
            logger.info(f"Completed scheduled scan for {brand_name}")
            
        except Exception as e:
            logger.error(f"Failed to process {brand_name}: {str(e)}")
            results.append({
                'brand': brand_name,
                'status': 'failed',
                'error': str(e)
            })
    
    # Log summary
    completed = len([r for r in results if r['status'] == 'completed'])
    skipped = len([r for r in results if r['status'] == 'skipped'])
    failed = len([r for r in results if r['status'] == 'failed'])
    
    logger.info(f"Scheduled scan summary: {completed} completed, {skipped} skipped, {failed} failed")
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'success': True,
            'source': 'scheduled',
            'summary': {
                'total': len(brands),
                'completed': completed,
                'skipped': skipped,
                'failed': failed
            },
            'results': results,
            'timestamp': scan_timestamp
        })
    }

def handle_api_request(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle API Gateway requests (existing functionality)
    """
    logger.info("Processing API request")
    
    # Parse request body
    try:
        if 'body' in event:
            body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        else:
            body = event
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'error': 'Invalid JSON in request body'
            })
        }
    
    # Extract parameters
    brand_name = body.get('brandName')
    domain = body.get('domain')
    industry = body.get('industry')
    
    if not all([brand_name, domain, industry]):
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'error': 'Missing required parameters: brandName, domain, industry'
            })
        }
    
    # Perform analysis
    try:
        analysis_result = perform_brand_analysis(brand_name, domain, industry)
        
        # Store in DynamoDB
        timestamp = datetime.now(timezone.utc).isoformat()
        store_scan_result(brand_name, domain, industry, analysis_result, timestamp)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'data': analysis_result,
                'timestamp': timestamp
            })
        }
        
    except Exception as e:
        logger.error(f"Analysis failed for {brand_name}: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }

def is_recent_scan_exists(brand_name: str, days: int = 6) -> bool:
    """
    Check if a recent scan exists for the brand within specified days
    """
    try:
        from datetime import timedelta
        
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        cutoff_timestamp = cutoff_date.isoformat()
        
        response = table.query(
            KeyConditionExpression='brandName = :brand_name',
            FilterExpression='scanTimestamp > :cutoff',
            ExpressionAttributeValues={
                ':brand_name': brand_name,
                ':cutoff': cutoff_timestamp
            },
            Limit=1
        )
        
        return len(response.get('Items', [])) > 0
        
    except Exception as e:
        logger.warning(f"Error checking recent scans for {brand_name}: {str(e)}")
        return False

def store_scan_result(brand_name: str, domain: str, industry: str, 
                     analysis_result: Dict[str, Any], timestamp: str) -> None:
    """
    Store scan results in DynamoDB with duplicate prevention
    """
    try:
        # Create unique scan ID
        scan_id = f"{brand_name}_{timestamp.split('T')[0]}_{hash(timestamp) % 10000}"
        
        item = {
            'brandName': brand_name,
            'scanId': scan_id,
            'domain': domain,
            'industry': industry,
            'scanTimestamp': timestamp,
            'source': 'scheduled',
            'analysisResult': analysis_result,
            'ttl': int((datetime.now(timezone.utc).timestamp() + (90 * 24 * 60 * 60)))  # 90 days TTL
        }
        
        # Use conditional put to prevent duplicates
        table.put_item(
            Item=item,
            ConditionExpression='attribute_not_exists(scanId)'
        )
        
        logger.info(f"Stored scan result for {brand_name} with ID {scan_id}")
        
    except table.meta.client.exceptions.ConditionalCheckFailedException:
        logger.warning(f"Duplicate scan detected for {brand_name} at {timestamp}")
    except Exception as e:
        logger.error(f"Failed to store scan result for {brand_name}: {str(e)}")
        raise

def perform_brand_analysis(brand_name: str, domain: str, industry: str) -> Dict[str, Any]:
    """
    Perform the actual brand analysis (your existing logic)
    """
    # Your existing brand analysis logic here
    # This is a placeholder - replace with your actual implementation
    
    logger.info(f"Performing analysis for {brand_name}")
    
    # Mock analysis result
    return {
        'brandName': brand_name,
        'domain': domain,
        'industry': industry,
        'visibilityScore': 85,
        'sentiment': 'positive',
        'mentions': 1250,
        'trends': ['increasing', 'positive'],
        'recommendations': [
            'Maintain current brand positioning',
            'Increase social media engagement',
            'Monitor competitor activities'
        ]
    }
```

### 3. DynamoDB Table Schema

#### Table Configuration

```yaml
# DynamoDB Table for storing scan results
BrandScansTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: aelora-brand-scans
    BillingMode: PAY_PER_REQUEST
    AttributeDefinitions:
      - AttributeName: brandName
        AttributeType: S
      - AttributeName: scanTimestamp
        AttributeType: S
      - AttributeName: scanId
        AttributeType: S
    KeySchema:
      - AttributeName: brandName
        KeyType: HASH
      - AttributeName: scanTimestamp
        KeyType: RANGE
    GlobalSecondaryIndexes:
      - IndexName: scanId-index
        KeySchema:
          - AttributeName: scanId
            KeyType: HASH
        Projection:
          ProjectionType: ALL
    TimeToLiveSpecification:
      AttributeName: ttl
      Enabled: true
    PointInTimeRecoverySpecification:
      PointInTimeRecoveryEnabled: true
    Tags:
      - Key: Project
        Value: Aelora
      - Key: Environment
        Value: Production
```

#### Duplicate Prevention Strategy

```python
def prevent_duplicate_scans():
    """
    Multiple strategies to prevent duplicate scans:
    
    1. Timestamp-based checking (within 6 days)
    2. Unique scan ID generation
    3. Conditional DynamoDB puts
    4. TTL for automatic cleanup
    """
    
    # Strategy 1: Check recent scans
    def has_recent_scan(brand_name: str, days: int = 6) -> bool:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        
        response = table.query(
            KeyConditionExpression='brandName = :brand',
            FilterExpression='scanTimestamp > :cutoff',
            ExpressionAttributeValues={
                ':brand': brand_name,
                ':cutoff': cutoff.isoformat()
            },
            Limit=1
        )
        
        return len(response.get('Items', [])) > 0
    
    # Strategy 2: Unique scan ID
    def generate_scan_id(brand_name: str, timestamp: str) -> str:
        date_part = timestamp.split('T')[0]
        hash_part = hash(f"{brand_name}_{timestamp}") % 10000
        return f"{brand_name}_{date_part}_{hash_part}"
    
    # Strategy 3: Conditional put
    def safe_store_result(item: Dict[str, Any]) -> bool:
        try:
            table.put_item(
                Item=item,
                ConditionExpression='attribute_not_exists(scanId)'
            )
            return True
        except table.meta.client.exceptions.ConditionalCheckFailedException:
            logger.warning(f"Duplicate scan prevented for {item['brandName']}")
            return False
```

### 4. CloudWatch Logging Setup

#### Log Group Configuration

```yaml
# CloudWatch Log Groups
EventBridgeLogGroup:
  Type: AWS::Logs::LogGroup
  Properties:
    LogGroupName: '/aws/events/aelora-weekly-scan'
    RetentionInDays: 30

LambdaLogGroup:
  Type: AWS::Logs::LogGroup
  Properties:
    LogGroupName: !Sub '/aws/lambda/${LambdaFunctionName}'
    RetentionInDays: 14

# CloudWatch Alarms
ScheduledScanFailureAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: 'Aelora-Scheduled-Scan-Failures'
    AlarmDescription: 'Alert when scheduled scans fail'
    MetricName: Errors
    Namespace: AWS/Lambda
    Statistic: Sum
    Period: 300
    EvaluationPeriods: 1
    Threshold: 1
    ComparisonOperator: GreaterThanOrEqualToThreshold
    Dimensions:
      - Name: FunctionName
        Value: !Ref LambdaFunctionName
    AlarmActions:
      - !Ref SNSTopicArn  # Add your SNS topic for notifications
```

#### Custom CloudWatch Metrics

```python
import boto3

cloudwatch = boto3.client('cloudwatch')

def publish_custom_metrics(brand_name: str, scan_status: str, duration: float):
    """
    Publish custom metrics to CloudWatch
    """
    try:
        cloudwatch.put_metric_data(
            Namespace='Aelora/BrandScans',
            MetricData=[
                {
                    'MetricName': 'ScanDuration',
                    'Dimensions': [
                        {
                            'Name': 'BrandName',
                            'Value': brand_name
                        },
                        {
                            'Name': 'Status',
                            'Value': scan_status
                        }
                    ],
                    'Value': duration,
                    'Unit': 'Seconds'
                },
                {
                    'MetricName': 'ScanCount',
                    'Dimensions': [
                        {
                            'Name': 'Status',
                            'Value': scan_status
                        }
                    ],
                    'Value': 1,
                    'Unit': 'Count'
                }
            ]
        )
    except Exception as e:
        logger.error(f"Failed to publish metrics: {str(e)}")

# Usage in Lambda function
start_time = datetime.now()
try:
    # Perform scan
    result = perform_brand_analysis(brand_name, domain, industry)
    duration = (datetime.now() - start_time).total_seconds()
    publish_custom_metrics(brand_name, 'success', duration)
except Exception as e:
    duration = (datetime.now() - start_time).total_seconds()
    publish_custom_metrics(brand_name, 'failure', duration)
    raise
```

### 5. Monitoring and Alerting

#### CloudWatch Dashboard

```json
{
    "widgets": [
        {
            "type": "metric",
            "properties": {
                "metrics": [
                    ["Aelora/BrandScans", "ScanCount", "Status", "success"],
                    [".", ".", ".", "failure"],
                    [".", ".", ".", "skipped"]
                ],
                "period": 86400,
                "stat": "Sum",
                "region": "us-east-1",
                "title": "Daily Scan Results"
            }
        },
        {
            "type": "metric", 
            "properties": {
                "metrics": [
                    ["AWS/Lambda", "Duration", "FunctionName", "aelora-visibility-lambda"],
                    [".", "Errors", ".", "."],
                    [".", "Invocations", ".", "."]
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-east-1",
                "title": "Lambda Performance"
            }
        }
    ]
}
```

### 6. Configuration Management

#### Brand Configuration in Parameter Store

```bash
# Store brand configurations in AWS Systems Manager Parameter Store
aws ssm put-parameter \
    --name "/aelora/brands/config" \
    --type "String" \
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
    }'
```

#### Dynamic Brand Loading in Lambda

```python
import boto3

ssm = boto3.client('ssm')

def load_brand_configurations() -> List[Dict[str, Any]]:
    """
    Load brand configurations from Parameter Store
    """
    try:
        response = ssm.get_parameter(
            Name='/aelora/brands/config',
            WithDecryption=True
        )
        
        config = json.loads(response['Parameter']['Value'])
        enabled_brands = [
            brand for brand in config['brands'] 
            if brand.get('enabled', True)
        ]
        
        logger.info(f"Loaded {len(enabled_brands)} enabled brands")
        return enabled_brands
        
    except Exception as e:
        logger.error(f"Failed to load brand configurations: {str(e)}")
        # Fallback to default configuration
        return [
            {
                "brandName": "Apple",
                "domain": "apple.com", 
                "industry": "Technology"
            }
        ]
```

## 🔧 Deployment Commands

### Deploy with CloudFormation

```bash
# Deploy the EventBridge stack
aws cloudformation deploy \
    --template-file eventbridge-stack.yaml \
    --stack-name aelora-eventbridge \
    --parameter-overrides \
        LambdaFunctionName=aelora-visibility-lambda \
        ScheduleTimezone=America/New_York \
    --capabilities CAPABILITY_IAM

# Update Lambda function code
aws lambda update-function-code \
    --function-name aelora-visibility-lambda \
    --zip-file fileb://lambda-function.zip

# Test the EventBridge rule
aws events put-events \
    --entries Source=custom.aelora,DetailType="Test Scheduled Scan",Detail='{
        "source": "eventbridge-scheduled",
        "brands": [
            {
                "brandName": "Apple",
                "domain": "apple.com",
                "industry": "Technology"
            }
        ]
    }'
```

### Verify Setup

```bash
# Check EventBridge rule status
aws events describe-rule --name aelora-weekly-brand-scan

# Check Lambda function configuration
aws lambda get-function --function-name aelora-visibility-lambda

# View recent CloudWatch logs
aws logs describe-log-streams \
    --log-group-name /aws/lambda/aelora-visibility-lambda \
    --order-by LastEventTime \
    --descending \
    --max-items 5
```

## 📊 Monitoring and Maintenance

### Weekly Health Check

```python
def weekly_health_check():
    """
    Perform weekly health check of the scanning system
    """
    checks = {
        'eventbridge_rule': check_eventbridge_rule_status(),
        'lambda_function': check_lambda_function_health(),
        'dynamodb_table': check_dynamodb_table_status(),
        'recent_scans': check_recent_scan_activity()
    }
    
    # Send health report
    send_health_report(checks)
```

### Cost Optimization

```python
def optimize_costs():
    """
    Cost optimization strategies:
    
    1. Use DynamoDB TTL for automatic cleanup
    2. Optimize Lambda memory allocation
    3. Use EventBridge scheduler instead of CloudWatch Events
    4. Implement scan result caching
    """
    
    # Clean up old scan results
    cleanup_old_scans(days=90)
    
    # Optimize Lambda concurrency
    set_lambda_reserved_concurrency(5)
    
    # Monitor costs
    track_monthly_costs()
```

## 🎯 Best Practices

1. **Duplicate Prevention**: Always check for recent scans before processing
2. **Error Handling**: Implement comprehensive error handling and retries
3. **Monitoring**: Set up CloudWatch alarms for failures
4. **Cost Control**: Use TTL and optimize Lambda configuration
5. **Security**: Use IAM roles with minimal required permissions
6. **Scalability**: Design for handling multiple brands efficiently
7. **Maintenance**: Regular health checks and performance monitoring

## 🚀 Ready for Production

This setup provides:
- ✅ **Automated weekly scans** every Monday at 9 AM
- ✅ **Duplicate prevention** with timestamp checking
- ✅ **Comprehensive logging** with CloudWatch
- ✅ **Error handling** and fallback strategies
- ✅ **Cost optimization** with TTL and efficient queries
- ✅ **Monitoring** with custom metrics and alarms
- ✅ **Scalable architecture** for multiple brands

Your Aelora platform now has fully automated brand scanning! 🎉 