import InputForm from "@/components/InputForm"

export const metadata = {
  title: "Aelora - Website Analyzer",
  description: "Analyze your website's content for AI search engine optimization",
}

export default function AnalyzerPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Website Analyzer
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Enter a URL to analyze your website for AI search engine optimization.
          </p>
        </div>
        <div className="w-full max-w-md mx-auto mt-8">
          <InputForm />
        </div>
      </div>
    </div>
  )
} 