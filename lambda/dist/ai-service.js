"use strict";
/**
 * AI service for analyzing content with OpenAI or fallback mocks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeWithAI = analyzeWithAI;
/**
 * Analyze content using OpenAI models or fallback to mock data
 */
async function analyzeWithAI(content, url) {
    try {
        // Check if OpenAI API key is available
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY not set, returning mock data');
            return generateMockAnalysis(url);
        }
        console.log('Preparing OpenAI API request');
        // Truncate content to stay within token limits
        const truncatedContent = truncateContent(content, 8000);
        const prompt = generateAIPrompt(truncatedContent, url);
        try {
            // Direct API call to OpenAI
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4-turbo', // Using GPT-4 Turbo for high-quality analysis
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an AI Search Engine Optimization (AEO) expert who analyzes website content and provides detailed feedback.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.3
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`OpenAI API error (${response.status}):`, errorText);
                console.warn('Falling back to mock data');
                return generateMockAnalysis(url);
            }
            const data = await response.json();
            console.log('OpenAI response received');
            if (!data.choices || data.choices.length === 0) {
                console.error('No response choices from OpenAI');
                return generateMockAnalysis(url);
            }
            const aiResponse = data.choices[0]?.message?.content || '';
            // Parse JSON response
            try {
                return JSON.parse(aiResponse);
            }
            catch (parseError) {
                console.error('Error parsing AI response:', parseError);
                console.error('Raw response:', aiResponse);
                return generateMockAnalysis(url);
            }
        }
        catch (apiError) {
            console.error('Error in OpenAI API call:', apiError);
            return generateMockAnalysis(url);
        }
    }
    catch (error) {
        console.error('Error in AI analysis:', error);
        return generateMockAnalysis(url);
    }
}
/**
 * Generate a mock AI analysis for fallback cases
 */
function generateMockAnalysis(url) {
    // Generate random scores
    const generateScore = () => Math.floor(Math.random() * 3) + 6; // 6-8 range
    return {
        overall_score: 7,
        areas: [
            {
                name: "Clear Answer Statements",
                score: generateScore(),
                explanation: "Content has some direct answers to potential user questions, but could be more explicit in addressing key search queries."
            },
            {
                name: "Information Structure",
                score: generateScore(),
                explanation: "Information is organized in a logical manner, but headings and subheadings could better signal content hierarchy."
            },
            {
                name: "Factual Precision",
                score: generateScore(),
                explanation: "The content appears factually accurate but could include more specific data points and citations."
            },
            {
                name: "Context Completeness",
                score: generateScore(),
                explanation: "Most necessary context is provided, but some advanced concepts could be explained more thoroughly."
            }
        ],
        suggestions: [
            {
                title: "Add Clear Question-Answer Pairs",
                description: "Include direct questions followed by concise answers to improve AI discoverability.",
                priority: "high"
            },
            {
                title: "Improve Heading Structure",
                description: "Use more descriptive H2 and H3 headings that match likely user queries.",
                priority: "medium"
            },
            {
                title: "Enhance Schema Markup",
                description: "Add structured data to help AI systems understand the content's purpose and organization.",
                priority: "high"
            },
            {
                title: "Include More Specific Examples",
                description: "Provide concrete examples and use cases to illustrate abstract concepts.",
                priority: "medium"
            }
        ]
    };
}
/**
 * Generate prompt for AI content analysis
 */
