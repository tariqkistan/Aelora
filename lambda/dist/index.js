"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const analyzer_1 = require("./analyzer");
// Initialize DynamoDB client
const client = new client_dynamodb_1.DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'aelora-analysis-history';
/**
 * Main Lambda handler function for analyzing websites
 */
const handler = async (event) => {
    console.log('Event received:', JSON.stringify(event));
    try {
        // Get URL from query parameters
        const url = event.queryStringParameters?.url;
        if (!url) {
            return {
                statusCode: 400,
                headers: corsHeaders(),
                body: JSON.stringify({ error: 'URL parameter is required' })
            };
        }
        console.log(`Analyzing URL: ${url}`);
        const startTime = Date.now();
        // Analyze the website with AI assistance
        const analysisResult = await (0, analyzer_1.analyzeWebsite)(url);
        // Calculate processing time
        const totalTime = Date.now() - startTime;
        // Add performance metrics
        const resultWithPerformance = {
            ...analysisResult,
            performance: {
                totalTimeMs: totalTime
            }
        };
        // Store the analysis result in DynamoDB
        try {
            await docClient.send(new lib_dynamodb_1.PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    id: `${url}-${Date.now()}`,
                    ...resultWithPerformance
                }
            }));
            console.log('Analysis result stored in DynamoDB');
        }
        catch (dbError) {
            console.error('Error storing analysis result in DynamoDB:', dbError);
            // Continue even if DB storage fails
        }
        return {
            statusCode: 200,
            headers: corsHeaders(),
            body: JSON.stringify(resultWithPerformance)
        };
    }
    catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            headers: corsHeaders(),
            body: JSON.stringify({
                error: 'Failed to analyze content',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
exports.handler = handler;
/**
 * Generate CORS headers for API responses
 */
function corsHeaders() {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsOERBQTBEO0FBQzFELHdEQUEyRTtBQUMzRSx5Q0FBNEM7QUFFNUMsNkJBQTZCO0FBQzdCLE1BQU0sTUFBTSxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDdEUsTUFBTSxTQUFTLEdBQUcscUNBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3RELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLElBQUkseUJBQXlCLENBQUM7QUFFaEY7O0dBRUc7QUFDSSxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBMkIsRUFBa0MsRUFBRTtJQUMzRixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUV0RCxJQUFJLENBQUM7UUFDSCxnQ0FBZ0M7UUFDaEMsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixFQUFFLEdBQUcsQ0FBQztRQUU3QyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDVCxPQUFPO2dCQUNMLFVBQVUsRUFBRSxHQUFHO2dCQUNmLE9BQU8sRUFBRSxXQUFXLEVBQUU7Z0JBQ3RCLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLDJCQUEyQixFQUFFLENBQUM7YUFDN0QsQ0FBQztRQUNKLENBQUM7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU3Qix5Q0FBeUM7UUFDekMsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFBLHlCQUFjLEVBQUMsR0FBRyxDQUFDLENBQUM7UUFFakQsNEJBQTRCO1FBQzVCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFFekMsMEJBQTBCO1FBQzFCLE1BQU0scUJBQXFCLEdBQUc7WUFDNUIsR0FBRyxjQUFjO1lBQ2pCLFdBQVcsRUFBRTtnQkFDWCxXQUFXLEVBQUUsU0FBUzthQUN2QjtTQUNGLENBQUM7UUFFRix3Q0FBd0M7UUFDeEMsSUFBSSxDQUFDO1lBQ0gsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUNsQixJQUFJLHlCQUFVLENBQUM7Z0JBQ2IsU0FBUyxFQUFFLFVBQVU7Z0JBQ3JCLElBQUksRUFBRTtvQkFDSixFQUFFLEVBQUUsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFO29CQUMxQixHQUFHLHFCQUFxQjtpQkFDekI7YUFDRixDQUFDLENBQ0gsQ0FBQztZQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBQUMsT0FBTyxPQUFPLEVBQUUsQ0FBQztZQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLDRDQUE0QyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3JFLG9DQUFvQztRQUN0QyxDQUFDO1FBRUQsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsT0FBTyxFQUFFLFdBQVcsRUFBRTtZQUN0QixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztTQUM1QyxDQUFDO0lBQ0osQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRWxELE9BQU87WUFDTCxVQUFVLEVBQUUsR0FBRztZQUNmLE9BQU8sRUFBRSxXQUFXLEVBQUU7WUFDdEIsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ25CLEtBQUssRUFBRSwyQkFBMkI7Z0JBQ2xDLE9BQU8sRUFBRSxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlO2FBQ2xFLENBQUM7U0FDSCxDQUFDO0lBQ0osQ0FBQztBQUNILENBQUMsQ0FBQztBQWxFVyxRQUFBLE9BQU8sV0FrRWxCO0FBRUY7O0dBRUc7QUFDSCxTQUFTLFdBQVc7SUFDbEIsT0FBTztRQUNMLGNBQWMsRUFBRSxrQkFBa0I7UUFDbEMsNkJBQTZCLEVBQUUsR0FBRztRQUNsQyxrQ0FBa0MsRUFBRSxJQUFJO0tBQ3pDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgRHluYW1vREJDbGllbnQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtZHluYW1vZGInO1xuaW1wb3J0IHsgRHluYW1vREJEb2N1bWVudENsaWVudCwgUHV0Q29tbWFuZCB9IGZyb20gJ0Bhd3Mtc2RrL2xpYi1keW5hbW9kYic7XG5pbXBvcnQgeyBhbmFseXplV2Vic2l0ZSB9IGZyb20gJy4vYW5hbHl6ZXInO1xuXG4vLyBJbml0aWFsaXplIER5bmFtb0RCIGNsaWVudFxuY29uc3QgY2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHsgcmVnaW9uOiBwcm9jZXNzLmVudi5BV1NfUkVHSU9OIH0pO1xuY29uc3QgZG9jQ2xpZW50ID0gRHluYW1vREJEb2N1bWVudENsaWVudC5mcm9tKGNsaWVudCk7XG5jb25zdCBUQUJMRV9OQU1FID0gcHJvY2Vzcy5lbnYuRFlOQU1PREJfVEFCTEVfTkFNRSB8fCAnYWVsb3JhLWFuYWx5c2lzLWhpc3RvcnknO1xuXG4vKipcbiAqIE1haW4gTGFtYmRhIGhhbmRsZXIgZnVuY3Rpb24gZm9yIGFuYWx5emluZyB3ZWJzaXRlc1xuICovXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnQpOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xuICBjb25zb2xlLmxvZygnRXZlbnQgcmVjZWl2ZWQ6JywgSlNPTi5zdHJpbmdpZnkoZXZlbnQpKTtcbiAgXG4gIHRyeSB7XG4gICAgLy8gR2V0IFVSTCBmcm9tIHF1ZXJ5IHBhcmFtZXRlcnNcbiAgICBjb25zdCB1cmwgPSBldmVudC5xdWVyeVN0cmluZ1BhcmFtZXRlcnM/LnVybDtcbiAgICBcbiAgICBpZiAoIXVybCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgICBoZWFkZXJzOiBjb3JzSGVhZGVycygpLFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnVVJMIHBhcmFtZXRlciBpcyByZXF1aXJlZCcgfSlcbiAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIGNvbnNvbGUubG9nKGBBbmFseXppbmcgVVJMOiAke3VybH1gKTtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIFxuICAgIC8vIEFuYWx5emUgdGhlIHdlYnNpdGUgd2l0aCBBSSBhc3Npc3RhbmNlXG4gICAgY29uc3QgYW5hbHlzaXNSZXN1bHQgPSBhd2FpdCBhbmFseXplV2Vic2l0ZSh1cmwpO1xuICAgIFxuICAgIC8vIENhbGN1bGF0ZSBwcm9jZXNzaW5nIHRpbWVcbiAgICBjb25zdCB0b3RhbFRpbWUgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuICAgIFxuICAgIC8vIEFkZCBwZXJmb3JtYW5jZSBtZXRyaWNzXG4gICAgY29uc3QgcmVzdWx0V2l0aFBlcmZvcm1hbmNlID0ge1xuICAgICAgLi4uYW5hbHlzaXNSZXN1bHQsXG4gICAgICBwZXJmb3JtYW5jZToge1xuICAgICAgICB0b3RhbFRpbWVNczogdG90YWxUaW1lXG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICAvLyBTdG9yZSB0aGUgYW5hbHlzaXMgcmVzdWx0IGluIER5bmFtb0RCXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGRvY0NsaWVudC5zZW5kKFxuICAgICAgICBuZXcgUHV0Q29tbWFuZCh7XG4gICAgICAgICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FLFxuICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgIGlkOiBgJHt1cmx9LSR7RGF0ZS5ub3coKX1gLFxuICAgICAgICAgICAgLi4ucmVzdWx0V2l0aFBlcmZvcm1hbmNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKCdBbmFseXNpcyByZXN1bHQgc3RvcmVkIGluIER5bmFtb0RCJyk7XG4gICAgfSBjYXRjaCAoZGJFcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc3RvcmluZyBhbmFseXNpcyByZXN1bHQgaW4gRHluYW1vREI6JywgZGJFcnJvcik7XG4gICAgICAvLyBDb250aW51ZSBldmVuIGlmIERCIHN0b3JhZ2UgZmFpbHNcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgIGhlYWRlcnM6IGNvcnNIZWFkZXJzKCksXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXN1bHRXaXRoUGVyZm9ybWFuY2UpXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBwcm9jZXNzaW5nIHJlcXVlc3Q6JywgZXJyb3IpO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICBoZWFkZXJzOiBjb3JzSGVhZGVycygpLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBcbiAgICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gYW5hbHl6ZSBjb250ZW50JyxcbiAgICAgICAgbWVzc2FnZTogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcidcbiAgICAgIH0pXG4gICAgfTtcbiAgfVxufTtcblxuLyoqXG4gKiBHZW5lcmF0ZSBDT1JTIGhlYWRlcnMgZm9yIEFQSSByZXNwb25zZXNcbiAqL1xuZnVuY3Rpb24gY29yc0hlYWRlcnMoKTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBib29sZWFuIH0ge1xuICByZXR1cm4ge1xuICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnOiB0cnVlLFxuICB9O1xufSAiXX0=