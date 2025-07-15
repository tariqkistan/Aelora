import InputForm from "@/components/InputForm"
import AIRankingPreview from "@/components/AIRankingPreview"

export const metadata = {
  title: "Aelora - Website Analyzer",
  description: "Analyze your website's content for AI search engine optimization",
}

export default function AnalyzerPage() {
  return (
    <div className="container max-w-6xl py-12">
      <div className="flex flex-col items-center justify-center space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Website Analyzer
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Tell us about your business, then analyze your website for AI search engine optimization.
          </p>
        </div>
        
        <div className="w-full mt-8">
          <InputForm />
        </div>
      </div>
      
      {/* AI Ranking Preview */}
      <AIRankingPreview />
    </div>
  )
} 