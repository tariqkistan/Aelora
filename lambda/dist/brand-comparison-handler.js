"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.handler = void 0;
const brand_comparison_service_1 = require("./services/brand-comparison-service");
const brand_comparison_storage_1 = require("./services/brand-comparison-storage");
/**
 * AWS Lambda handler for brand comparison functionality
 */
const handler = async (event) => {
    console.log('Brand comparison request received:', JSON.stringify(event, null, 2));
    // CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    };
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight successful' })
        };
    }
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Method not allowed. Use POST.'
            })
        };
    }
    try {
        // Parse request body
        if (!event.body) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Request body is required'
                })
            };
        }
        const requestData = JSON.parse(event.body);
        // Validate required fields
        const validationError = validateRequest(requestData);
        if (validationError) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: validationError
                })
            };
        }
        const { brandA, brandB, industry } = requestData;
        // Initialize services
        const comparisonService = new brand_comparison_service_1.BrandComparisonService();
        const storageService = new brand_comparison_storage_1.BrandComparisonStorageService();
        console.log(`Starting brand comparison: ${brandA} vs ${brandB} in ${industry}`);
        // Check if we have a recent comparison (within 24 hours)
        const hasRecentComparison = await storageService.hasRecentComparison(brandA, brandB, 24);
        if (hasRecentComparison) {
            console.log('Recent comparison found, retrieving from storage');
            const history = await storageService.getBrandComparisonHistory(brandA, brandB);
            if (history.length > 0) {
                const response = {
                    success: true,
                    data: history[0] // Most recent comparison
                };
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(response)
                };
            }
        }
        // Perform GPT-4 analysis
        console.log('Performing new GPT-4 analysis');
        const gptResult = await comparisonService.compareBrands(brandA, brandB, industry);
        // Store the result in DynamoDB
        console.log('Storing comparison result in DynamoDB');
        const storedComparison = await storageService.storeBrandComparison(brandA, brandB, industry, gptResult);
        // Return successful response
        const response = {
            success: true,
            data: storedComparison
        };
        console.log('Brand comparison completed successfully');
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };
    }
    catch (error) {
        console.error('Error in brand comparison handler:', error);
        // Return error response
        const errorResponse = {
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        };
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify(errorResponse)
        };
    }
};
exports.handler = handler;
/**
 * Validate the brand comparison request
 */
function validateRequest(request) {
    if (!request) {
        return 'Request data is required';
    }
    if (!request.brandA || typeof request.brandA !== 'string') {
        return 'brandA is required and must be a string';
    }
    if (!request.brandB || typeof request.brandB !== 'string') {
        return 'brandB is required and must be a string';
    }
    if (!request.industry || typeof request.industry !== 'string') {
        return 'industry is required and must be a string';
    }
    // Validate brand names are not empty after trimming
    if (request.brandA.trim().length === 0) {
        return 'brandA cannot be empty';
    }
    if (request.brandB.trim().length === 0) {
        return 'brandB cannot be empty';
    }
    if (request.industry.trim().length === 0) {
        return 'industry cannot be empty';
    }
    // Validate brands are different
    if (request.brandA.toLowerCase().trim() === request.brandB.toLowerCase().trim()) {
        return 'brandA and brandB must be different brands';
    }
    // Validate string lengths
    if (request.brandA.length > 100) {
        return 'brandA must be 100 characters or less';
    }
    if (request.brandB.length > 100) {
        return 'brandB must be 100 characters or less';
    }
    if (request.industry.length > 100) {
        return 'industry must be 100 characters or less';
    }
    return null; // No validation errors
}
/**
 * Health check endpoint
 */
