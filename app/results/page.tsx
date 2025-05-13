"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ScoreCard from "@/components/ScoreCard"
import ReportCard from "@/components/ReportCard"
import Loader from "@/components/Loader"
import { analyzeUrl } from "@/lib/apiClient"
import ResultsContent from "@/components/ResultsContent"

interface AnalysisResult {
  url: string
  timestamp: string
  scores: {
    readability: number
    schema: number
    questionAnswerMatch: number
    headingsStructure: number
    overallScore: number
  }
  recommendations: string[]
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="container max-w-4xl py-24 flex items-center justify-center">Loading...</div>}>
      <ResultsContent />
    </Suspense>
  )
} 