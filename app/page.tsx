import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Optimize Your Content for AI Search Engines
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Aelora helps you analyze and enhance your website&apos;s visibility on AI-driven search platforms like ChatGPT, Perplexity, and Google SGE.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/analyzer">
                  Analyze Your Website
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/visibility">
                  View Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Features
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Powerful tools to help your content stand out in the age of AI
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M12 2v20" />
                  <path d="m6 12 6-6 6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">AEO Content Analyzer</h3>
              <p className="text-sm text-muted-foreground text-center">
                Smart content extraction and industry-specific analysis powered by AI for maximum insights.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Brand Visibility Dashboard</h3>
              <p className="text-sm text-muted-foreground text-center">
                Track sentiment trends, monitor mentions, and analyze your brand's AI visibility over time.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M7 10v12" />
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Cost-Effective AI Analysis</h3>
              <p className="text-sm text-muted-foreground text-center">
                Advanced AI insights with 60-80% reduced token usage through smart content prioritization.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Enhanced AI Analysis
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                New smart features that maximize value while keeping costs low
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12 mt-8">
            <div className="flex flex-col space-y-4 rounded-lg border p-6">
              <h3 className="text-xl font-bold">Smart Content Extraction</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Prioritizes high-impact content (titles, headings, CTAs)</li>
                <li>• Reduces token usage by 60-80%</li>
                <li>• Detects content type and industry automatically</li>
                <li>• Focuses on conversion-critical elements</li>
              </ul>
            </div>
            <div className="flex flex-col space-y-4 rounded-lg border p-6">
              <h3 className="text-xl font-bold">Industry-Specific Templates</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• E-commerce, SaaS, Local Business, Healthcare</li>
                <li>• Targeted recommendations for each industry</li>
                <li>• Context-aware analysis prompts</li>
                <li>• Specialized focus areas and insights</li>
              </ul>
            </div>
            <div className="flex flex-col space-y-4 rounded-lg border p-6">
              <h3 className="text-xl font-bold">Quick Wins & Priorities</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Immediate actionable improvements</li>
                <li>• Priority levels (high/medium/low)</li>
                <li>• Effort estimation for each recommendation</li>
                <li>• Expected impact predictions</li>
              </ul>
            </div>
            <div className="flex flex-col space-y-4 rounded-lg border p-6">
              <h3 className="text-xl font-bold">Performance Tracking</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time analysis performance metrics</li>
                <li>• Content type and industry detection</li>
                <li>• Export functionality for reports</li>
                <li>• Detailed breakdown of all insights</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* New Visibility Dashboard Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Brand Visibility Dashboard
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Monitor your brand's AI visibility with comprehensive sentiment analysis and trend tracking
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12 mt-8">
            <div className="flex flex-col space-y-4 rounded-lg border p-6">
              <h3 className="text-xl font-bold">Sentiment Over Time</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Interactive Chart.js visualizations</li>
                <li>• 30-day sentiment trend analysis</li>
                <li>• Positive, neutral, and negative thresholds</li>
                <li>• Hover tooltips with detailed insights</li>
              </ul>
            </div>
            <div className="flex flex-col space-y-4 rounded-lg border p-6">
              <h3 className="text-xl font-bold">Keyword Mentions</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Color-coded sentiment badges</li>
                <li>• Frequency analysis with progress bars</li>
                <li>• Positive, neutral, and negative categorization</li>
                <li>• Most impactful keywords highlighted</li>
              </ul>
            </div>
            <div className="flex flex-col space-y-4 rounded-lg border p-6">
              <h3 className="text-xl font-bold">Key Metrics</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Average sentiment score with trends</li>
                <li>• Total mentions across all platforms</li>
                <li>• Brand visibility status indicators</li>
                <li>• Real-time data refresh capabilities</li>
              </ul>
            </div>
            <div className="flex flex-col space-y-4 rounded-lg border p-6">
              <h3 className="text-xl font-bold">AI-Powered Insights</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• GPT-4 generated analysis summaries</li>
                <li>• Brand comparison capabilities</li>
                <li>• Industry-specific recommendations</li>
                <li>• Competitive positioning insights</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <Button asChild size="lg">
              <Link href="/visibility">
                Explore Visibility Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Improve Your AI Visibility?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Get started with Aelora today and optimize your content for AI search engines.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Button asChild className="w-full" size="lg">
                <Link href="/analyzer">
                  Try It Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 