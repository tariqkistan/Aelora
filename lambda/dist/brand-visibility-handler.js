"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionsHandler = exports.handler = void 0;
const brand_analysis_service_1 = require("./services/brand-analysis-service");
const brand_storage_service_1 = require("./services/brand-storage-service");
/**
 * AWS Lambda Handler for Brand Visibility Analysis
 *
 * Endpoint: POST /brand-visibility
 * Body: { brandName: string, domain: string, industry: string }
 */
const handler = async (event) => {
    console.log('Brand visibility analysis request received:', JSON.stringify(event));
    try {
        // Validate request method
        if (event.httpMethod !== 'POST') {
            return createErrorResponse(405, 'Method not allowed. Use POST.');
        }
        // Parse and validate request body
        const requestData = parseRequestBody(event.body);
        if (!requestData) {
            return createErrorResponse(400, 'Invalid request body. Expected JSON with brandName, domain, and industry.');
        }
        const { brandName, domain, industry } = requestData;
        // Validate required fields
        if (!brandName || !domain || !industry) {
            return createErrorResponse(400, 'Missing required fields: brandName, domain, industry');
        }
        console.log(`Processing brand visibility analysis for: ${brandName}`);
        // Initialize services
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            console.error('OPENAI_API_KEY environment variable not set');
            return createErrorResponse(500, 'OpenAI API key not configured');
        }
        const analysisService = new brand_analysis_service_1.BrandAnalysisService(openaiApiKey);
        const storageService = new brand_storage_service_1.BrandStorageService(process.env.AWS_REGION);
        // Perform brand analysis
        console.log('Starting brand visibility analysis...');
        const startTime = Date.now();
        const analysis = await analysisService.analyzeBrandVisibility(brandName, domain, industry);
        const analysisTime = Date.now() - startTime;
        console.log(`Brand analysis completed in ${analysisTime}ms`);
        // Create visibility snapshot
        const snapshot = storageService.createVisibilitySnapshot(brandName, domain, industry, analysis, '1.0');
        // Save to DynamoDB
        console.log('Saving brand visibility snapshot to DynamoDB...');
        await storageService.saveBrandVisibilitySnapshot(snapshot);
        // Create or update brand profile
        const existingProfile = await storageService.getBrandProfile(brandName);
        if (!existingProfile) {
            console.log('Creating new brand profile...');
            const newProfile = storageService.createBrandProfile(brandName, domain, industry);
            await storageService.saveBrandProfile(newProfile);
        }
        else {
            console.log('Brand profile already exists, updating timestamp...');
            existingProfile.updatedAt = new Date().toISOString();
            await storageService.saveBrandProfile(existingProfile);
        }
        // Create success response
        const response = {
            success: true,
            data: snapshot
        };
        console.log('Brand visibility analysis completed successfully');
        return {
            statusCode: 200,
            headers: createCorsHeaders(),
            body: JSON.stringify(response)
        };
    }
    catch (error) {
        console.error('Error in brand visibility analysis:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return createErrorResponse(500, `Brand analysis failed: ${errorMessage}`);
    }
};
exports.handler = handler;
/**
 * Parse and validate request body
 */
function parseRequestBody(body) {
    if (!body) {
        return null;
    }
    try {
        const parsed = JSON.parse(body);
        // Basic validation
        if (typeof parsed.brandName === 'string' &&
            typeof parsed.domain === 'string' &&
            typeof parsed.industry === 'string') {
            return {
                brandName: parsed.brandName.trim(),
                domain: parsed.domain.trim(),
                industry: parsed.industry.trim()
            };
        }
        return null;
    }
    catch (error) {
        console.error('Error parsing request body:', error);
        return null;
    }
}
/**
 * Create error response
 */
function createErrorResponse(statusCode, message) {
    const response = {
        success: false,
        error: message
    };
    return {
        statusCode,
        headers: createCorsHeaders(),
        body: JSON.stringify(response)
    };
}
/**
 * Create CORS headers for API responses
 */
function createCorsHeaders() {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Credentials': true,
    };
}
/**
 * Handle OPTIONS requests for CORS preflight
 */
