# Brand Visibility Dashboard

The Brand Visibility Dashboard is a comprehensive tool for monitoring and analyzing your brand's presence and sentiment across AI-driven platforms and search engines. It provides real-time insights into how your brand is perceived and discussed in the digital ecosystem.

## Features

### 📊 Interactive Sentiment Chart
- **Chart.js Integration**: Beautiful, responsive line charts showing sentiment trends over time
- **30-Day Analysis**: Track sentiment changes across the past month
- **Threshold Indicators**: Visual markers for positive (60%+), neutral (0%), and negative (-20%) sentiment levels
- **Hover Tooltips**: Detailed information on hover, including exact sentiment scores and mention counts
- **Trend Analysis**: Automatic detection of upward, downward, or stable sentiment trends

### 🏷️ Keyword Mentions Analysis
- **Color-Coded Badges**: Visual sentiment indicators (positive=green, neutral=gray, negative=red)
- **Frequency Visualization**: Progress bars showing relative mention frequency
- **Sorted by Impact**: Keywords ordered by frequency for quick identification of key terms
- **Sentiment Distribution**: Summary statistics showing positive, neutral, and negative mention counts

### 🎯 Key Performance Metrics
- **Average Sentiment Score**: Overall brand sentiment with trend indicators
- **Total Mentions**: Aggregate count across all tracked keywords
- **Brand Visibility Status**: Categorized as Strong, Moderate, or Weak based on sentiment thresholds
- **Real-Time Updates**: Refresh capability for latest data

### 🤖 AI-Powered Insights
- **GPT-4 Analysis**: Intelligent summaries of brand perception and visibility
- **Industry Context**: Analysis tailored to specific industry verticals
- **Competitive Positioning**: Insights into brand strength relative to market position
- **Actionable Recommendations**: Specific suggestions for improving brand visibility

## Technical Implementation

### Frontend Architecture
```
app/visibility/
├── page.tsx                 # Main dashboard page with Suspense
├── components/
│   ├── VisibilityDashboard.tsx      # Main dashboard component
│   ├── SentimentChart.tsx           # Chart.js line chart
│   ├── MentionsList.tsx             # Mentions with badges
│   └── VisibilityDashboardSkeleton.tsx # Loading states
└── api/visibility/
    └── route.ts             # API endpoint for data fetching
```

### Key Technologies
- **Next.js 14**: App Router with Suspense for optimal loading states
- **Chart.js + react-chartjs-2**: Interactive, responsive charts
- **shadcn/ui**: Consistent UI components with Tailwind CSS
- **TypeScript**: Full type safety across all components
- **Responsive Design**: Mobile-first approach with Tailwind utilities

### Data Flow
1. **Brand Selection**: User selects brand from dropdown or URL parameter
2. **API Request**: Frontend calls `/api/visibility?brand=xyz`
3. **Data Processing**: Mock data generation (replaceable with Lambda integration)
4. **Chart Rendering**: Chart.js renders interactive sentiment timeline
5. **Mentions Display**: Color-coded badges and frequency bars
6. **Summary Generation**: AI-powered insights and recommendations

## Usage

### Accessing the Dashboard
```bash
# Navigate to the visibility dashboard
https://your-domain.com/visibility

# With specific brand parameter
https://your-domain.com/visibility?brand=Apple
```

### Brand Selection
The dashboard includes a dropdown with popular brands:
- Apple, Microsoft, Google, Amazon, Tesla
- Netflix, Meta, OpenAI, Spotify, Adobe
- Custom brand names can be entered via URL parameter

### Data Refresh
- **Manual Refresh**: Click the refresh button to get latest data
- **Auto-Update**: Last updated timestamp shown in the interface
- **Caching**: Intelligent caching prevents excessive API calls

## API Integration

### Current Implementation (Mock Data)
```typescript
// Mock data generation for development
const generateMockData = (brand: string) => {
  // 30 days of realistic sentiment data
  // Includes date, sentimentScore, mentions, timestamp
}

const generateMockMentions = (brand: string) => {
  // Positive, neutral, negative keywords
  // With realistic frequency distributions
}
```

