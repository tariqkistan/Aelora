# Enabling CORS on AWS API Gateway

Follow these steps to enable CORS on your API Gateway:

## Using the AWS Management Console

1. Sign in to the AWS Management Console and open the API Gateway console at https://console.aws.amazon.com/apigateway/
2. In the APIs navigation pane, select your API (the one with endpoint https://fcfz0pijd5.execute-api.us-east-1.amazonaws.com/prod)
3. Select the "Resources" panel
4. In the Resources pane, select the `/analyze` resource (or the resource you want to enable CORS for)
5. Click on "Actions" and then select "Enable CORS"
6. In the CORS configuration:
   - For "Access-Control-Allow-Origin" enter: `https://aelora-58a9cb4bd-tariqkistans-projects.vercel.app,https://aelora-xi.vercel.app,https://*.vercel.app`
   - For "Access-Control-Allow-Headers" enter: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
   - For "Access-Control-Allow-Methods" select at least: `GET,OPTIONS`
   - Check "Access-Control-Allow-Credentials" if your API uses credentials
7. Click "Save"
8. A dialog appears asking you to confirm - click "Yes, replace existing values" 
9. After making these changes, click "Actions" and then "Deploy API"
10. Select the "prod" stage and click "Deploy"

## Alternative: Using AWS CLI

If you prefer using AWS CLI, you can run the following command (adjust values as needed):

```bash
aws apigateway update-gateway-response \
  --rest-api-id YOUR_API_ID \
  --response-type CORS \
  --status-code 200 \
  --response-parameters "{
    \"gatewayresponse.header.Access-Control-Allow-Origin\": \"'https://aelora-58a9cb4bd-tariqkistans-projects.vercel.app,https://aelora-xi.vercel.app,https://*.vercel.app'\"
  }"
```

## Testing

After you've enabled CORS and deployed your API:

1. Go back to your application at https://aelora-58a9cb4bd-tariqkistans-projects.vercel.app
2. Try analyzing a website again
3. Check the browser console to verify there are no more CORS errors

## Note

If you're using AWS CDK to deploy your infrastructure, you should update your CDK code to include CORS configuration for more permanent changes that won't be overwritten by future deployments. 