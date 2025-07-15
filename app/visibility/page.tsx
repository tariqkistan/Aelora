import { Suspense } from 'react'
import VisibilityDashboard from '@/components/VisibilityDashboard'
import VisibilityDashboardSkeleton from '@/components/VisibilityDashboardSkeleton'

export const metadata = {
  title: 'Brand Visibility Dashboard - Aelora',
  description: 'Monitor your brand visibility sentiment over time with AI-powered insights',
}

export default function VisibilityPage() {
  return (
    <div className="container max-w-7xl py-8">
      <div className="flex flex-col space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Brand Visibility Dashboard
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Monitor sentiment trends, analyze mentions, and track your brand's AI visibility over time
          </p>
        </div>
        
        <Suspense fallback={<VisibilityDashboardSkeleton />}>
          <VisibilityDashboard />
        </Suspense>
      </div>
    </div>
  )
} 