### Lambda Integration (Future)
```typescript
// Example integration with your Lambda functions
async function fetchBrandVisibilityData(brand: string) {
  const apiUrl = process.env.NEXT_PUBLIC_AWS_API_URL
  const response = await fetch(`${apiUrl}/brand-visibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brandName: brand,
      industry: 'Technology',
      domain: `${brand.toLowerCase()}.com`
    })
  })
  return response.json()
}
```

## Component Details

### VisibilityDashboard.tsx
- **State Management**: Brand selection, data fetching, loading states
- **URL Integration**: Syncs brand selection with browser URL
- **Error Handling**: Comprehensive error states with retry functionality
- **Responsive Layout**: Grid-based layout that adapts to screen size

### SentimentChart.tsx
- **Chart Configuration**: Customized Chart.js options for brand theming
- **Reference Lines**: Dashed lines for sentiment thresholds
- **Custom Tooltips**: Rich hover information with date formatting
- **Accessibility**: Proper ARIA labels and keyboard navigation

### MentionsList.tsx
- **Dynamic Sorting**: Mentions ordered by frequency
- **Progress Visualization**: Relative frequency bars
- **Sentiment Icons**: Emoji indicators for quick recognition
- **Summary Statistics**: Aggregate counts by sentiment type

### VisibilityDashboardSkeleton.tsx
- **Loading States**: Skeleton screens matching final layout
- **Progressive Loading**: Different skeleton types for different content
- **Smooth Transitions**: Fade-in animations when data loads

## Styling and Theming

### Tailwind CSS Classes
```css
/* Key styling patterns used */
.sentiment-positive { @apply text-green-600 bg-green-50 }
.sentiment-neutral { @apply text-gray-600 bg-gray-50 }
.sentiment-negative { @apply text-red-600 bg-red-50 }

/* Chart theming */
.chart-container { @apply h-80 relative }
.chart-legend { @apply flex flex-wrap gap-4 text-xs }
```

### shadcn/ui Components Used
- **Card**: Layout containers with headers and content
- **Badge**: Sentiment indicators with color variants
- **Button**: Actions and navigation elements
- **Select**: Brand selection dropdown
- **Progress**: Mention frequency visualization

## Performance Considerations

### Optimization Strategies
- **Suspense Boundaries**: Prevent layout shifts during loading
- **Skeleton Loading**: Immediate visual feedback
- **Data Caching**: Prevent redundant API calls
- **Chart Optimization**: Efficient re-rendering with Chart.js
- **Responsive Images**: Optimized for different screen sizes

### Bundle Size Impact
- **Chart.js**: ~45KB (gzipped) for charting capabilities
- **react-chartjs-2**: ~5KB wrapper for React integration
- **Total Addition**: ~50KB to bundle size
- **Code Splitting**: Automatic with Next.js App Router

## Future Enhancements

### Planned Features
1. **Historical Data Export**: CSV/JSON download functionality
2. **Alert System**: Notifications for significant sentiment changes
3. **Comparative Analysis**: Side-by-side brand comparisons
4. **Custom Date Ranges**: User-selectable time periods
5. **Real-time Updates**: WebSocket integration for live data
6. **Advanced Filtering**: Filter by mention source, sentiment range
7. **Sentiment Prediction**: ML-based trend forecasting

### Integration Opportunities
- **Brand Comparison Lambda**: Connect to your brand comparison API
- **Real-time Data**: WebSocket connections for live updates
- **Export Functionality**: PDF report generation
- **Alerting System**: Email/SMS notifications for sentiment changes

## Troubleshooting

### Common Issues
1. **Chart Not Rendering**: Check Chart.js registration in component
2. **API Errors**: Verify API endpoint and CORS configuration
3. **Loading States**: Ensure Suspense boundaries are properly placed
4. **Mobile Responsiveness**: Test on various screen sizes

### Debug Mode
```typescript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development'
if (DEBUG) console.log('Dashboard data:', data)
```

This comprehensive dashboard provides a solid foundation for brand visibility monitoring and can be easily extended with additional features and real-time data integration. 