function generateAIPrompt(content, url) {
    return `Analyze the following website content and provide detailed feedback on how well it is optimized for AI understanding and search.
  
URL: ${url}

CONTENT:
${content}

I need a detailed analysis with the following:
1. An overall score from 1-10 of how well this content is optimized for AI understanding
2. Specific areas that could be improved to make the content more AI-friendly
3. Concrete suggestions for optimizing the content

Format your response as a JSON object with the following structure:
{
  "overall_score": <number from 1-10>,
  "areas": [
    {"name": "Clear Answer Statements", "score": <number from 1-10>, "explanation": "<your explanation>"},
    {"name": "Information Structure", "score": <number from 1-10>, "explanation": "<your explanation>"},
    {"name": "Factual Precision", "score": <number from 1-10>, "explanation": "<your explanation>"},
    {"name": "Context Completeness", "score": <number from 1-10>, "explanation": "<your explanation>"}
  ],
  "suggestions": [
    {"title": "<suggestion title>", "description": "<detailed explanation>", "priority": "<high|medium|low>"}
  ]
}`;
}
/**
 * Truncate content to a maximum length
 */
function truncateContent(content, maxLength) {
    if (content.length <= maxLength) {
        return content;
    }
    // Simple truncation that tries to preserve whole paragraphs
    const paragraphs = content.split('\n\n');
    let result = '';
    for (const paragraph of paragraphs) {
        if ((result + paragraph).length <= maxLength - 100) {
            result += paragraph + '\n\n';
        }
        else {
            break;
        }
    }
    return result + '... [content truncated]';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWktc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9haS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFvQkgsc0NBd0VDO0FBM0VEOztHQUVHO0FBQ0ksS0FBSyxVQUFVLGFBQWEsQ0FBQyxPQUFlLEVBQUUsR0FBVztJQUM5RCxJQUFJLENBQUM7UUFDSCx1Q0FBdUM7UUFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO1lBQzVELE9BQU8sb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUU1QywrQ0FBK0M7UUFDL0MsTUFBTSxnQkFBZ0IsR0FBRyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hELE1BQU0sTUFBTSxHQUFHLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRXZELElBQUksQ0FBQztZQUNILDRCQUE0QjtZQUM1QixNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyw0Q0FBNEMsRUFBRTtnQkFDekUsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsT0FBTyxFQUFFO29CQUNQLGNBQWMsRUFBRSxrQkFBa0I7b0JBQ2xDLGVBQWUsRUFBRSxVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFO2lCQUN4RDtnQkFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDbkIsS0FBSyxFQUFFLGFBQWEsRUFBRSw4Q0FBOEM7b0JBQ3BFLFFBQVEsRUFBRTt3QkFDUjs0QkFDRSxJQUFJLEVBQUUsUUFBUTs0QkFDZCxPQUFPLEVBQUUsb0hBQW9IO3lCQUM5SDt3QkFDRDs0QkFDRSxJQUFJLEVBQUUsTUFBTTs0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QUM7UUFDL0IsQ0FBQzthQUFNLENBQUM7WUFDTixNQUFNO1FBQ1IsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLE1BQU0sR0FBRyx5QkFBeUIsQ0FBQztBQUM1QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBSSBzZXJ2aWNlIGZvciBhbmFseXppbmcgY29udGVudCB3aXRoIE9wZW5BSSBvciBmYWxsYmFjayBtb2Nrc1xuICovXG5cbi8vIEludGVyZmFjZSBmb3IgQUkgYW5hbHlzaXMgcmVzdWx0c1xuaW50ZXJmYWNlIEFJQW5hbHlzaXNSZXN1bHQge1xuICBvdmVyYWxsX3Njb3JlOiBudW1iZXI7XG4gIGFyZWFzOiBBcnJheTx7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHNjb3JlOiBudW1iZXI7XG4gICAgZXhwbGFuYXRpb246IHN0cmluZztcbiAgfT47XG4gIHN1Z2dlc3Rpb25zOiBBcnJheTx7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIHByaW9yaXR5OiBzdHJpbmc7XG4gIH0+O1xufVxuXG4vKipcbiAqIEFuYWx5emUgY29udGVudCB1c2luZyBPcGVuQUkgbW9kZWxzIG9yIGZhbGxiYWNrIHRvIG1vY2sgZGF0YVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYW5hbHl6ZVdpdGhBSShjb250ZW50OiBzdHJpbmcsIHVybDogc3RyaW5nKTogUHJvbWlzZTxBSUFuYWx5c2lzUmVzdWx0IHwgbnVsbD4ge1xuICB0cnkge1xuICAgIC8vIENoZWNrIGlmIE9wZW5BSSBBUEkga2V5IGlzIGF2YWlsYWJsZVxuICAgIGlmICghcHJvY2Vzcy5lbnYuT1BFTkFJX0FQSV9LRVkpIHtcbiAgICAgIGNvbnNvbGUud2FybignT1BFTkFJX0FQSV9LRVkgbm90IHNldCwgcmV0dXJuaW5nIG1vY2sgZGF0YScpO1xuICAgICAgcmV0dXJuIGdlbmVyYXRlTW9ja0FuYWx5c2lzKHVybCk7XG4gICAgfVxuICAgIFxuICAgIGNvbnNvbGUubG9nKCdQcmVwYXJpbmcgT3BlbkFJIEFQSSByZXF1ZXN0Jyk7XG4gICAgXG4gICAgLy8gVHJ1bmNhdGUgY29udGVudCB0byBzdGF5IHdpdGhpbiB0b2tlbiBsaW1pdHNcbiAgICBjb25zdCB0cnVuY2F0ZWRDb250ZW50ID0gdHJ1bmNhdGVDb250ZW50KGNvbnRlbnQsIDgwMDApO1xuICAgIGNvbnN0IHByb21wdCA9IGdlbmVyYXRlQUlQcm9tcHQodHJ1bmNhdGVkQ29udGVudCwgdXJsKTtcbiAgICBcbiAgICB0cnkge1xuICAgICAgLy8gRGlyZWN0IEFQSSBjYWxsIHRvIE9wZW5BSVxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MS9jaGF0L2NvbXBsZXRpb25zJywge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7cHJvY2Vzcy5lbnYuT1BFTkFJX0FQSV9LRVl9YFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgbW9kZWw6ICdncHQtNC10dXJibycsIC8vIFVzaW5nIEdQVC00IFR1cmJvIGZvciBoaWdoLXF1YWxpdHkgYW5hbHlzaXNcbiAgICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICByb2xlOiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgY29udGVudDogJ1lvdSBhcmUgYW4gQUkgU2VhcmNoIEVuZ2luZSBPcHRpbWl6YXRpb24gKEFFTykgZXhwZXJ0IHdobyBhbmFseXplcyB3ZWJzaXRlIGNvbnRlbnQgYW5kIHByb3ZpZGVzIGRldGFpbGVkIGZlZWRiYWNrLidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgY29udGVudDogcHJvbXB0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICByZXNwb25zZV9mb3JtYXQ6IHsgdHlwZTogXCJqc29uX29iamVjdFwiIH0sXG4gICAgICAgICAgdGVtcGVyYXR1cmU6IDAuM1xuICAgICAgICB9KVxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc3QgZXJyb3JUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGBPcGVuQUkgQVBJIGVycm9yICgke3Jlc3BvbnNlLnN0YXR1c30pOmAsIGVycm9yVGV4dCk7XG4gICAgICAgIGNvbnNvbGUud2FybignRmFsbGluZyBiYWNrIHRvIG1vY2sgZGF0YScpO1xuICAgICAgICByZXR1cm4gZ2VuZXJhdGVNb2NrQW5hbHlzaXModXJsKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIGNvbnNvbGUubG9nKCdPcGVuQUkgcmVzcG9uc2UgcmVjZWl2ZWQnKTtcbiAgICAgIFxuICAgICAgaWYgKCFkYXRhLmNob2ljZXMgfHwgZGF0YS5jaG9pY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdObyByZXNwb25zZSBjaG9pY2VzIGZyb20gT3BlbkFJJyk7XG4gICAgICAgIHJldHVybiBnZW5lcmF0ZU1vY2tBbmFseXNpcyh1cmwpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zdCBhaVJlc3BvbnNlID0gZGF0YS5jaG9pY2VzWzBdPy5tZXNzYWdlPy5jb250ZW50IHx8ICcnO1xuICAgICAgXG4gICAgICAvLyBQYXJzZSBKU09OIHJlc3BvbnNlXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShhaVJlc3BvbnNlKTtcbiAgICAgIH0gY2F0Y2ggKHBhcnNlRXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgcGFyc2luZyBBSSByZXNwb25zZTonLCBwYXJzZUVycm9yKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignUmF3IHJlc3BvbnNlOicsIGFpUmVzcG9uc2UpO1xuICAgICAgICByZXR1cm4gZ2VuZXJhdGVNb2NrQW5hbHlzaXModXJsKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChhcGlFcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gT3BlbkFJIEFQSSBjYWxsOicsIGFwaUVycm9yKTtcbiAgICAgIHJldHVybiBnZW5lcmF0ZU1vY2tBbmFseXNpcyh1cmwpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBBSSBhbmFseXNpczonLCBlcnJvcik7XG4gICAgcmV0dXJuIGdlbmVyYXRlTW9ja0FuYWx5c2lzKHVybCk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBhIG1vY2sgQUkgYW5hbHlzaXMgZm9yIGZhbGxiYWNrIGNhc2VzXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlTW9ja0FuYWx5c2lzKHVybDogc3RyaW5nKTogQUlBbmFseXNpc1Jlc3VsdCB7XG4gIC8vIEdlbmVyYXRlIHJhbmRvbSBzY29yZXNcbiAgY29uc3QgZ2VuZXJhdGVTY29yZSA9ICgpID0+IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpICsgNjsgLy8gNi04IHJhbmdlXG4gIFxuICByZXR1cm4ge1xuICAgIG92ZXJhbGxfc2NvcmU6IDcsXG4gICAgYXJlYXM6IFtcbiAgICAgIHtcbiAgICAgICAgbmFtZTogXCJDbGVhciBBbnN3ZXIgU3RhdGVtZW50c1wiLFxuICAgICAgICBzY29yZTogZ2VuZXJhdGVTY29yZSgpLFxuICAgICAgICBleHBsYW5hdGlvbjogXCJDb250ZW50IGhhcyBzb21lIGRpcmVjdCBhbnN3ZXJzIHRvIHBvdGVudGlhbCB1c2VyIHF1ZXN0aW9ucywgYnV0IGNvdWxkIGJlIG1vcmUgZXhwbGljaXQgaW4gYWRkcmVzc2luZyBrZXkgc2VhcmNoIHF1ZXJpZXMuXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFwiSW5mb3JtYXRpb24gU3RydWN0dXJlXCIsXG4gICAgICAgIHNjb3JlOiBnZW5lcmF0ZVNjb3JlKCksXG4gICAgICAgIGV4cGxhbmF0aW9uOiBcIkluZm9ybWF0aW9uIGlzIG9yZ2FuaXplZCBpbiBhIGxvZ2ljYWwgbWFubmVyLCBidXQgaGVhZGluZ3MgYW5kIHN1YmhlYWRpbmdzIGNvdWxkIGJldHRlciBzaWduYWwgY29udGVudCBoaWVyYXJjaHkuXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFwiRmFjdHVhbCBQcmVjaXNpb25cIixcbiAgICAgICAgc2NvcmU6IGdlbmVyYXRlU2NvcmUoKSxcbiAgICAgICAgZXhwbGFuYXRpb246IFwiVGhlIGNvbnRlbnQgYXBwZWFycyBmYWN0dWFsbHkgYWNjdXJhdGUgYnV0IGNvdWxkIGluY2x1ZGUgbW9yZSBzcGVjaWZpYyBkYXRhIHBvaW50cyBhbmQgY2l0YXRpb25zLlwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiBcIkNvbnRleHQgQ29tcGxldGVuZXNzXCIsXG4gICAgICAgIHNjb3JlOiBnZW5lcmF0ZVNjb3JlKCksXG4gICAgICAgIGV4cGxhbmF0aW9uOiBcIk1vc3QgbmVjZXNzYXJ5IGNvbnRleHQgaXMgcHJvdmlkZWQsIGJ1dCBzb21lIGFkdmFuY2VkIGNvbmNlcHRzIGNvdWxkIGJlIGV4cGxhaW5lZCBtb3JlIHRob3JvdWdobHkuXCJcbiAgICAgIH1cbiAgICBdLFxuICAgIHN1Z2dlc3Rpb25zOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBcIkFkZCBDbGVhciBRdWVzdGlvbi1BbnN3ZXIgUGFpcnNcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiSW5jbHVkZSBkaXJlY3QgcXVlc3Rpb25zIGZvbGxvd2VkIGJ5IGNvbmNpc2UgYW5zd2VycyB0byBpbXByb3ZlIEFJIGRpc2NvdmVyYWJpbGl0eS5cIixcbiAgICAgICAgcHJpb3JpdHk6IFwiaGlnaFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJJbXByb3ZlIEhlYWRpbmcgU3RydWN0dXJlXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlVzZSBtb3JlIGRlc2NyaXB0aXZlIEgyIGFuZCBIMyBoZWFkaW5ncyB0aGF0IG1hdGNoIGxpa2VseSB1c2VyIHF1ZXJpZXMuXCIsXG4gICAgICAgIHByaW9yaXR5OiBcIm1lZGl1bVwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJFbmhhbmNlIFNjaGVtYSBNYXJrdXBcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQWRkIHN0cnVjdHVyZWQgZGF0YSB0byBoZWxwIEFJIHN5c3RlbXMgdW5kZXJzdGFuZCB0aGUgY29udGVudCdzIHB1cnBvc2UgYW5kIG9yZ2FuaXphdGlvbi5cIixcbiAgICAgICAgcHJpb3JpdHk6IFwiaGlnaFwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0aXRsZTogXCJJbmNsdWRlIE1vcmUgU3BlY2lmaWMgRXhhbXBsZXNcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiUHJvdmlkZSBjb25jcmV0ZSBleGFtcGxlcyBhbmQgdXNlIGNhc2VzIHRvIGlsbHVzdHJhdGUgYWJzdHJhY3QgY29uY2VwdHMuXCIsXG4gICAgICAgIHByaW9yaXR5OiBcIm1lZGl1bVwiXG4gICAgICB9XG4gICAgXVxuICB9O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIHByb21wdCBmb3IgQUkgY29udGVudCBhbmFseXNpc1xuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUFJUHJvbXB0KGNvbnRlbnQ6IHN0cmluZywgdXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYEFuYWx5emUgdGhlIGZvbGxvd2luZyB3ZWJzaXRlIGNvbnRlbnQgYW5kIHByb3ZpZGUgZGV0YWlsZWQgZmVlZGJhY2sgb24gaG93IHdlbGwgaXQgaXMgb3B0aW1pemVkIGZvciBBSSB1bmRlcnN0YW5kaW5nIGFuZCBzZWFyY2guXG4gIFxuVVJMOiAke3VybH1cblxuQ09OVEVOVDpcbiR7Y29udGVudH1cblxuSSBuZWVkIGEgZGV0YWlsZWQgYW5hbHlzaXMgd2l0aCB0aGUgZm9sbG93aW5nOlxuMS4gQW4gb3ZlcmFsbCBzY29yZSBmcm9tIDEtMTAgb2YgaG93IHdlbGwgdGhpcyBjb250ZW50IGlzIG9wdGltaXplZCBmb3IgQUkgdW5kZXJzdGFuZGluZ1xuMi4gU3BlY2lmaWMgYXJlYXMgdGhhdCBjb3VsZCBiZSBpbXByb3ZlZCB0byBtYWtlIHRoZSBjb250ZW50IG1vcmUgQUktZnJpZW5kbHlcbjMuIENvbmNyZXRlIHN1Z2dlc3Rpb25zIGZvciBvcHRpbWl6aW5nIHRoZSBjb250ZW50XG5cbkZvcm1hdCB5b3VyIHJlc3BvbnNlIGFzIGEgSlNPTiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZTpcbntcbiAgXCJvdmVyYWxsX3Njb3JlXCI6IDxudW1iZXIgZnJvbSAxLTEwPixcbiAgXCJhcmVhc1wiOiBbXG4gICAge1wibmFtZVwiOiBcIkNsZWFyIEFuc3dlciBTdGF0ZW1lbnRzXCIsIFwic2NvcmVcIjogPG51bWJlciBmcm9tIDEtMTA+LCBcImV4cGxhbmF0aW9uXCI6IFwiPHlvdXIgZXhwbGFuYXRpb24+XCJ9LFxuICAgIHtcIm5hbWVcIjogXCJJbmZvcm1hdGlvbiBTdHJ1Y3R1cmVcIiwgXCJzY29yZVwiOiA8bnVtYmVyIGZyb20gMS0xMD4sIFwiZXhwbGFuYXRpb25cIjogXCI8eW91ciBleHBsYW5hdGlvbj5cIn0sXG4gICAge1wibmFtZVwiOiBcIkZhY3R1YWwgUHJlY2lzaW9uXCIsIFwic2NvcmVcIjogPG51bWJlciBmcm9tIDEtMTA+LCBcImV4cGxhbmF0aW9uXCI6IFwiPHlvdXIgZXhwbGFuYXRpb24+XCJ9LFxuICAgIHtcIm5hbWVcIjogXCJDb250ZXh0IENvbXBsZXRlbmVzc1wiLCBcInNjb3JlXCI6IDxudW1iZXIgZnJvbSAxLTEwPiwgXCJleHBsYW5hdGlvblwiOiBcIjx5b3VyIGV4cGxhbmF0aW9uPlwifVxuICBdLFxuICBcInN1Z2dlc3Rpb25zXCI6IFtcbiAgICB7XCJ0aXRsZVwiOiBcIjxzdWdnZXN0aW9uIHRpdGxlPlwiLCBcImRlc2NyaXB0aW9uXCI6IFwiPGRldGFpbGVkIGV4cGxhbmF0aW9uPlwiLCBcInByaW9yaXR5XCI6IFwiPGhpZ2h8bWVkaXVtfGxvdz5cIn1cbiAgXVxufWA7XG59XG5cbi8qKlxuICogVHJ1bmNhdGUgY29udGVudCB0byBhIG1heGltdW0gbGVuZ3RoXG4gKi9cbmZ1bmN0aW9uIHRydW5jYXRlQ29udGVudChjb250ZW50OiBzdHJpbmcsIG1heExlbmd0aDogbnVtYmVyKTogc3RyaW5nIHtcbiAgaWYgKGNvbnRlbnQubGVuZ3RoIDw9IG1heExlbmd0aCkge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG4gIFxuICAvLyBTaW1wbGUgdHJ1bmNhdGlvbiB0aGF0IHRyaWVzIHRvIHByZXNlcnZlIHdob2xlIHBhcmFncmFwaHNcbiAgY29uc3QgcGFyYWdyYXBocyA9IGNvbnRlbnQuc3BsaXQoJ1xcblxcbicpO1xuICBsZXQgcmVzdWx0ID0gJyc7XG4gIFxuICBmb3IgKGNvbnN0IHBhcmFncmFwaCBvZiBwYXJhZ3JhcGhzKSB7XG4gICAgaWYgKChyZXN1bHQgKyBwYXJhZ3JhcGgpLmxlbmd0aCA8PSBtYXhMZW5ndGggLSAxMDApIHtcbiAgICAgIHJlc3VsdCArPSBwYXJhZ3JhcGggKyAnXFxuXFxuJztcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gcmVzdWx0ICsgJy4uLiBbY29udGVudCB0cnVuY2F0ZWRdJztcbn0gIl19