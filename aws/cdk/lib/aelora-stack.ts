import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class AeloraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table for storing analysis history
    const analysisTable = new dynamodb.Table(this, 'AnalysisHistoryTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Change to DESTROY for non-production
    });

    // S3 bucket for storing reports or snapshots
    const reportsBucket = new s3.Bucket(this, 'ReportsBucket', {
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Change to DESTROY for non-production
      autoDeleteObjects: false,
      versioned: true,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Lambda function for content analysis
    const analyzeContentFunction = new lambda.Function(this, 'AnalyzeContentFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'analyzeContent.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        DYNAMODB_TABLE_NAME: analysisTable.tableName,
        REPORTS_BUCKET_NAME: reportsBucket.bucketName,
      },
    });

    // Grant permissions to the Lambda function
    analysisTable.grantReadWriteData(analyzeContentFunction);
    reportsBucket.grantReadWrite(analyzeContentFunction);

    // API Gateway REST API
    const api = new apigateway.RestApi(this, 'AeloraApi', {
      restApiName: 'Aelora API',
      description: 'API for Aelora AEO Analysis',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Integrate Lambda with API Gateway
    const analyzeResource = api.root.addResource('analyze');
    analyzeResource.addMethod('GET', new apigateway.LambdaIntegration(analyzeContentFunction));

    // Output the API endpoint URL
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
    });

    // Output the DynamoDB table name
    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: analysisTable.tableName,
      description: 'DynamoDB table name',
    });

    // Output the S3 bucket name
    new cdk.CfnOutput(this, 'S3BucketName', {
      value: reportsBucket.bucketName,
      description: 'S3 bucket name for reports',
    });
  }
} 