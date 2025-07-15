# Trending Questions Prompt Examples

This document shows examples of GPT-4 prompts and expected outputs for different brands and industries.

## Basic Example

### Input
```
Brand: Apple
Industry: Technology
```

### GPT-4 Prompt
```
You are an expert market researcher analyzing consumer behavior and brand perception. Your task is to identify the most likely questions users would ask AI tools like ChatGPT, Claude, or Perplexity about a specific brand.

BRAND: Apple
INDUSTRY: Technology

Generate 5 likely questions that users might ask AI tools about Apple or products in the Technology industry. Consider:

• Reliability and trustworthiness concerns
• Comparisons with competitors
• Product features and capabilities
• Pricing and value propositions
• Alternative options and recommendations
• User experience and reviews
• Industry-specific concerns
• Common pain points in the Technology space
• Purchase decision factors

Focus on questions that:
1. Real users would actually ask
2. Are specific enough to be actionable
3. Reflect common concerns in the Technology industry
4. Include both positive and negative inquiry angles
5. Cover different stages of the customer journey (awareness, consideration, decision)

OUTPUT FORMAT: Return ONLY a JSON array of strings. No explanations, no additional text.

Example format:
[
  "Is Apple reliable for [specific use case]?",
  "How does Apple compare to [competitor] in terms of [specific aspect]?",
  "What are the main advantages of choosing Apple over alternatives?",
  "Are there any common issues or complaints about Apple?",
  "What's the best Apple product for [specific need]?"
]

Generate the questions now:
```

### Expected Output
```json
[
  "Is Apple reliable for business and professional use?",
  "How does Apple compare to Samsung in terms of smartphone features and value?",
  "What are the main advantages of choosing Apple over Android devices?",
  "Are there any common issues or complaints about Apple products?",
  "Should I switch from Windows to Mac for software development?"
]
```

## Industry-Specific Examples

### Healthcare - Johnson & Johnson
```json
[
  "Is Johnson & Johnson safe and FDA approved for medical treatments?",
  "How effective are Johnson & Johnson vaccines compared to competitors?",
  "Does insurance cover Johnson & Johnson medical devices?",
  "What are the side effects of Johnson & Johnson medications?",
  "Do doctors recommend Johnson & Johnson products over alternatives?"
]
```

### Automotive - Tesla
```json
[
  "Is Tesla reliable for long-term ownership and maintenance?",
  "How does Tesla compare to BMW in terms of safety ratings?",
  "What's the real-world range of Tesla vehicles?",
  "Should I buy a Tesla or wait for other electric car options?",
  "What are the hidden costs of owning a Tesla?"
]
```

### Finance - Chase Bank
```json
[
  "Is Chase Bank secure and trustworthy for online banking?",
  "What are Chase Bank's hidden fees and charges?",
  "How does Chase Bank compare to Wells Fargo for mortgages?",
  "Is Chase Bank FDIC insured and regulated?",
  "What do customers say about Chase Bank's customer service?"
]
```

### Retail - Amazon
```json
[
  "Is Amazon reliable for fast delivery and returns?",
  "How does Amazon Prime compare to other subscription services?",
  "What are the pros and cons of buying from Amazon vs local stores?",
  "Is Amazon's customer service actually helpful?",
  "Should I trust Amazon with my personal and payment information?"
]
```

### Entertainment - Netflix
```json
[
  "Is Netflix worth the subscription cost compared to other streaming services?",
  "How does Netflix compare to Disney+ for family content?",
  "What devices can I use to watch Netflix?",
  "Should I choose Netflix or Hulu for my entertainment needs?",
  "What are users saying about Netflix's content quality lately?"
]
```

## Competitive Analysis Examples

### Spotify vs Competitors
```json
[
  "How does Spotify compare to Apple Music in terms of sound quality?",
  "Should I choose Spotify or YouTube Music for discovering new artists?",
  "What are the main differences between Spotify and Pandora?",
  "Which is better value: Spotify Premium or Apple Music?",
  "What do users prefer: Spotify or Amazon Music for podcasts?"
]
```

### Microsoft vs Google
```json
[
  "How does Microsoft Office compare to Google Workspace for teams?",
  "Should I choose Microsoft Azure or Google Cloud for my business?",
  "What are the main differences between Microsoft Teams and Google Meet?",
  "Which is more secure: Microsoft 365 or Google Workspace?",
  "What do businesses prefer: Microsoft or Google productivity tools?"
]
```