const optionsHandler = async (event) => {
    return {
        statusCode: 200,
        headers: createCorsHeaders(),
        body: ''
    };
};
exports.optionsHandler = optionsHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmQtdmlzaWJpbGl0eS1oYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2JyYW5kLXZpc2liaWxpdHktaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw4RUFBeUU7QUFDekUsNEVBQXVFO0FBT3ZFOzs7OztHQUtHO0FBQ0ksTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQTJCLEVBQWtDLEVBQUU7SUFDM0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2Q0FBNkMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFbEYsSUFBSSxDQUFDO1FBQ0gsMEJBQTBCO1FBQzFCLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxNQUFNLEVBQUUsQ0FBQztZQUNoQyxPQUFPLG1CQUFtQixDQUFDLEdBQUcsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFRCxrQ0FBa0M7UUFDbEMsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNqQixPQUFPLG1CQUFtQixDQUFDLEdBQUcsRUFBRSwyRUFBMkUsQ0FBQyxDQUFDO1FBQy9HLENBQUM7UUFFRCxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxXQUFXLENBQUM7UUFFcEQsMkJBQTJCO1FBQzNCLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN2QyxPQUFPLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxzREFBc0QsQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLDZDQUE2QyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBRXRFLHNCQUFzQjtRQUN0QixNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsR0FBRyxD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NkJBQTZCLEVBQUUsR0FBRztRQUNsQyw4QkFBOEIsRUFBRSxzRUFBc0U7UUFDdEcsOEJBQThCLEVBQUUsY0FBYztRQUM5QyxrQ0FBa0MsRUFBRSxJQUFJO0tBQ3pDLENBQUM7QUFDSixDQUFDO0FBRUQ7O0dBRUc7QUFDSSxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsS0FBMkIsRUFBa0MsRUFBRTtJQUNsRyxPQUFPO1FBQ0wsVUFBVSxFQUFFLEdBQUc7UUFDZixPQUFPLEVBQUUsaUJBQWlCLEVBQUU7UUFDNUIsSUFBSSxFQUFFLEVBQUU7S0FDVCxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBTlcsUUFBQSxjQUFjLGtCQU16QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSUdhdGV3YXlQcm94eUV2ZW50LCBBUElHYXRld2F5UHJveHlSZXN1bHQgfSBmcm9tICdhd3MtbGFtYmRhJztcbmltcG9ydCB7IEJyYW5kQW5hbHlzaXNTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9icmFuZC1hbmFseXNpcy1zZXJ2aWNlJztcbmltcG9ydCB7IEJyYW5kU3RvcmFnZVNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL2JyYW5kLXN0b3JhZ2Utc2VydmljZSc7XG5pbXBvcnQgeyBcbiAgQnJhbmRWaXNpYmlsaXR5UmVxdWVzdCwgXG4gIEJyYW5kVmlzaWJpbGl0eVJlc3BvbnNlLCBcbiAgQnJhbmRWaXNpYmlsaXR5U25hcHNob3QgXG59IGZyb20gJy4vdHlwZXMvYnJhbmQtbW9kZWxzJztcblxuLyoqXG4gKiBBV1MgTGFtYmRhIEhhbmRsZXIgZm9yIEJyYW5kIFZpc2liaWxpdHkgQW5hbHlzaXNcbiAqIFxuICogRW5kcG9pbnQ6IFBPU1QgL2JyYW5kLXZpc2liaWxpdHlcbiAqIEJvZHk6IHsgYnJhbmROYW1lOiBzdHJpbmcsIGRvbWFpbjogc3RyaW5nLCBpbmR1c3RyeTogc3RyaW5nIH1cbiAqL1xuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgY29uc29sZS5sb2coJ0JyYW5kIHZpc2liaWxpdHkgYW5hbHlzaXMgcmVxdWVzdCByZWNlaXZlZDonLCBKU09OLnN0cmluZ2lmeShldmVudCkpO1xuICBcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSByZXF1ZXN0IG1ldGhvZFxuICAgIGlmIChldmVudC5odHRwTWV0aG9kICE9PSAnUE9TVCcpIHtcbiAgICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwNSwgJ01ldGhvZCBub3QgYWxsb3dlZC4gVXNlIFBPU1QuJyk7XG4gICAgfVxuXG4gICAgLy8gUGFyc2UgYW5kIHZhbGlkYXRlIHJlcXVlc3QgYm9keVxuICAgIGNvbnN0IHJlcXVlc3REYXRhID0gcGFyc2VSZXF1ZXN0Qm9keShldmVudC5ib2R5KTtcbiAgICBpZiAoIXJlcXVlc3REYXRhKSB7XG4gICAgICByZXR1cm4gY3JlYXRlRXJyb3JSZXNwb25zZSg0MDAsICdJbnZhbGlkIHJlcXVlc3QgYm9keS4gRXhwZWN0ZWQgSlNPTiB3aXRoIGJyYW5kTmFtZSwgZG9tYWluLCBhbmQgaW5kdXN0cnkuJyk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBicmFuZE5hbWUsIGRvbWFpbiwgaW5kdXN0cnkgfSA9IHJlcXVlc3REYXRhO1xuXG4gICAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzXG4gICAgaWYgKCFicmFuZE5hbWUgfHwgIWRvbWFpbiB8fCAhaW5kdXN0cnkpIHtcbiAgICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDQwMCwgJ01pc3NpbmcgcmVxdWlyZWQgZmllbGRzOiBicmFuZE5hbWUsIGRvbWFpbiwgaW5kdXN0cnknKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhgUHJvY2Vzc2luZyBicmFuZCB2aXNpYmlsaXR5IGFuYWx5c2lzIGZvcjogJHticmFuZE5hbWV9YCk7XG5cbiAgICAvLyBJbml0aWFsaXplIHNlcnZpY2VzXG4gICAgY29uc3Qgb3BlbmFpQXBpS2V5ID0gcHJvY2Vzcy5lbnYuT1BFTkFJX0FQSV9LRVk7XG4gICAgaWYgKCFvcGVuYWlBcGlLZXkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ09QRU5BSV9BUElfS0VZIGVudmlyb25tZW50IHZhcmlhYmxlIG5vdCBzZXQnKTtcbiAgICAgIHJldHVybiBjcmVhdGVFcnJvclJlc3BvbnNlKDUwMCwgJ09wZW5BSSBBUEkga2V5IG5vdCBjb25maWd1cmVkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgYW5hbHlzaXNTZXJ2aWNlID0gbmV3IEJyYW5kQW5hbHlzaXNTZXJ2aWNlKG9wZW5haUFwaUtleSk7XG4gICAgY29uc3Qgc3RvcmFnZVNlcnZpY2UgPSBuZXcgQnJhbmRTdG9yYWdlU2VydmljZShwcm9jZXNzLmVudi5BV1NfUkVHSU9OKTtcblxuICAgIC8vIFBlcmZvcm0gYnJhbmQgYW5hbHlzaXNcbiAgICBjb25zb2xlLmxvZygnU3RhcnRpbmcgYnJhbmQgdmlzaWJpbGl0eSBhbmFseXNpcy4uLicpO1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgXG4gICAgY29uc3QgYW5hbHlzaXMgPSBhd2FpdCBhbmFseXNpc1NlcnZpY2UuYW5hbHl6ZUJyYW5kVmlzaWJpbGl0eShicmFuZE5hbWUsIGRvbWFpbiwgaW5kdXN0cnkpO1xuICAgIFxuICAgIGNvbnN0IGFuYWx5c2lzVGltZSA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG4gICAgY29uc29sZS5sb2coYEJyYW5kIGFuYWx5c2lzIGNvbXBsZXRlZCBpbiAke2FuYWx5c2lzVGltZX1tc2ApO1xuXG4gICAgLy8gQ3JlYXRlIHZpc2liaWxpdHkgc25hcHNob3RcbiAgICBjb25zdCBzbmFwc2hvdCA9IHN0b3JhZ2VTZXJ2aWNlLmNyZWF0ZVZpc2liaWxpdHlTbmFwc2hvdChcbiAgICAgIGJyYW5kTmFtZSxcbiAgICAgIGRvbWFpbixcbiAgICAgIGluZHVzdHJ5LFxuICAgICAgYW5hbHlzaXMsXG4gICAgICAnMS4wJ1xuICAgICk7XG5cbiAgICAvLyBTYXZlIHRvIER5bmFtb0RCXG4gICAgY29uc29sZS5sb2coJ1NhdmluZyBicmFuZCB2aXNpYmlsaXR5IHNuYXBzaG90IHRvIER5bmFtb0RCLi4uJyk7XG4gICAgYXdhaXQgc3RvcmFnZVNlcnZpY2Uuc2F2ZUJyYW5kVmlzaWJpbGl0eVNuYXBzaG90KHNuYXBzaG90KTtcblxuICAgIC8vIENyZWF0ZSBvciB1cGRhdGUgYnJhbmQgcHJvZmlsZVxuICAgIGNvbnN0IGV4aXN0aW5nUHJvZmlsZSA9IGF3YWl0IHN0b3JhZ2VTZXJ2aWNlLmdldEJyYW5kUHJvZmlsZShicmFuZE5hbWUpO1xuICAgIGlmICghZXhpc3RpbmdQcm9maWxlKSB7XG4gICAgICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgbmV3IGJyYW5kIHByb2ZpbGUuLi4nKTtcbiAgICAgIGNvbnN0IG5ld1Byb2ZpbGUgPSBzdG9yYWdlU2VydmljZS5jcmVhdGVCcmFuZFByb2ZpbGUoYnJhbmROYW1lLCBkb21haW4sIGluZHVzdHJ5KTtcbiAgICAgIGF3YWl0IHN0b3JhZ2VTZXJ2aWNlLnNhdmVCcmFuZFByb2ZpbGUobmV3UHJvZmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdCcmFuZCBwcm9maWxlIGFscmVhZHkgZXhpc3RzLCB1cGRhdGluZyB0aW1lc3RhbXAuLi4nKTtcbiAgICAgIGV4aXN0aW5nUHJvZmlsZS51cGRhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICBhd2FpdCBzdG9yYWdlU2VydmljZS5zYXZlQnJhbmRQcm9maWxlKGV4aXN0aW5nUHJvZmlsZSk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHN1Y2Nlc3MgcmVzcG9uc2VcbiAgICBjb25zdCByZXNwb25zZTogQnJhbmRWaXNpYmlsaXR5UmVzcG9uc2UgPSB7XG4gICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgZGF0YTogc25hcHNob3RcbiAgICB9O1xuXG4gICAgY29uc29sZS5sb2coJ0JyYW5kIHZpc2liaWxpdHkgYW5hbHlzaXMgY29tcGxldGVkIHN1Y2Nlc3NmdWxseScpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgIGhlYWRlcnM6IGNyZWF0ZUNvcnNIZWFkZXJzKCksXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXNwb25zZSlcbiAgICB9O1xuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gYnJhbmQgdmlzaWJpbGl0eSBhbmFseXNpczonLCBlcnJvcik7XG4gICAgXG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBvY2N1cnJlZCc7XG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yUmVzcG9uc2UoNTAwLCBgQnJhbmQgYW5hbHlzaXMgZmFpbGVkOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBQYXJzZSBhbmQgdmFsaWRhdGUgcmVxdWVzdCBib2R5XG4gKi9cbmZ1bmN0aW9uIHBhcnNlUmVxdWVzdEJvZHkoYm9keTogc3RyaW5nIHwgbnVsbCk6IEJyYW5kVmlzaWJpbGl0eVJlcXVlc3QgfCBudWxsIHtcbiAgaWYgKCFib2R5KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoYm9keSk7XG4gICAgXG4gICAgLy8gQmFzaWMgdmFsaWRhdGlvblxuICAgIGlmICh0eXBlb2YgcGFyc2VkLmJyYW5kTmFtZSA9PT0gJ3N0cmluZycgJiYgXG4gICAgICAgIHR5cGVvZiBwYXJzZWQuZG9tYWluID09PSAnc3RyaW5nJyAmJiBcbiAgICAgICAgdHlwZW9mIHBhcnNlZC5pbmR1c3RyeSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGJyYW5kTmFtZTogcGFyc2VkLmJyYW5kTmFtZS50cmltKCksXG4gICAgICAgIGRvbWFpbjogcGFyc2VkLmRvbWFpbi50cmltKCksXG4gICAgICAgIGluZHVzdHJ5OiBwYXJzZWQuaW5kdXN0cnkudHJpbSgpXG4gICAgICB9O1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBwYXJzaW5nIHJlcXVlc3QgYm9keTonLCBlcnJvcik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgZXJyb3IgcmVzcG9uc2VcbiAqL1xuZnVuY3Rpb24gY3JlYXRlRXJyb3JSZXNwb25zZShzdGF0dXNDb2RlOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZyk6IEFQSUdhdGV3YXlQcm94eVJlc3VsdCB7XG4gIGNvbnN0IHJlc3BvbnNlOiBCcmFuZFZpc2liaWxpdHlSZXNwb25zZSA9IHtcbiAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICBlcnJvcjogbWVzc2FnZVxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgc3RhdHVzQ29kZSxcbiAgICBoZWFkZXJzOiBjcmVhdGVDb3JzSGVhZGVycygpLFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKVxuICB9O1xufVxuXG4vKipcbiAqIENyZWF0ZSBDT1JTIGhlYWRlcnMgZm9yIEFQSSByZXNwb25zZXNcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ29yc0hlYWRlcnMoKTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBib29sZWFuIH0ge1xuICByZXR1cm4ge1xuICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUsWC1BbXotRGF0ZSxBdXRob3JpemF0aW9uLFgtQXBpLUtleSxYLUFtei1TZWN1cml0eS1Ub2tlbicsXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnUE9TVCxPUFRJT05TJyxcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnOiB0cnVlLFxuICB9O1xufVxuXG4vKipcbiAqIEhhbmRsZSBPUFRJT05TIHJlcXVlc3RzIGZvciBDT1JTIHByZWZsaWdodFxuICovXG5leHBvcnQgY29uc3Qgb3B0aW9uc0hhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgcmV0dXJuIHtcbiAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgaGVhZGVyczogY3JlYXRlQ29yc0hlYWRlcnMoKSxcbiAgICBib2R5OiAnJ1xuICB9O1xufTsgIl19