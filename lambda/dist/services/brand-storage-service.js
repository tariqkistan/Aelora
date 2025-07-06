"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandStorageService = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const brand_models_1 = require("../types/brand-models");
/**
 * DynamoDB Storage Service for Brand Data
 */
class BrandStorageService {
    constructor(region = 'us-east-1') {
        const client = new client_dynamodb_1.DynamoDBClient({ region });
        this.docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client, {
            marshallOptions: {
                removeUndefinedValues: true
            }
        });
        // Use environment variables or defaults
        this.visibilityTableName = process.env.BRAND_VISIBILITY_TABLE_NAME || brand_models_1.TABLE_NAMES.BRAND_VISIBILITY_SNAPSHOTS;
        this.profilesTableName = process.env.BRAND_PROFILES_TABLE_NAME || brand_models_1.TABLE_NAMES.BRAND_PROFILES;
    }
    /**
     * Save a brand visibility snapshot to DynamoDB
     */
    async saveBrandVisibilitySnapshot(snapshot) {
        try {
            console.log(`Saving brand visibility snapshot for: ${snapshot.brandName}`);
            // Clean the data before saving
            const cleanedSnapshot = this.removeUndefinedValues(snapshot);
            await this.docClient.send(new lib_dynamodb_1.PutCommand({
                TableName: this.visibilityTableName,
                Item: cleanedSnapshot
            }));
            console.log('Brand visibility snapshot saved successfully');
        }
        catch (error) {
            console.error('Error saving brand visibility snapshot:', error);
            throw new Error(`Failed to save brand visibility snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get the latest brand visibility snapshot
     */
    async getLatestBrandVisibilitySnapshot(brandName) {
        try {
            console.log(`Fetching latest snapshot for brand: ${brandName}`);
            const result = await this.docClient.send(new lib_dynamodb_1.QueryCommand({
                TableName: this.visibilityTableName,
                KeyConditionExpression: 'brandName = :brandName',
                ExpressionAttributeValues: {
                    ':brandName': brandName
                },
                ScanIndexForward: false, // Sort by timestamp descending
                Limit: 1
            }));
            if (result.Items && result.Items.length > 0) {
                return result.Items[0];
            }
            return null;
        }
        catch (error) {
            console.error('Error fetching brand visibility snapshot:', error);
            throw new Error(`Failed to fetch brand visibility snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get brand visibility history (multiple snapshots)
     */
    async getBrandVisibilityHistory(brandName, limit = 10) {
        try {
            console.log(`Fetching visibility history for brand: ${brandName}, limit: ${limit}`);
            const result = await this.docClient.send(new lib_dynamodb_1.QueryCommand({
                TableName: this.visibilityTableName,
                KeyConditionExpression: 'brandName = :brandName',
                ExpressionAttributeValues: {
                    ':brandName': brandName
                },
                ScanIndexForward: false, // Sort by timestamp descending
                Limit: limit
            }));
            return (result.Items || []);
        }
        catch (error) {
            console.error('Error fetching brand visibility history:', error);
            throw new Error(`Failed to fetch brand visibility history: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Save or update a brand profile
     */
    async saveBrandProfile(profile) {
        try {
            console.log(`Saving brand profile for: ${profile.brandName}`);
            // Clean the data before saving
            const cleanedProfile = this.removeUndefinedValues(profile);
            await this.docClient.send(new lib_dynamodb_1.PutCommand({
                TableName: this.profilesTableName,
                Item: cleanedProfile
            }));
            console.log('Brand profile saved successfully');
        }
        catch (error) {
            console.error('Error saving brand profile:', error);
            throw new Error(`Failed to save brand profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get a brand profile
     */
    async getBrandProfile(brandName) {
        try {
            console.log(`Fetching brand profile for: ${brandName}`);
            const result = await this.docClient.send(new lib_dynamodb_1.GetCommand({
                TableName: this.profilesTableName,
                Key: {
                    brandName: brandName
                }
            }));
            if (result.Item) {
                return result.Item;
            }
            return null;
        }
        catch (error) {
            console.error('Error fetching brand profile:', error);
            throw new Error(`Failed to fetch brand profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Create a brand visibility snapshot from analysis data
     */
    createVisibilitySnapshot(brandName, domain, industry, analysis, analysisVersion = '1.0') {
        const now = new Date().toISOString();
        return {
            brandName,
            timestamp: now,
            sentimentScore: analysis.sentimentScore,
            mentions: analysis.mentions,
            summary: analysis.summary,
            domain,
            industry,
            analysisVersion,
            // Set TTL for 1 year from now (optional)
            expiresAt: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60)
        };
    }
    /**
     * Create or update a brand profile
     */
    createBrandProfile(brandName, domain, industry, competitors = []) {
        const now = new Date().toISOString();
        return {
            brandName,
            domain,
            industry,
            competitors,
            createdAt: now,
            updatedAt: now,
            analysisFrequency: 'weekly',
            isActive: true
        };
    }
    /**
     * Remove undefined values from objects recursively
     */
    removeUndefinedValues(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.removeUndefinedValues(item)).filter(item => item !== undefined);
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
}
exports.BrandStorageService = BrandStorageService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmQtc3RvcmFnZS1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL2JyYW5kLXN0b3JhZ2Utc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBMEQ7QUFDMUQsd0RBQXFHO0FBQ3JHLHdEQUEyRjtBQUUzRjs7R0FFRztBQUNILE1BQWEsbUJBQW1CO0lBSzlCLFlBQVksU0FBaUIsV0FBVztRQUN0QyxNQUFNLE1BQU0sR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxTQUFTLEdBQUcscUNBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNuRCxlQUFlLEVBQUU7Z0JBQ2YscUJBQXFCLEVBQUUsSUFBSTthQUM1QjtTQUNGLENBQUMsQ0FBQztRQUVILHdDQUF3QztRQUN4QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsSUFBSSwwQkFBVyxDQUFDLDBCQUEwQixDQUFDO1FBQzdHLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixJQUFJLDBCQUFXLENBQUMsY0FBYyxDQUFDO0lBQy9GLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxRQUFpQztRQUNqRSxJQUFJLENBQUM7WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUUzRSwrQkFBK0I7WUFDL0IsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRTdELE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQ3ZCLElBQUkseUJBQVUsQ0FBQztnQkFDYixTQUFTLEVBQUUsSUFBSSxDQUFDLG1CQUFtQjtnQkFDbkMsSUFBSSxF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UTtZQUMzQixRQUFRLEVBQUUsSUFBSTtTQUNmLENBQUM7SUFDSixDQUFDO0lBRUQ7O09BRUc7SUFDSyxxQkFBcUIsQ0FBQyxHQUFRO1FBQ3BDLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDdEMsT0FBTyxHQUFHLENBQUM7UUFDYixDQUFDO1FBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDdkIsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFFRCxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQzVCLE1BQU0sT0FBTyxHQUFRLEVBQUUsQ0FBQztZQUN4QixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUMvQyxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztvQkFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbkQsQ0FBQztZQUNILENBQUM7WUFDRCxPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0NBQ0Y7QUFqT0Qsa0RBaU9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRHluYW1vREJDbGllbnQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtZHluYW1vZGInO1xuaW1wb3J0IHsgRHluYW1vREJEb2N1bWVudENsaWVudCwgUHV0Q29tbWFuZCwgR2V0Q29tbWFuZCwgUXVlcnlDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvbGliLWR5bmFtb2RiJztcbmltcG9ydCB7IEJyYW5kVmlzaWJpbGl0eVNuYXBzaG90LCBCcmFuZFByb2ZpbGUsIFRBQkxFX05BTUVTIH0gZnJvbSAnLi4vdHlwZXMvYnJhbmQtbW9kZWxzJztcblxuLyoqXG4gKiBEeW5hbW9EQiBTdG9yYWdlIFNlcnZpY2UgZm9yIEJyYW5kIERhdGFcbiAqL1xuZXhwb3J0IGNsYXNzIEJyYW5kU3RvcmFnZVNlcnZpY2Uge1xuICBwcml2YXRlIGRvY0NsaWVudDogRHluYW1vREJEb2N1bWVudENsaWVudDtcbiAgcHJpdmF0ZSB2aXNpYmlsaXR5VGFibGVOYW1lOiBzdHJpbmc7XG4gIHByaXZhdGUgcHJvZmlsZXNUYWJsZU5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihyZWdpb246IHN0cmluZyA9ICd1cy1lYXN0LTEnKSB7XG4gICAgY29uc3QgY2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHsgcmVnaW9uIH0pO1xuICAgIHRoaXMuZG9jQ2xpZW50ID0gRHluYW1vREJEb2N1bWVudENsaWVudC5mcm9tKGNsaWVudCwge1xuICAgICAgbWFyc2hhbGxPcHRpb25zOiB7XG4gICAgICAgIHJlbW92ZVVuZGVmaW5lZFZhbHVlczogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIC8vIFVzZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgb3IgZGVmYXVsdHNcbiAgICB0aGlzLnZpc2liaWxpdHlUYWJsZU5hbWUgPSBwcm9jZXNzLmVudi5CUkFORF9WSVNJQklMSVRZX1RBQkxFX05BTUUgfHwgVEFCTEVfTkFNRVMuQlJBTkRfVklTSUJJTElUWV9TTkFQU0hPVFM7XG4gICAgdGhpcy5wcm9maWxlc1RhYmxlTmFtZSA9IHByb2Nlc3MuZW52LkJSQU5EX1BST0ZJTEVTX1RBQkxFX05BTUUgfHwgVEFCTEVfTkFNRVMuQlJBTkRfUFJPRklMRVM7XG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBhIGJyYW5kIHZpc2liaWxpdHkgc25hcHNob3QgdG8gRHluYW1vREJcbiAgICovXG4gIGFzeW5jIHNhdmVCcmFuZFZpc2liaWxpdHlTbmFwc2hvdChzbmFwc2hvdDogQnJhbmRWaXNpYmlsaXR5U25hcHNob3QpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgY29uc29sZS5sb2coYFNhdmluZyBicmFuZCB2aXNpYmlsaXR5IHNuYXBzaG90IGZvcjogJHtzbmFwc2hvdC5icmFuZE5hbWV9YCk7XG4gICAgICBcbiAgICAgIC8vIENsZWFuIHRoZSBkYXRhIGJlZm9yZSBzYXZpbmdcbiAgICAgIGNvbnN0IGNsZWFuZWRTbmFwc2hvdCA9IHRoaXMucmVtb3ZlVW5kZWZpbmVkVmFsdWVzKHNuYXBzaG90KTtcbiAgICAgIFxuICAgICAgYXdhaXQgdGhpcy5kb2NDbGllbnQuc2VuZChcbiAgICAgICAgbmV3IFB1dENvbW1hbmQoe1xuICAgICAgICAgIFRhYmxlTmFtZTogdGhpcy52aXNpYmlsaXR5VGFibGVOYW1lLFxuICAgICAgICAgIEl0ZW06IGNsZWFuZWRTbmFwc2hvdFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIFxuICAgICAgY29uc29sZS5sb2coJ0JyYW5kIHZpc2liaWxpdHkgc25hcHNob3Qgc2F2ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNhdmluZyBicmFuZCB2aXNpYmlsaXR5IHNuYXBzaG90OicsIGVycm9yKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHNhdmUgYnJhbmQgdmlzaWJpbGl0eSBzbmFwc2hvdDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBsYXRlc3QgYnJhbmQgdmlzaWJpbGl0eSBzbmFwc2hvdFxuICAgKi9cbiAgYXN5bmMgZ2V0TGF0ZXN0QnJhbmRWaXNpYmlsaXR5U25hcHNob3QoYnJhbmROYW1lOiBzdHJpbmcpOiBQcm9taXNlPEJyYW5kVmlzaWJpbGl0eVNuYXBzaG90IHwgbnVsbD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zb2xlLmxvZyhgRmV0Y2hpbmcgbGF0ZXN0IHNuYXBzaG90IGZvciBicmFuZDogJHticmFuZE5hbWV9YCk7XG4gICAgICBcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZG9jQ2xpZW50LnNlbmQoXG4gICAgICAgIG5ldyBRdWVyeUNvbW1hbmQoe1xuICAgICAgICAgIFRhYmxlTmFtZTogdGhpcy52aXNpYmlsaXR5VGFibGVOYW1lLFxuICAgICAgICAgIEtleUNvbmRpdGlvbkV4cHJlc3Npb246ICdicmFuZE5hbWUgPSA6YnJhbmROYW1lJyxcbiAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XG4gICAgICAgICAgICAnOmJyYW5kTmFtZSc6IGJyYW5kTmFtZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgU2NhbkluZGV4Rm9yd2FyZDogZmFsc2UsIC8vIFNvcnQgYnkgdGltZXN0YW1wIGRlc2NlbmRpbmdcbiAgICAgICAgICBMaW1pdDogMVxuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgaWYgKHJlc3VsdC5JdGVtcyAmJiByZXN1bHQuSXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gcmVzdWx0Lkl0ZW1zWzBdIGFzIEJyYW5kVmlzaWJpbGl0eVNuYXBzaG90O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgYnJhbmQgdmlzaWJpbGl0eSBzbmFwc2hvdDonLCBlcnJvcik7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCBicmFuZCB2aXNpYmlsaXR5IHNuYXBzaG90OiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYnJhbmQgdmlzaWJpbGl0eSBoaXN0b3J5IChtdWx0aXBsZSBzbmFwc2hvdHMpXG4gICAqL1xuICBhc3luYyBnZXRCcmFuZFZpc2liaWxpdHlIaXN0b3J5KFxuICAgIGJyYW5kTmFtZTogc3RyaW5nLCBcbiAgICBsaW1pdDogbnVtYmVyID0gMTBcbiAgKTogUHJvbWlzZTxCcmFuZFZpc2liaWxpdHlTbmFwc2hvdFtdPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnNvbGUubG9nKGBGZXRjaGluZyB2aXNpYmlsaXR5IGhpc3RvcnkgZm9yIGJyYW5kOiAke2JyYW5kTmFtZX0sIGxpbWl0OiAke2xpbWl0fWApO1xuICAgICAgXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmRvY0NsaWVudC5zZW5kKFxuICAgICAgICBuZXcgUXVlcnlDb21tYW5kKHtcbiAgICAgICAgICBUYWJsZU5hbWU6IHRoaXMudmlzaWJpbGl0eVRhYmxlTmFtZSxcbiAgICAgICAgICBLZXlDb25kaXRpb25FeHByZXNzaW9uOiAnYnJhbmROYW1lID0gOmJyYW5kTmFtZScsXG4gICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczoge1xuICAgICAgICAgICAgJzpicmFuZE5hbWUnOiBicmFuZE5hbWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFNjYW5JbmRleEZvcndhcmQ6IGZhbHNlLCAvLyBTb3J0IGJ5IHRpbWVzdGFtcCBkZXNjZW5kaW5nXG4gICAgICAgICAgTGltaXQ6IGxpbWl0XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gKHJlc3VsdC5JdGVtcyB8fCBbXSkgYXMgQnJhbmRWaXNpYmlsaXR5U25hcHNob3RbXTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgYnJhbmQgdmlzaWJpbGl0eSBoaXN0b3J5OicsIGVycm9yKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGZldGNoIGJyYW5kIHZpc2liaWxpdHkgaGlzdG9yeTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBvciB1cGRhdGUgYSBicmFuZCBwcm9maWxlXG4gICAqL1xuICBhc3luYyBzYXZlQnJhbmRQcm9maWxlKHByb2ZpbGU6IEJyYW5kUHJvZmlsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zb2xlLmxvZyhgU2F2aW5nIGJyYW5kIHByb2ZpbGUgZm9yOiAke3Byb2ZpbGUuYnJhbmROYW1lfWApO1xuICAgICAgXG4gICAgICAvLyBDbGVhbiB0aGUgZGF0YSBiZWZvcmUgc2F2aW5nXG4gICAgICBjb25zdCBjbGVhbmVkUHJvZmlsZSA9IHRoaXMucmVtb3ZlVW5kZWZpbmVkVmFsdWVzKHByb2ZpbGUpO1xuICAgICAgXG4gICAgICBhd2FpdCB0aGlzLmRvY0NsaWVudC5zZW5kKFxuICAgICAgICBuZXcgUHV0Q29tbWFuZCh7XG4gICAgICAgICAgVGFibGVOYW1lOiB0aGlzLnByb2ZpbGVzVGFibGVOYW1lLFxuICAgICAgICAgIEl0ZW06IGNsZWFuZWRQcm9maWxlXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgXG4gICAgICBjb25zb2xlLmxvZygnQnJhbmQgcHJvZmlsZSBzYXZlZCBzdWNjZXNzZnVsbHknKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc2F2aW5nIGJyYW5kIHByb2ZpbGU6JywgZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gc2F2ZSBicmFuZCBwcm9maWxlOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBicmFuZCBwcm9maWxlXG4gICAqL1xuICBhc3luYyBnZXRCcmFuZFByb2ZpbGUoYnJhbmROYW1lOiBzdHJpbmcpOiBQcm9taXNlPEJyYW5kUHJvZmlsZSB8IG51bGw+IHtcbiAgICB0cnkge1xuICAgICAgY29uc29sZS5sb2coYEZldGNoaW5nIGJyYW5kIHByb2ZpbGUgZm9yOiAke2JyYW5kTmFtZX1gKTtcbiAgICAgIFxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5kb2NDbGllbnQuc2VuZChcbiAgICAgICAgbmV3IEdldENvbW1hbmQoe1xuICAgICAgICAgIFRhYmxlTmFtZTogdGhpcy5wcm9maWxlc1RhYmxlTmFtZSxcbiAgICAgICAgICBLZXk6IHtcbiAgICAgICAgICAgIGJyYW5kTmFtZTogYnJhbmROYW1lXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgICAgaWYgKHJlc3VsdC5JdGVtKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQuSXRlbSBhcyBCcmFuZFByb2ZpbGU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBicmFuZCBwcm9maWxlOicsIGVycm9yKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGZldGNoIGJyYW5kIHByb2ZpbGU6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGJyYW5kIHZpc2liaWxpdHkgc25hcHNob3QgZnJvbSBhbmFseXNpcyBkYXRhXG4gICAqL1xuICBjcmVhdGVWaXNpYmlsaXR5U25hcHNob3QoXG4gICAgYnJhbmROYW1lOiBzdHJpbmcsXG4gICAgZG9tYWluOiBzdHJpbmcsXG4gICAgaW5kdXN0cnk6IHN0cmluZyxcbiAgICBhbmFseXNpczogYW55LFxuICAgIGFuYWx5c2lzVmVyc2lvbjogc3RyaW5nID0gJzEuMCdcbiAgKTogQnJhbmRWaXNpYmlsaXR5U25hcHNob3Qge1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgYnJhbmROYW1lLFxuICAgICAgdGltZXN0YW1wOiBub3csXG4gICAgICBzZW50aW1lbnRTY29yZTogYW5hbHlzaXMuc2VudGltZW50U2NvcmUsXG4gICAgICBtZW50aW9uczogYW5hbHlzaXMubWVudGlvbnMsXG4gICAgICBzdW1tYXJ5OiBhbmFseXNpcy5zdW1tYXJ5LFxuICAgICAgZG9tYWluLFxuICAgICAgaW5kdXN0cnksXG4gICAgICBhbmFseXNpc1ZlcnNpb24sXG4gICAgICAvLyBTZXQgVFRMIGZvciAxIHllYXIgZnJvbSBub3cgKG9wdGlvbmFsKVxuICAgICAgZXhwaXJlc0F0OiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSArICgzNjUgKiAyNCAqIDYwICogNjApXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgb3IgdXBkYXRlIGEgYnJhbmQgcHJvZmlsZVxuICAgKi9cbiAgY3JlYXRlQnJhbmRQcm9maWxlKFxuICAgIGJyYW5kTmFtZTogc3RyaW5nLFxuICAgIGRvbWFpbjogc3RyaW5nLFxuICAgIGluZHVzdHJ5OiBzdHJpbmcsXG4gICAgY29tcGV0aXRvcnM6IHN0cmluZ1tdID0gW11cbiAgKTogQnJhbmRQcm9maWxlIHtcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIGJyYW5kTmFtZSxcbiAgICAgIGRvbWFpbixcbiAgICAgIGluZHVzdHJ5LFxuICAgICAgY29tcGV0aXRvcnMsXG4gICAgICBjcmVhdGVkQXQ6IG5vdyxcbiAgICAgIHVwZGF0ZWRBdDogbm93LFxuICAgICAgYW5hbHlzaXNGcmVxdWVuY3k6ICd3ZWVrbHknLFxuICAgICAgaXNBY3RpdmU6IHRydWVcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB1bmRlZmluZWQgdmFsdWVzIGZyb20gb2JqZWN0cyByZWN1cnNpdmVseVxuICAgKi9cbiAgcHJpdmF0ZSByZW1vdmVVbmRlZmluZWRWYWx1ZXMob2JqOiBhbnkpOiBhbnkge1xuICAgIGlmIChvYmogPT09IG51bGwgfHwgb2JqID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIFxuICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICAgIHJldHVybiBvYmoubWFwKGl0ZW0gPT4gdGhpcy5yZW1vdmVVbmRlZmluZWRWYWx1ZXMoaXRlbSkpLmZpbHRlcihpdGVtID0+IGl0ZW0gIT09IHVuZGVmaW5lZCk7XG4gICAgfVxuICAgIFxuICAgIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgY2xlYW5lZDogYW55ID0ge307XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgY2xlYW5lZFtrZXldID0gdGhpcy5yZW1vdmVVbmRlZmluZWRWYWx1ZXModmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY2xlYW5lZDtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG9iajtcbiAgfVxufSAiXX0=