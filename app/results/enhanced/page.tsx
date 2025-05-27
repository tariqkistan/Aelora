import { Suspense } from 'react'
import EnhancedResultsContent from '@/components/EnhancedResultsContent'
import Loader from '@/components/Loader'

export const metadata = {
  title: "Analysis Results - Aelora",
  description: "View your website's AI visibility analysis results",
}

export default function EnhancedResultsPage() {
  return (
    <Suspense fallback={<div className="container max-w-6xl py-12"><Loader /></div>}>
      <EnhancedResultsContent />
    </Suspense>
  )
} 