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
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'aelora-analysis-history';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsOERBQTBEO0FBQzFELHdEQUEyRTtBQUMzRSx5Q0FBNEM7QUFFNUMsNkJBQTZCO0FBQzdCLE1BQU0sTUFBTSxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDdEUsTUFBTSxTQUFTLEdBQUcscUNBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtJQUNwRCxlQUFlLEVBQUU7UUFDZixxQkFBcUIsRUFBRSxJQUFJO0tBQzVCO0NBQ0YsQ0FBQyxDQUFDO0FBQ0gsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsSUFBSSx5QkFBeUIsQ0FBQztBQUVoRjs7R0FFRztBQUNILFNBQVMscUJBQXFCLENBQUMsR0FBUTtJQUNyQyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3RDLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRUQsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUM1QixNQUFNLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFDeEIsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUMvQyxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUs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LE9BQU87UUFDTCxjQUFjLEVBQUUsa0JBQWtCO1FBQ2xDLDZCQUE2QixFQUFFLEdBQUc7UUFDbEMsa0NBQWtDLEVBQUUsSUFBSTtLQUN6QyxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSUdhdGV3YXlQcm94eUV2ZW50LCBBUElHYXRld2F5UHJveHlSZXN1bHQgfSBmcm9tICdhd3MtbGFtYmRhJztcbmltcG9ydCB7IER5bmFtb0RCQ2xpZW50IH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiJztcbmltcG9ydCB7IER5bmFtb0RCRG9jdW1lbnRDbGllbnQsIFB1dENvbW1hbmQgfSBmcm9tICdAYXdzLXNkay9saWItZHluYW1vZGInO1xuaW1wb3J0IHsgYW5hbHl6ZVdlYnNpdGUgfSBmcm9tICcuL2FuYWx5emVyJztcblxuLy8gSW5pdGlhbGl6ZSBEeW5hbW9EQiBjbGllbnRcbmNvbnN0IGNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7IHJlZ2lvbjogcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB9KTtcbmNvbnN0IGRvY0NsaWVudCA9IER5bmFtb0RCRG9jdW1lbnRDbGllbnQuZnJvbShjbGllbnQsIHtcbiAgbWFyc2hhbGxPcHRpb25zOiB7XG4gICAgcmVtb3ZlVW5kZWZpbmVkVmFsdWVzOiB0cnVlXG4gIH1cbn0pO1xuY29uc3QgVEFCTEVfTkFNRSA9IHByb2Nlc3MuZW52LkRZTkFNT0RCX1RBQkxFX05BTUUgfHwgJ2FlbG9yYS1hbmFseXNpcy1oaXN0b3J5JztcblxuLyoqXG4gKiBSZW1vdmUgdW5kZWZpbmVkIHZhbHVlcyBmcm9tIGFuIG9iamVjdCByZWN1cnNpdmVseVxuICovXG5mdW5jdGlvbiByZW1vdmVVbmRlZmluZWRWYWx1ZXMob2JqOiBhbnkpOiBhbnkge1xuICBpZiAob2JqID09PSBudWxsIHx8IG9iaiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuICBcbiAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgIHJldHVybiBvYmoubWFwKHJlbW92ZVVuZGVmaW5lZFZhbHVlcykuZmlsdGVyKGl0ZW0gPT4gaXRlbSAhPT0gdW5kZWZpbmVkKTtcbiAgfVxuICBcbiAgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgY29uc3QgY2xlYW5lZDogYW55ID0ge307XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY2xlYW5lZFtrZXldID0gcmVtb3ZlVW5kZWZpbmVkVmFsdWVzKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNsZWFuZWQ7XG4gIH1cbiAgXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTWFpbiBMYW1iZGEgaGFuZGxlciBmdW5jdGlvbiBmb3IgYW5hbHl6aW5nIHdlYnNpdGVzXG4gKi9cbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBBUElHYXRld2F5UHJveHlFdmVudCk6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiA9PiB7XG4gIGNvbnNvbGUubG9nKCdFdmVudCByZWNlaXZlZDonLCBKU09OLnN0cmluZ2lmeShldmVudCkpO1xuICBcbiAgdHJ5IHtcbiAgICAvLyBHZXQgVVJMIGZyb20gcXVlcnkgcGFyYW1ldGVyc1xuICAgIGNvbnN0IHVybCA9IGV2ZW50LnF1ZXJ5U3RyaW5nUGFyYW1ldGVycz8udXJsO1xuICAgIFxuICAgIGlmICghdXJsKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICAgIGhlYWRlcnM6IGNvcnNIZWFkZXJzKCksXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdVUkwgcGFyYW1ldGVyIGlzIHJlcXVpcmVkJyB9KVxuICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgY29uc29sZS5sb2coYEFuYWx5emluZyBVUkw6ICR7dXJsfWApO1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgXG4gICAgLy8gQW5hbHl6ZSB0aGUgd2Vic2l0ZSB3aXRoIEFJIGFzc2lzdGFuY2VcbiAgICBjb25zdCBhbmFseXNpc1Jlc3VsdCA9IGF3YWl0IGFuYWx5emVXZWJzaXRlKHVybCk7XG4gICAgXG4gICAgLy8gQ2FsY3VsYXRlIHByb2Nlc3NpbmcgdGltZVxuICAgIGNvbnN0IHRvdGFsVGltZSA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG4gICAgXG4gICAgLy8gQWRkIHBlcmZvcm1hbmNlIG1ldHJpY3NcbiAgICBjb25zdCByZXN1bHRXaXRoUGVyZm9ybWFuY2UgPSB7XG4gICAgICAuLi5hbmFseXNpc1Jlc3VsdCxcbiAgICAgIHBlcmZvcm1hbmNlOiB7XG4gICAgICAgIHRvdGFsVGltZU1zOiB0b3RhbFRpbWVcbiAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIC8vIFN0b3JlIHRoZSBhbmFseXNpcyByZXN1bHQgaW4gRHluYW1vREJcbiAgICB0cnkge1xuICAgICAgY29uc3QgY2xlYW5lZFJlc3VsdCA9IHJlbW92ZVVuZGVmaW5lZFZhbHVlcyh7XG4gICAgICAgIGlkOiBgJHt1cmx9LSR7RGF0ZS5ub3coKX1gLFxuICAgICAgICAuLi5yZXN1bHRXaXRoUGVyZm9ybWFuY2VcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBhd2FpdCBkb2NDbGllbnQuc2VuZChcbiAgICAgICAgbmV3IFB1dENvbW1hbmQoe1xuICAgICAgICAgIFRhYmxlTmFtZTogVEFCTEVfTkFNRSxcbiAgICAgICAgICBJdGVtOiBjbGVhbmVkUmVzdWx0XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coJ0FuYWx5c2lzIHJlc3VsdCBzdG9yZWQgaW4gRHluYW1vREInKTtcbiAgICB9IGNhdGNoIChkYkVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzdG9yaW5nIGFuYWx5c2lzIHJlc3VsdCBpbiBEeW5hbW9EQjonLCBkYkVycm9yKTtcbiAgICAgIC8vIENvbnRpbnVlIGV2ZW4gaWYgREIgc3RvcmFnZSBmYWlsc1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgaGVhZGVyczogY29yc0hlYWRlcnMoKSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHJlc3VsdFdpdGhQZXJmb3JtYW5jZSlcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHByb2Nlc3NpbmcgcmVxdWVzdDonLCBlcnJvcik7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgIGhlYWRlcnM6IGNvcnNIZWFkZXJzKCksXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IFxuICAgICAgICBlcnJvcjogJ0ZhaWxlZCB0byBhbmFseXplIGNvbnRlbnQnLFxuICAgICAgICBtZXNzYWdlOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ1xuICAgICAgfSlcbiAgICB9O1xuICB9XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlIENPUlMgaGVhZGVycyBmb3IgQVBJIHJlc3BvbnNlc1xuICovXG5mdW5jdGlvbiBjb3JzSGVhZGVycygpOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IGJvb2xlYW4gfSB7XG4gIHJldHVybiB7XG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyc6IHRydWUsXG4gIH07XG59ICJdfQ==