## Focus Area Examples

### Amazon - Pricing Focus
```json
[
  "Is Amazon actually cheaper than other online retailers?",
  "What are the hidden costs of Amazon Prime membership?",
  "How does Amazon's pricing compare to Walmart for groceries?",
  "Should I pay for Amazon Prime or stick with free shipping?",
  "What's the real value of Amazon Prime benefits vs the cost?"
]
```

### Apple - Security Focus
```json
[
  "Is Apple more secure than Android for personal data?",
  "How does Apple protect user privacy compared to Google?",
  "Should I trust Apple with my financial information?",
  "What are Apple's security features for business use?",
  "Is Apple's Face ID safer than traditional passwords?"
]
```

## Simple Prompt Examples

### Tesla - Simple Version
**Prompt**: "What are 5 likely questions users might ask AI tools like ChatGPT about the brand Tesla or products in the Automotive industry?"

**Expected Output**:
```json
[
  "Is Tesla reliable for automotive needs?",
  "How does Tesla compare to competitors?",
  "What are the pros and cons of Tesla?",
  "Should I choose Tesla or look for alternatives?",
  "What do users say about Tesla's quality?"
]
```

### Airbnb - Simple Version
**Prompt**: "What are 5 likely questions users might ask AI tools like ChatGPT about the brand Airbnb or products in the Travel industry?"

**Expected Output**:
```json
[
  "Is Airbnb reliable for travel accommodations?",
  "How does Airbnb compare to hotels?",
  "What are the pros and cons of Airbnb?",
  "Should I choose Airbnb or look for alternatives?",
  "What do users say about Airbnb's safety?"
]
```

## Usage in Code

### JavaScript/Node.js
```javascript
const { TrendingQuestionsPrompt } = require('./trending-questions-prompt');

// Generate basic prompt
const prompt = TrendingQuestionsPrompt.generate('Apple', 'Technology');

// Send to OpenAI API
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a market research expert. Always respond with valid JSON arrays only.' },
    { role: 'user', content: prompt }
  ],
  temperature: 0.7,
  max_tokens: 500
});

const questions = JSON.parse(response.choices[0].message.content);
console.log(questions);
```

### TypeScript
```typescript
import { TrendingQuestionsPrompt, TrendingQuestionsService } from './trending-questions-prompt';

// Using the service class
const service = new TrendingQuestionsService(process.env.OPENAI_API_KEY!);

const result = await service.getTrendingQuestions('Apple', 'Technology', {
  questionCount: 5,
  includeComparison: true,
  includeReliability: true
});

console.log(result.questions);
```

### Python
```python
import openai
import json

def generate_trending_questions(brand_name, industry):
    prompt = f"""What are 5 likely questions users might ask AI tools like ChatGPT about the brand {brand_name} or products in the {industry} industry?

Return ONLY a JSON array of questions, nothing else.

Example format:
[
  "Is {brand_name} reliable for {industry.lower()} needs?",
  "How does {brand_name} compare to competitors?",
  "What are the pros and cons of {brand_name}?",
  "Should I choose {brand_name} or look for alternatives?",
  "What do users say about {brand_name}'s quality?"
]"""

    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a market research expert. Always respond with valid JSON arrays only."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=500
    )
    
    return json.loads(response.choices[0].message.content)

# Usage
questions = generate_trending_questions("Apple", "Technology")
print(questions)
```

## Best Practices

1. **Temperature Setting**: Use 0.7 for creative but consistent results
2. **Max Tokens**: 500 tokens usually sufficient for 5 questions
3. **System Message**: Always include instruction to return JSON only
4. **Error Handling**: Parse JSON response with try-catch
5. **Validation**: Verify the response is an array of strings
6. **Caching**: Cache results to avoid repeated API calls for same brand/industry

## Common Issues and Solutions

### Issue: GPT-4 returns explanations instead of JSON
**Solution**: Use stronger system message and emphasize "ONLY" in prompt

### Issue: Invalid JSON format
**Solution**: Add JSON validation and retry logic

### Issue: Questions too generic
**Solution**: Use industry-specific prompts or add more context

### Issue: Repeated questions
**Solution**: Increase temperature or add variety instructions

This prompt system provides a robust foundation for generating realistic, actionable questions that users might ask AI tools about any brand or industry. 