const healthCheck = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            service: 'brand-comparison',
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        })
    };
};
exports.healthCheck = healthCheck;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmQtY29tcGFyaXNvbi1oYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2JyYW5kLWNvbXBhcmlzb24taGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxrRkFBNkU7QUFDN0Usa0ZBQW9GO0FBR3BGOztHQUVHO0FBQ0ksTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQTJCLEVBQWtDLEVBQUU7SUFDM0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVsRixlQUFlO0lBQ2YsTUFBTSxPQUFPLEdBQUc7UUFDZCxjQUFjLEVBQUUsa0JBQWtCO1FBQ2xDLDZCQUE2QixFQUFFLEdBQUc7UUFDbEMsOEJBQThCLEVBQUUsc0VBQXNFO1FBQ3RHLDhCQUE4QixFQUFFLGtCQUFrQjtLQUNuRCxDQUFDO0lBRUYsNEJBQTRCO0lBQzVCLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNuQyxPQUFPO1lBQ0wsVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPO1lBQ1AsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsQ0FBQztTQUMvRCxDQUFDO0lBQ0osQ0FBQztJQUVELDJCQUEyQjtJQUMzQixJQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssTUFBTSxFQUFFLENBQUM7UUFDaEMsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsT0FBTztZQUNQLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNuQixPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsK0JBQStCO2FBQ3ZDLENBQUM7U0FDSCxDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksQ0FBQztRQUNILHFCQUFxQjtRQUNyQixJQUFJLENBQUMs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O1lBQzNCLE1BQU0sRUFBRSxTQUFTO1lBQ2pCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtZQUNuQyxPQUFPLEVBQUUsT0FBTztTQUNqQixDQUFDO0tBQ0gsQ0FBQztBQUNKLENBQUMsQ0FBQztBQWhCVyxRQUFBLFdBQVcsZUFnQnRCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgQnJhbmRDb21wYXJpc29uU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvYnJhbmQtY29tcGFyaXNvbi1zZXJ2aWNlJztcbmltcG9ydCB7IEJyYW5kQ29tcGFyaXNvblN0b3JhZ2VTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9icmFuZC1jb21wYXJpc29uLXN0b3JhZ2UnO1xuaW1wb3J0IHsgQnJhbmRDb21wYXJpc29uUmVxdWVzdCwgQnJhbmRDb21wYXJpc29uUmVzcG9uc2UgfSBmcm9tICcuL3R5cGVzL2JyYW5kLW1vZGVscyc7XG5cbi8qKlxuICogQVdTIExhbWJkYSBoYW5kbGVyIGZvciBicmFuZCBjb21wYXJpc29uIGZ1bmN0aW9uYWxpdHlcbiAqL1xuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgY29uc29sZS5sb2coJ0JyYW5kIGNvbXBhcmlzb24gcmVxdWVzdCByZWNlaXZlZDonLCBKU09OLnN0cmluZ2lmeShldmVudCwgbnVsbCwgMikpO1xuXG4gIC8vIENPUlMgaGVhZGVyc1xuICBjb25zdCBoZWFkZXJzID0ge1xuICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUsWC1BbXotRGF0ZSxBdXRob3JpemF0aW9uLFgtQXBpLUtleSxYLUFtei1TZWN1cml0eS1Ub2tlbicsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnT1BUSU9OUyxQT1NULEdFVCdcbiAgfTtcblxuICAvLyBIYW5kbGUgcHJlZmxpZ2h0IHJlcXVlc3RzXG4gIGlmIChldmVudC5odHRwTWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ0NPUlMgcHJlZmxpZ2h0IHN1Y2Nlc3NmdWwnIH0pXG4gICAgfTtcbiAgfVxuXG4gIC8vIE9ubHkgYWxsb3cgUE9TVCByZXF1ZXN0c1xuICBpZiAoZXZlbnQuaHR0cE1ldGhvZCAhPT0gJ1BPU1QnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwNSxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IFxuICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgIGVycm9yOiAnTWV0aG9kIG5vdCBhbGxvd2VkLiBVc2UgUE9TVC4nIFxuICAgICAgfSlcbiAgICB9O1xuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBQYXJzZSByZXF1ZXN0IGJvZHlcbiAgICBpZiAoIWV2ZW50LmJvZHkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgICAgZXJyb3I6ICdSZXF1ZXN0IGJvZHkgaXMgcmVxdWlyZWQnIFxuICAgICAgICB9KVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCByZXF1ZXN0RGF0YTogQnJhbmRDb21wYXJpc29uUmVxdWVzdCA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSk7XG4gICAgXG4gICAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzXG4gICAgY29uc3QgdmFsaWRhdGlvbkVycm9yID0gdmFsaWRhdGVSZXF1ZXN0KHJlcXVlc3REYXRhKTtcbiAgICBpZiAodmFsaWRhdGlvbkVycm9yKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgXG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsIFxuICAgICAgICAgIGVycm9yOiB2YWxpZGF0aW9uRXJyb3IgXG4gICAgICAgIH0pXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHsgYnJhbmRBLCBicmFuZEIsIGluZHVzdHJ5IH0gPSByZXF1ZXN0RGF0YTtcblxuICAgIC8vIEluaXRpYWxpemUgc2VydmljZXNcbiAgICBjb25zdCBjb21wYXJpc29uU2VydmljZSA9IG5ldyBCcmFuZENvbXBhcmlzb25TZXJ2aWNlKCk7XG4gICAgY29uc3Qgc3RvcmFnZVNlcnZpY2UgPSBuZXcgQnJhbmRDb21wYXJpc29uU3RvcmFnZVNlcnZpY2UoKTtcblxuICAgIGNvbnNvbGUubG9nKGBTdGFydGluZyBicmFuZCBjb21wYXJpc29uOiAke2JyYW5kQX0gdnMgJHticmFuZEJ9IGluICR7aW5kdXN0cnl9YCk7XG5cbiAgICAvLyBDaGVjayBpZiB3ZSBoYXZlIGEgcmVjZW50IGNvbXBhcmlzb24gKHdpdGhpbiAyNCBob3VycylcbiAgICBjb25zdCBoYXNSZWNlbnRDb21wYXJpc29uID0gYXdhaXQgc3RvcmFnZVNlcnZpY2UuaGFzUmVjZW50Q29tcGFyaXNvbihicmFuZEEsIGJyYW5kQiwgMjQpO1xuICAgIFxuICAgIGlmIChoYXNSZWNlbnRDb21wYXJpc29uKSB7XG4gICAgICBjb25zb2xlLmxvZygnUmVjZW50IGNvbXBhcmlzb24gZm91bmQsIHJldHJpZXZpbmcgZnJvbSBzdG9yYWdlJyk7XG4gICAgICBjb25zdCBoaXN0b3J5ID0gYXdhaXQgc3RvcmFnZVNlcnZpY2UuZ2V0QnJhbmRDb21wYXJpc29uSGlzdG9yeShicmFuZEEsIGJyYW5kQik7XG4gICAgICBcbiAgICAgIGlmIChoaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2U6IEJyYW5kQ29tcGFyaXNvblJlc3BvbnNlID0ge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgZGF0YTogaGlzdG9yeVswXSAvLyBNb3N0IHJlY2VudCBjb21wYXJpc29uXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFBlcmZvcm0gR1BULTQgYW5hbHlzaXNcbiAgICBjb25zb2xlLmxvZygnUGVyZm9ybWluZyBuZXcgR1BULTQgYW5hbHlzaXMnKTtcbiAgICBjb25zdCBncHRSZXN1bHQgPSBhd2FpdCBjb21wYXJpc29uU2VydmljZS5jb21wYXJlQnJhbmRzKGJyYW5kQSwgYnJhbmRCLCBpbmR1c3RyeSk7XG4gICAgXG4gICAgLy8gU3RvcmUgdGhlIHJlc3VsdCBpbiBEeW5hbW9EQlxuICAgIGNvbnNvbGUubG9nKCdTdG9yaW5nIGNvbXBhcmlzb24gcmVzdWx0IGluIER5bmFtb0RCJyk7XG4gICAgY29uc3Qgc3RvcmVkQ29tcGFyaXNvbiA9IGF3YWl0IHN0b3JhZ2VTZXJ2aWNlLnN0b3JlQnJhbmRDb21wYXJpc29uKFxuICAgICAgYnJhbmRBLCBcbiAgICAgIGJyYW5kQiwgXG4gICAgICBpbmR1c3RyeSwgXG4gICAgICBncHRSZXN1bHRcbiAgICApO1xuXG4gICAgLy8gUmV0dXJuIHN1Y2Nlc3NmdWwgcmVzcG9uc2VcbiAgICBjb25zdCByZXNwb25zZTogQnJhbmRDb21wYXJpc29uUmVzcG9uc2UgPSB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YTogc3RvcmVkQ29tcGFyaXNvblxuICAgIH07XG5cbiAgICBjb25zb2xlLmxvZygnQnJhbmQgY29tcGFyaXNvbiBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXNwb25zZSlcbiAgICB9O1xuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gYnJhbmQgY29tcGFyaXNvbiBoYW5kbGVyOicsIGVycm9yKTtcbiAgICBcbiAgICAvLyBSZXR1cm4gZXJyb3IgcmVzcG9uc2VcbiAgICBjb25zdCBlcnJvclJlc3BvbnNlOiBCcmFuZENvbXBhcmlzb25SZXNwb25zZSA9IHtcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ0ludGVybmFsIHNlcnZlciBlcnJvcidcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShlcnJvclJlc3BvbnNlKVxuICAgIH07XG4gIH1cbn07XG5cbi8qKlxuICogVmFsaWRhdGUgdGhlIGJyYW5kIGNvbXBhcmlzb24gcmVxdWVzdFxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZVJlcXVlc3QocmVxdWVzdDogYW55KTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmICghcmVxdWVzdCkge1xuICAgIHJldHVybiAnUmVxdWVzdCBkYXRhIGlzIHJlcXVpcmVkJztcbiAgfVxuXG4gIGlmICghcmVxdWVzdC5icmFuZEEgfHwgdHlwZW9mIHJlcXVlc3QuYnJhbmRBICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiAnYnJhbmRBIGlzIHJlcXVpcmVkIGFuZCBtdXN0IGJlIGEgc3RyaW5nJztcbiAgfVxuXG4gIGlmICghcmVxdWVzdC5icmFuZEIgfHwgdHlwZW9mIHJlcXVlc3QuYnJhbmRCICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiAnYnJhbmRCIGlzIHJlcXVpcmVkIGFuZCBtdXN0IGJlIGEgc3RyaW5nJztcbiAgfVxuXG4gIGlmICghcmVxdWVzdC5pbmR1c3RyeSB8fCB0eXBlb2YgcmVxdWVzdC5pbmR1c3RyeSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gJ2luZHVzdHJ5IGlzIHJlcXVpcmVkIGFuZCBtdXN0IGJlIGEgc3RyaW5nJztcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIGJyYW5kIG5hbWVzIGFyZSBub3QgZW1wdHkgYWZ0ZXIgdHJpbW1pbmdcbiAgaWYgKHJlcXVlc3QuYnJhbmRBLnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gJ2JyYW5kQSBjYW5ub3QgYmUgZW1wdHknO1xuICB9XG5cbiAgaWYgKHJlcXVlc3QuYnJhbmRCLnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gJ2JyYW5kQiBjYW5ub3QgYmUgZW1wdHknO1xuICB9XG5cbiAgaWYgKHJlcXVlc3QuaW5kdXN0cnkudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAnaW5kdXN0cnkgY2Fubm90IGJlIGVtcHR5JztcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIGJyYW5kcyBhcmUgZGlmZmVyZW50XG4gIGlmIChyZXF1ZXN0LmJyYW5kQS50b0xvd2VyQ2FzZSgpLnRyaW0oKSA9PT0gcmVxdWVzdC5icmFuZEIudG9Mb3dlckNhc2UoKS50cmltKCkpIHtcbiAgICByZXR1cm4gJ2JyYW5kQSBhbmQgYnJhbmRCIG11c3QgYmUgZGlmZmVyZW50IGJyYW5kcyc7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBzdHJpbmcgbGVuZ3Roc1xuICBpZiAocmVxdWVzdC5icmFuZEEubGVuZ3RoID4gMTAwKSB7XG4gICAgcmV0dXJuICdicmFuZEEgbXVzdCBiZSAxMDAgY2hhcmFjdGVycyBvciBsZXNzJztcbiAgfVxuXG4gIGlmIChyZXF1ZXN0LmJyYW5kQi5sZW5ndGggPiAxMDApIHtcbiAgICByZXR1cm4gJ2JyYW5kQiBtdXN0IGJlIDEwMCBjaGFyYWN0ZXJzIG9yIGxlc3MnO1xuICB9XG5cbiAgaWYgKHJlcXVlc3QuaW5kdXN0cnkubGVuZ3RoID4gMTAwKSB7XG4gICAgcmV0dXJuICdpbmR1c3RyeSBtdXN0IGJlIDEwMCBjaGFyYWN0ZXJzIG9yIGxlc3MnO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7IC8vIE5vIHZhbGlkYXRpb24gZXJyb3JzXG59XG5cbi8qKlxuICogSGVhbHRoIGNoZWNrIGVuZHBvaW50XG4gKi9cbmV4cG9ydCBjb25zdCBoZWFsdGhDaGVjayA9IGFzeW5jIChldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnQpOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xuICBjb25zdCBoZWFkZXJzID0ge1xuICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJ1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgc3RhdHVzQ29kZTogMjAwLFxuICAgIGhlYWRlcnMsXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgc2VydmljZTogJ2JyYW5kLWNvbXBhcmlzb24nLFxuICAgICAgc3RhdHVzOiAnaGVhbHRoeScsXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHZlcnNpb246ICcxLjAuMCdcbiAgICB9KVxuICB9O1xufTsgIl19