"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandComparisonStorageService = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const brand_models_1 = require("../types/brand-models");
/**
 * Service for storing and retrieving brand comparison data from DynamoDB
 */
class BrandComparisonStorageService {
    constructor() {
        this.dynamoClient = new client_dynamodb_1.DynamoDBClient({
            region: process.env.AWS_REGION || 'us-east-1'
        });
        this.tableName = process.env.BRAND_COMPARISONS_TABLE || brand_models_1.TABLE_NAMES.BRAND_COMPARISONS;
    }
    /**
     * Store a brand comparison result in DynamoDB
     */
    async storeBrandComparison(brandA, brandB, industry, gptResult) {
        try {
            const timestamp = new Date().toISOString();
            const comparisonId = this.generateComparisonId(brandA, brandB);
            const brandComparison = {
                comparisonId,
                timestamp,
                brandA,
                brandB,
                industry,
                brandAStrengths: gptResult.brandA.strengths,
                brandAWeaknesses: gptResult.brandA.weaknesses,
                brandBStrengths: gptResult.brandB.strengths,
                brandBWeaknesses: gptResult.brandB.weaknesses,
                verdict: gptResult.verdict.reasoning,
                winner: gptResult.verdict.winner,
                analysisDate: timestamp.split('T')[0], // YYYY-MM-DD format
                confidence: gptResult.verdict.confidence,
                summary: gptResult.summary,
                methodology: 'GPT-4 Competitive Analysis',
                createdAt: timestamp,
                updatedAt: timestamp
            };
            // Clean undefined values recursively
            const cleanedComparison = this.removeUndefinedValues(brandComparison);
            const command = new client_dynamodb_1.PutItemCommand({
                TableName: this.tableName,
                Item: (0, util_dynamodb_1.marshall)(cleanedComparison),
                // Prevent overwriting existing comparisons with same ID and timestamp
                ConditionExpression: 'attribute_not_exists(comparisonId) AND attribute_not_exists(#ts)',
                ExpressionAttributeNames: {
                    '#ts': 'timestamp'
                }
            });
            await this.dynamoClient.send(command);
            console.log(`Brand comparison stored successfully: ${comparisonId}`);
            return brandComparison;
        }
        catch (error) {
            console.error('Error storing brand comparison:', error);
            throw new Error(`Failed to store brand comparison: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Retrieve a specific brand comparison by ID and timestamp
     */
    async getBrandComparison(comparisonId, timestamp) {
        try {
            const command = new client_dynamodb_1.GetItemCommand({
                TableName: this.tableName,
                Key: (0, util_dynamodb_1.marshall)({
                    comparisonId,
                    timestamp
                })
            });
            const response = await this.dynamoClient.send(command);
            if (!response.Item) {
                return null;
            }
            return (0, util_dynamodb_1.unmarshall)(response.Item);
        }
        catch (error) {
            console.error('Error retrieving brand comparison:', error);
            throw new Error(`Failed to retrieve brand comparison: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get all comparisons for a specific brand pair
     */
    async getBrandComparisonHistory(brandA, brandB) {
        try {
            const comparisonId = this.generateComparisonId(brandA, brandB);
            const command = new client_dynamodb_1.QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: 'comparisonId = :comparisonId',
                ExpressionAttributeValues: (0, util_dynamodb_1.marshall)({
                    ':comparisonId': comparisonId
                }),
                ScanIndexForward: false, // Sort by timestamp descending (newest first)
                Limit: 10 // Limit to last 10 comparisons
            });
            const response = await this.dynamoClient.send(command);
            if (!response.Items) {
                return [];
            }
            return response.Items.map(item => (0, util_dynamodb_1.unmarshall)(item));
        }
        catch (error) {
            console.error('Error retrieving brand comparison history:', error);
            throw new Error(`Failed to retrieve brand comparison history: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Generate a consistent comparison ID for brand pairs
     * Ensures A-B and B-A comparisons have the same ID by sorting alphabetically
     */
    generateComparisonId(brandA, brandB) {
        const brands = [brandA.toLowerCase(), brandB.toLowerCase()].sort();
        return `${brands[0]}#${brands[1]}`;
    }
    /**
     * Recursively remove undefined values from an object
     */
    removeUndefinedValues(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.removeUndefinedValues(item));
        }
        if (typeof obj === 'object') {
            const cleaned = {};
            for (const [key, value] of Object.entries(obj)) {
                if (value !== undefined) {
                    cleaned[key] = this.removeUndefinedValues(value);
                }
            }
            return cleaned;
        }
        return obj;
    }
    /**
     * Check if a recent comparison exists for the brand pair
     */
    async hasRecentComparison(brandA, brandB, hoursThreshold = 24) {
        try {
            const comparisonId = this.generateComparisonId(brandA, brandB);
            const cutoffTime = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000).toISOString();
            const command = new client_dynamodb_1.QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: 'comparisonId = :comparisonId AND #ts > :cutoffTime',
                ExpressionAttributeNames: {
                    '#ts': 'timestamp'
                },
                ExpressionAttributeValues: (0, util_dynamodb_1.marshall)({
                    ':comparisonId': comparisonId,
                    ':cutoffTime': cutoffTime
                }),
                Limit: 1
            });
            const response = await this.dynamoClient.send(command);
            return !!(response.Items && response.Items.length > 0);
        }
        catch (error) {
            console.error('Error checking for recent comparison:', error);
            return false; // Assume no recent comparison if error occurs
        }
    }
}
exports.BrandComparisonStorageService = BrandComparisonStorageService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmQtY29tcGFyaXNvbi1zdG9yYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL2JyYW5kLWNvbXBhcmlzb24tc3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBd0c7QUFDeEcsMERBQThEO0FBQzlELHdEQUErRjtBQUUvRjs7R0FFRztBQUNILE1BQWEsNkJBQTZCO0lBSXhDO1FBQ0UsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLGdDQUFjLENBQUM7WUFDckMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLFdBQVc7U0FDOUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixJQUFJLDBCQUFXLENBQUMsaUJBQWlCLENBQUM7SUFDeEYsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLG9CQUFvQixDQUN4QixNQUFjLEVBQ2QsTUFBYyxFQUNkLFFBQWdCLEVBQ2hCLFNBQW1DO1FBRW5DLElBQUksQ0FBQztZQUNILE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDM0MsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUUvRCxNQUFNLGVBQWUsR0FBb0I7Z0JBQ3ZDLFlBQVk7Z0JBQ1osU0FBUztnQkFDVCxNQUFNO2dCQUNOLE1BQU07Z0JBQ04sUUFBUTtnQkFDUixlQUFlLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTO2dCQUMzQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7Z0JBQzdDLGVBQWUsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVM7Z0JBQzNDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtnQkFDN0MsT0FB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Q0FBQyxTQUFTO2dCQUN6QixzQkFBc0IsRUFBRSxvREFBb0Q7Z0JBQzVFLHdCQUF3QixFQUFFO29CQUN4QixLQUFLLEVBQUUsV0FBVztpQkFDbkI7Z0JBQ0QseUJBQXlCLEVBQUUsSUFBQSx3QkFBUSxFQUFDO29CQUNsQyxlQUFlLEVBQUUsWUFBWTtvQkFDN0IsYUFBYSxFQUFFLFVBQVU7aUJBQzFCLENBQUM7Z0JBQ0YsS0FBSyxFQUFFLENBQUM7YUFDVCxDQUFDLENBQUM7WUFFSCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUQsT0FBTyxLQUFLLENBQUMsQ0FBQyw4Q0FBOEM7UUFDOUQsQ0FBQztJQUNILENBQUM7Q0FDRjtBQXpMRCxzRUF5TEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEeW5hbW9EQkNsaWVudCwgUHV0SXRlbUNvbW1hbmQsIEdldEl0ZW1Db21tYW5kLCBRdWVyeUNvbW1hbmQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtZHluYW1vZGInO1xuaW1wb3J0IHsgbWFyc2hhbGwsIHVubWFyc2hhbGwgfSBmcm9tICdAYXdzLXNkay91dGlsLWR5bmFtb2RiJztcbmltcG9ydCB7IEJyYW5kQ29tcGFyaXNvbiwgR1BUQnJhbmRDb21wYXJpc29uUmVzdWx0LCBUQUJMRV9OQU1FUyB9IGZyb20gJy4uL3R5cGVzL2JyYW5kLW1vZGVscyc7XG5cbi8qKlxuICogU2VydmljZSBmb3Igc3RvcmluZyBhbmQgcmV0cmlldmluZyBicmFuZCBjb21wYXJpc29uIGRhdGEgZnJvbSBEeW5hbW9EQlxuICovXG5leHBvcnQgY2xhc3MgQnJhbmRDb21wYXJpc29uU3RvcmFnZVNlcnZpY2Uge1xuICBwcml2YXRlIGR5bmFtb0NsaWVudDogRHluYW1vREJDbGllbnQ7XG4gIHByaXZhdGUgdGFibGVOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5keW5hbW9DbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoeyBcbiAgICAgIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB8fCAndXMtZWFzdC0xJ1xuICAgIH0pO1xuICAgIHRoaXMudGFibGVOYW1lID0gcHJvY2Vzcy5lbnYuQlJBTkRfQ09NUEFSSVNPTlNfVEFCTEUgfHwgVEFCTEVfTkFNRVMuQlJBTkRfQ09NUEFSSVNPTlM7XG4gIH1cblxuICAvKipcbiAgICogU3RvcmUgYSBicmFuZCBjb21wYXJpc29uIHJlc3VsdCBpbiBEeW5hbW9EQlxuICAgKi9cbiAgYXN5bmMgc3RvcmVCcmFuZENvbXBhcmlzb24oXG4gICAgYnJhbmRBOiBzdHJpbmcsIFxuICAgIGJyYW5kQjogc3RyaW5nLCBcbiAgICBpbmR1c3RyeTogc3RyaW5nLCBcbiAgICBncHRSZXN1bHQ6IEdQVEJyYW5kQ29tcGFyaXNvblJlc3VsdFxuICApOiBQcm9taXNlPEJyYW5kQ29tcGFyaXNvbj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICBjb25zdCBjb21wYXJpc29uSWQgPSB0aGlzLmdlbmVyYXRlQ29tcGFyaXNvbklkKGJyYW5kQSwgYnJhbmRCKTtcbiAgICAgIFxuICAgICAgY29uc3QgYnJhbmRDb21wYXJpc29uOiBCcmFuZENvbXBhcmlzb24gPSB7XG4gICAgICAgIGNvbXBhcmlzb25JZCxcbiAgICAgICAgdGltZXN0YW1wLFxuICAgICAgICBicmFuZEEsXG4gICAgICAgIGJyYW5kQixcbiAgICAgICAgaW5kdXN0cnksXG4gICAgICAgIGJyYW5kQVN0cmVuZ3RoczogZ3B0UmVzdWx0LmJyYW5kQS5zdHJlbmd0aHMsXG4gICAgICAgIGJyYW5kQVdlYWtuZXNzZXM6IGdwdFJlc3VsdC5icmFuZEEud2Vha25lc3NlcyxcbiAgICAgICAgYnJhbmRCU3RyZW5ndGhzOiBncHRSZXN1bHQuYnJhbmRCLnN0cmVuZ3RocyxcbiAgICAgICAgYnJhbmRCV2Vha25lc3NlczogZ3B0UmVzdWx0LmJyYW5kQi53ZWFrbmVzc2VzLFxuICAgICAgICB2ZXJkaWN0OiBncHRSZXN1bHQudmVyZGljdC5yZWFzb25pbmcsXG4gICAgICAgIHdpbm5lcjogZ3B0UmVzdWx0LnZlcmRpY3Qud2lubmVyLFxuICAgICAgICBhbmFseXNpc0RhdGU6IHRpbWVzdGFtcC5zcGxpdCgnVCcpWzBdLCAvLyBZWVlZLU1NLUREIGZvcm1hdFxuICAgICAgICBjb25maWRlbmNlOiBncHRSZXN1bHQudmVyZGljdC5jb25maWRlbmNlLFxuICAgICAgICBzdW1tYXJ5OiBncHRSZXN1bHQuc3VtbWFyeSxcbiAgICAgICAgbWV0aG9kb2xvZ3k6ICdHUFQtNCBDb21wZXRpdGl2ZSBBbmFseXNpcycsXG4gICAgICAgIGNyZWF0ZWRBdDogdGltZXN0YW1wLFxuICAgICAgICB1cGRhdGVkQXQ6IHRpbWVzdGFtcFxuICAgICAgfTtcblxuICAgICAgLy8gQ2xlYW4gdW5kZWZpbmVkIHZhbHVlcyByZWN1cnNpdmVseVxuICAgICAgY29uc3QgY2xlYW5lZENvbXBhcmlzb24gPSB0aGlzLnJlbW92ZVVuZGVmaW5lZFZhbHVlcyhicmFuZENvbXBhcmlzb24pO1xuXG4gICAgICBjb25zdCBjb21tYW5kID0gbmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICAgICAgVGFibGVOYW1lOiB0aGlzLnRhYmxlTmFtZSxcbiAgICAgICAgSXRlbTogbWFyc2hhbGwoY2xlYW5lZENvbXBhcmlzb24pLFxuICAgICAgICAvLyBQcmV2ZW50IG92ZXJ3cml0aW5nIGV4aXN0aW5nIGNvbXBhcmlzb25zIHdpdGggc2FtZSBJRCBhbmQgdGltZXN0YW1wXG4gICAgICAgIENvbmRpdGlvbkV4cHJlc3Npb246ICdhdHRyaWJ1dGVfbm90X2V4aXN0cyhjb21wYXJpc29uSWQpIEFORCBhdHRyaWJ1dGVfbm90X2V4aXN0cygjdHMpJyxcbiAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgJyN0cyc6ICd0aW1lc3RhbXAnXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBhd2FpdCB0aGlzLmR5bmFtb0NsaWVudC5zZW5kKGNvbW1hbmQpO1xuICAgICAgXG4gICAgICBjb25zb2xlLmxvZyhgQnJhbmQgY29tcGFyaXNvbiBzdG9yZWQgc3VjY2Vzc2Z1bGx5OiAke2NvbXBhcmlzb25JZH1gKTtcbiAgICAgIHJldHVybiBicmFuZENvbXBhcmlzb247XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHN0b3JpbmcgYnJhbmQgY29tcGFyaXNvbjonLCBlcnJvcik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBzdG9yZSBicmFuZCBjb21wYXJpc29uOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBhIHNwZWNpZmljIGJyYW5kIGNvbXBhcmlzb24gYnkgSUQgYW5kIHRpbWVzdGFtcFxuICAgKi9cbiAgYXN5bmMgZ2V0QnJhbmRDb21wYXJpc29uKGNvbXBhcmlzb25JZDogc3RyaW5nLCB0aW1lc3RhbXA6IHN0cmluZyk6IFByb21pc2U8QnJhbmRDb21wYXJpc29uIHwgbnVsbD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb21tYW5kID0gbmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgVGFibGVOYW1lOiB0aGlzLnRhYmxlTmFtZSxcbiAgICAgICAgS2V5OiBtYXJzaGFsbCh7XG4gICAgICAgICAgY29tcGFyaXNvbklkLFxuICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICB9KVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5keW5hbW9DbGllbnQuc2VuZChjb21tYW5kKTtcbiAgICAgIFxuICAgICAgaWYgKCFyZXNwb25zZS5JdGVtKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdW5tYXJzaGFsbChyZXNwb25zZS5JdGVtKSBhcyBCcmFuZENvbXBhcmlzb247XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHJldHJpZXZpbmcgYnJhbmQgY29tcGFyaXNvbjonLCBlcnJvcik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byByZXRyaWV2ZSBicmFuZCBjb21wYXJpc29uOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGNvbXBhcmlzb25zIGZvciBhIHNwZWNpZmljIGJyYW5kIHBhaXJcbiAgICovXG4gIGFzeW5jIGdldEJyYW5kQ29tcGFyaXNvbkhpc3RvcnkoYnJhbmRBOiBzdHJpbmcsIGJyYW5kQjogc3RyaW5nKTogUHJvbWlzZTxCcmFuZENvbXBhcmlzb25bXT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb21wYXJpc29uSWQgPSB0aGlzLmdlbmVyYXRlQ29tcGFyaXNvbklkKGJyYW5kQSwgYnJhbmRCKTtcbiAgICAgIFxuICAgICAgY29uc3QgY29tbWFuZCA9IG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgICBUYWJsZU5hbWU6IHRoaXMudGFibGVOYW1lLFxuICAgICAgICBLZXlDb25kaXRpb25FeHByZXNzaW9uOiAnY29tcGFyaXNvbklkID0gOmNvbXBhcmlzb25JZCcsXG4gICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IG1hcnNoYWxsKHtcbiAgICAgICAgICAnOmNvbXBhcmlzb25JZCc6IGNvbXBhcmlzb25JZFxuICAgICAgICB9KSxcbiAgICAgICAgU2NhbkluZGV4Rm9yd2FyZDogZmFsc2UsIC8vIFNvcnQgYnkgdGltZXN0YW1wIGRlc2NlbmRpbmcgKG5ld2VzdCBmaXJzdClcbiAgICAgICAgTGltaXQ6IDEwIC8vIExpbWl0IHRvIGxhc3QgMTAgY29tcGFyaXNvbnNcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZHluYW1vQ2xpZW50LnNlbmQoY29tbWFuZCk7XG4gICAgICBcbiAgICAgIGlmICghcmVzcG9uc2UuSXRlbXMpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzcG9uc2UuSXRlbXMubWFwKGl0ZW0gPT4gdW5tYXJzaGFsbChpdGVtKSBhcyBCcmFuZENvbXBhcmlzb24pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZXRyaWV2aW5nIGJyYW5kIGNvbXBhcmlzb24gaGlzdG9yeTonLCBlcnJvcik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byByZXRyaWV2ZSBicmFuZCBjb21wYXJpc29uIGhpc3Rvcnk6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgY29uc2lzdGVudCBjb21wYXJpc29uIElEIGZvciBicmFuZCBwYWlyc1xuICAgKiBFbnN1cmVzIEEtQiBhbmQgQi1BIGNvbXBhcmlzb25zIGhhdmUgdGhlIHNhbWUgSUQgYnkgc29ydGluZyBhbHBoYWJldGljYWxseVxuICAgKi9cbiAgcHJpdmF0ZSBnZW5lcmF0ZUNvbXBhcmlzb25JZChicmFuZEE6IHN0cmluZywgYnJhbmRCOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IGJyYW5kcyA9IFticmFuZEEudG9Mb3dlckNhc2UoKSwgYnJhbmRCLnRvTG93ZXJDYXNlKCldLnNvcnQoKTtcbiAgICByZXR1cm4gYCR7YnJhbmRzWzBdfSMke2JyYW5kc1sxXX1gO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZWx5IHJlbW92ZSB1bmRlZmluZWQgdmFsdWVzIGZyb20gYW4gb2JqZWN0XG4gICAqL1xuICBwcml2YXRlIHJlbW92ZVVuZGVmaW5lZFZhbHVlcyhvYmo6IGFueSk6IGFueSB7XG4gICAgaWYgKG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgXG4gICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgcmV0dXJuIG9iai5tYXAoaXRlbSA9PiB0aGlzLnJlbW92ZVVuZGVmaW5lZFZhbHVlcyhpdGVtKSk7XG4gICAgfVxuICAgIFxuICAgIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgY2xlYW5lZDogYW55ID0ge307XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgY2xlYW5lZFtrZXldID0gdGhpcy5yZW1vdmVVbmRlZmluZWRWYWx1ZXModmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY2xlYW5lZDtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhIHJlY2VudCBjb21wYXJpc29uIGV4aXN0cyBmb3IgdGhlIGJyYW5kIHBhaXJcbiAgICovXG4gIGFzeW5jIGhhc1JlY2VudENvbXBhcmlzb24oYnJhbmRBOiBzdHJpbmcsIGJyYW5kQjogc3RyaW5nLCBob3Vyc1RocmVzaG9sZDogbnVtYmVyID0gMjQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY29tcGFyaXNvbklkID0gdGhpcy5nZW5lcmF0ZUNvbXBhcmlzb25JZChicmFuZEEsIGJyYW5kQik7XG4gICAgICBjb25zdCBjdXRvZmZUaW1lID0gbmV3IERhdGUoRGF0ZS5ub3coKSAtIGhvdXJzVGhyZXNob2xkICogNjAgKiA2MCAqIDEwMDApLnRvSVNPU3RyaW5nKCk7XG4gICAgICBcbiAgICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgUXVlcnlDb21tYW5kKHtcbiAgICAgICAgVGFibGVOYW1lOiB0aGlzLnRhYmxlTmFtZSxcbiAgICAgICAgS2V5Q29uZGl0aW9uRXhwcmVzc2lvbjogJ2NvbXBhcmlzb25JZCA9IDpjb21wYXJpc29uSWQgQU5EICN0cyA+IDpjdXRvZmZUaW1lJyxcbiAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgJyN0cyc6ICd0aW1lc3RhbXAnXG4gICAgICAgIH0sXG4gICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IG1hcnNoYWxsKHtcbiAgICAgICAgICAnOmNvbXBhcmlzb25JZCc6IGNvbXBhcmlzb25JZCxcbiAgICAgICAgICAnOmN1dG9mZlRpbWUnOiBjdXRvZmZUaW1lXG4gICAgICAgIH0pLFxuICAgICAgICBMaW1pdDogMVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5keW5hbW9DbGllbnQuc2VuZChjb21tYW5kKTtcbiAgICAgIHJldHVybiAhIShyZXNwb25zZS5JdGVtcyAmJiByZXNwb25zZS5JdGVtcy5sZW5ndGggPiAwKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2hlY2tpbmcgZm9yIHJlY2VudCBjb21wYXJpc29uOicsIGVycm9yKTtcbiAgICAgIHJldHVybiBmYWxzZTsgLy8gQXNzdW1lIG5vIHJlY2VudCBjb21wYXJpc29uIGlmIGVycm9yIG9jY3Vyc1xuICAgIH1cbiAgfVxufSAiXX0=