"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const analyzer_1 = require("./analyzer");
// Initialize DynamoDB client
const client = new client_dynamodb_1.DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true
    }
});
// Use the environment variable from CDK, fallback to default
const TABLE_NAME = process.env.TABLE_NAME || process.env.DYNAMODB_TABLE_NAME || 'aelora-analysis-history';
/**
 * Remove undefined values from an object recursively
 */
function removeUndefinedValues(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(removeUndefinedValues).filter(item => item !== undefined);
    }
    if (typeof obj === 'object') {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
                cleaned[key] = removeUndefinedValues(value);
            }
        }
        return cleaned;
    }
    return obj;
}
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
            const cleanedResult = removeUndefinedValues({
                id: `${url}-${Date.now()}`,
                ...resultWithPerformance
            });
            await docClient.send(new lib_dynamodb_1.PutCommand({
                TableName: TABLE_NAME,
                Item: cleanedResult
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsOERBQTBEO0FBQzFELHdEQUEyRTtBQUMzRSx5Q0FBNEM7QUFFNUMsNkJBQTZCO0FBQzdCLE1BQU0sTUFBTSxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDdEUsTUFBTSxTQUFTLEdBQUcscUNBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtJQUNwRCxlQUFlLEVBQUU7UUFDZixxQkFBcUIsRUFBRSxJQUFJO0tBQzVCO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsNkRBQTZEO0FBQzdELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLElBQUkseUJBQXlCLENBQUM7QUFFMUc7O0dBRUc7QUFDSCxTQUFTLHFCQUFxQixDQUFDLEdBQVE7SUFDckMsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUN0QyxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN2QixPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVELElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDNUIsTUFBTSxPQUFPLEdBQVEsRUFBRSxDQUFDO1FBQ3hCLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FB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T0FBTyxXQW9FbEI7QUFFRjs7R0FFRztBQUNILFNBQVMsV0FBVztJQUNsQixPQUFPO1FBQ0wsY0FBYyxFQUFFLGtCQUFrQjtRQUNsQyw2QkFBNkIsRUFBRSxHQUFHO1FBQ2xDLGtDQUFrQyxFQUFFLElBQUk7S0FDekMsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBEeW5hbW9EQkNsaWVudCB9IGZyb20gJ0Bhd3Mtc2RrL2NsaWVudC1keW5hbW9kYic7XG5pbXBvcnQgeyBEeW5hbW9EQkRvY3VtZW50Q2xpZW50LCBQdXRDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvbGliLWR5bmFtb2RiJztcbmltcG9ydCB7IGFuYWx5emVXZWJzaXRlIH0gZnJvbSAnLi9hbmFseXplcic7XG5cbi8vIEluaXRpYWxpemUgRHluYW1vREIgY2xpZW50XG5jb25zdCBjbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoeyByZWdpb246IHByb2Nlc3MuZW52LkFXU19SRUdJT04gfSk7XG5jb25zdCBkb2NDbGllbnQgPSBEeW5hbW9EQkRvY3VtZW50Q2xpZW50LmZyb20oY2xpZW50LCB7XG4gIG1hcnNoYWxsT3B0aW9uczoge1xuICAgIHJlbW92ZVVuZGVmaW5lZFZhbHVlczogdHJ1ZVxuICB9XG59KTtcblxuLy8gVXNlIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSBmcm9tIENESywgZmFsbGJhY2sgdG8gZGVmYXVsdFxuY29uc3QgVEFCTEVfTkFNRSA9IHByb2Nlc3MuZW52LlRBQkxFX05BTUUgfHwgcHJvY2Vzcy5lbnYuRFlOQU1PREJfVEFCTEVfTkFNRSB8fCAnYWVsb3JhLWFuYWx5c2lzLWhpc3RvcnknO1xuXG4vKipcbiAqIFJlbW92ZSB1bmRlZmluZWQgdmFsdWVzIGZyb20gYW4gb2JqZWN0IHJlY3Vyc2l2ZWx5XG4gKi9cbmZ1bmN0aW9uIHJlbW92ZVVuZGVmaW5lZFZhbHVlcyhvYmo6IGFueSk6IGFueSB7XG4gIGlmIChvYmogPT09IG51bGwgfHwgb2JqID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG4gIFxuICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuIG9iai5tYXAocmVtb3ZlVW5kZWZpbmVkVmFsdWVzKS5maWx0ZXIoaXRlbSA9PiBpdGVtICE9PSB1bmRlZmluZWQpO1xuICB9XG4gIFxuICBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCBjbGVhbmVkOiBhbnkgPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjbGVhbmVkW2tleV0gPSByZW1vdmVVbmRlZmluZWRWYWx1ZXModmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2xlYW5lZDtcbiAgfVxuICBcbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBNYWluIExhbWJkYSBoYW5kbGVyIGZ1bmN0aW9uIGZvciBhbmFseXppbmcgd2Vic2l0ZXNcbiAqL1xuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgY29uc29sZS5sb2coJ0V2ZW50IHJlY2VpdmVkOicsIEpTT04uc3RyaW5naWZ5KGV2ZW50KSk7XG4gIFxuICB0cnkge1xuICAgIC8vIEdldCBVUkwgZnJvbSBxdWVyeSBwYXJhbWV0ZXJzXG4gICAgY29uc3QgdXJsID0gZXZlbnQucXVlcnlTdHJpbmdQYXJhbWV0ZXJzPy51cmw7XG4gICAgXG4gICAgaWYgKCF1cmwpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgaGVhZGVyczogY29yc0hlYWRlcnMoKSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ1VSTCBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQnIH0pXG4gICAgICB9O1xuICAgIH1cbiAgICBcbiAgICBjb25zb2xlLmxvZyhgQW5hbHl6aW5nIFVSTDogJHt1cmx9YCk7XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBcbiAgICAvLyBBbmFseXplIHRoZSB3ZWJzaXRlIHdpdGggQUkgYXNzaXN0YW5jZVxuICAgIGNvbnN0IGFuYWx5c2lzUmVzdWx0ID0gYXdhaXQgYW5hbHl6ZVdlYnNpdGUodXJsKTtcbiAgICBcbiAgICAvLyBDYWxjdWxhdGUgcHJvY2Vzc2luZyB0aW1lXG4gICAgY29uc3QgdG90YWxUaW1lID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICBcbiAgICAvLyBBZGQgcGVyZm9ybWFuY2UgbWV0cmljc1xuICAgIGNvbnN0IHJlc3VsdFdpdGhQZXJmb3JtYW5jZSA9IHtcbiAgICAgIC4uLmFuYWx5c2lzUmVzdWx0LFxuICAgICAgcGVyZm9ybWFuY2U6IHtcbiAgICAgICAgdG90YWxUaW1lTXM6IHRvdGFsVGltZVxuICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgLy8gU3RvcmUgdGhlIGFuYWx5c2lzIHJlc3VsdCBpbiBEeW5hbW9EQlxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjbGVhbmVkUmVzdWx0ID0gcmVtb3ZlVW5kZWZpbmVkVmFsdWVzKHtcbiAgICAgICAgaWQ6IGAke3VybH0tJHtEYXRlLm5vdygpfWAsXG4gICAgICAgIC4uLnJlc3VsdFdpdGhQZXJmb3JtYW5jZVxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIGF3YWl0IGRvY0NsaWVudC5zZW5kKFxuICAgICAgICBuZXcgUHV0Q29tbWFuZCh7XG4gICAgICAgICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FLFxuICAgICAgICAgIEl0ZW06IGNsZWFuZWRSZXN1bHRcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZygnQW5hbHlzaXMgcmVzdWx0IHN0b3JlZCBpbiBEeW5hbW9EQicpO1xuICAgIH0gY2F0Y2ggKGRiRXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHN0b3JpbmcgYW5hbHlzaXMgcmVzdWx0IGluIER5bmFtb0RCOicsIGRiRXJyb3IpO1xuICAgICAgLy8gQ29udGludWUgZXZlbiBpZiBEQiBzdG9yYWdlIGZhaWxzXG4gICAgfVxuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICBoZWFkZXJzOiBjb3JzSGVhZGVycygpLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocmVzdWx0V2l0aFBlcmZvcm1hbmNlKVxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgcHJvY2Vzc2luZyByZXF1ZXN0OicsIGVycm9yKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgaGVhZGVyczogY29yc0hlYWRlcnMoKSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgXG4gICAgICAgIGVycm9yOiAnRmFpbGVkIHRvIGFuYWx5emUgY29udGVudCcsXG4gICAgICAgIG1lc3NhZ2U6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InXG4gICAgICB9KVxuICAgIH07XG4gIH1cbn07XG5cbi8qKlxuICogR2VuZXJhdGUgQ09SUyBoZWFkZXJzIGZvciBBUEkgcmVzcG9uc2VzXG4gKi9cbmZ1bmN0aW9uIGNvcnNIZWFkZXJzKCk6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgYm9vbGVhbiB9IHtcbiAgcmV0dXJuIHtcbiAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogdHJ1ZSxcbiAgfTtcbn0gIl19