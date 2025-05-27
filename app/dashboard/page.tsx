"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import GamificationPanel from '@/components/GamificationPanel'
import HistoricalTrends from '@/components/HistoricalTrends'
import EnhancedScoreCard from '@/components/EnhancedScoreCard'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Sample user data (in a real app, this would come from your backend)
  const userStats = {
    totalAnalyses: 12,
    averageScore: 74,
    bestScore: 89,
    improvementStreak: 3,
    lastAnalysisDate: new Date().toISOString(),
    totalImprovements: 18,
    quickWinsCompleted: 25
  }

  const recentAnalyses = [
    {
      date: '2024-01-25',
      overallScore: 89,
      readability: 85,
      schema: 78,
      questionAnswerMatch: 92,
      headingsStructure: 88,
      url: 'mywebsite.com/blog/ai-optimization',
      improvements: ['Added FAQ section', 'Improved meta descriptions']
    },
    {
      date: '2024-01-20',
      overallScore: 82,
      readability: 80,
      schema: 70,
      questionAnswerMatch: 85,
      headingsStructure: 85,
      url: 'mywebsite.com/services',
      improvements: ['Added schema markup', 'Optimized headings']
    },
    {
      date: '2024-01-15',
      overallScore: 76,
      readability: 78,
      schema: 65,
      questionAnswerMatch: 78,
      headingsStructure: 82,
      url: 'mywebsite.com/about',
      improvements: ['Improved readability', 'Added structured data']
    },
    {
      date: '2024-01-10',
      overallScore: 71,
      readability: 75,
      schema: 60,
      questionAnswerMatch: 72,
      headingsStructure: 78,
      url: 'mywebsite.com/contact',
      improvements: ['Enhanced content structure']
    },
    {
      date: '2024-01-05',
      overallScore: 68,
      readability: 72,
      schema: 55,
      questionAnswerMatch: 70,
      headingsStructure: 75,
      url: 'mywebsite.com/products',
      improvements: ['Added product schema']
    }
  ]

  const getScoreImprovement = () => {
    if (recentAnalyses.length < 2) return 0
    return recentAnalyses[0].overallScore - recentAnalyses[recentAnalyses.length - 1].overallScore
  }

  const getAverageScore = () => {
    if (recentAnalyses.length === 0) return 0
    return Math.round(recentAnalyses.reduce((sum, analysis) => sum + analysis.overallScore, 0) / recentAnalyses.length)
  }

  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Visibility Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress and optimize your AI search visibility
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/analyzer">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Analysis
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedScoreCard
            title="Latest Score"
            score={recentAnalyses[0]?.overallScore || 0}
            description="Your most recent analysis"
            isPrimary
          />
          <EnhancedScoreCard
            title="Average Score"
            score={getAverageScore()}
            description="Across all analyses"
            benchmark={75}
          />
          <EnhancedScoreCard
            title="Best Score"
            score={userStats.bestScore}
            description="Your highest achievement"
            benchmark={85}
          />
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">🔥</div>
              <div>
                <h3 className="font-semibold">Improvement Streak</h3>
                <p className="text-sm text-muted-foreground">Consecutive improvements</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600">{userStats.improvementStreak}</div>
          </div>
        </div>

        {/* Gamification Panel */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">🎮 Progress & Achievements</h2>
          <GamificationPanel
            currentScore={recentAnalyses[0]?.overallScore || 0}
            previousScore={recentAnalyses[1]?.overallScore}
            userStats={userStats}
          />
        </div>

        {/* Historical Trends */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">📈 Performance Trends</h2>
          <HistoricalTrends
            data={recentAnalyses}
            currentScore={recentAnalyses[0]?.overallScore || 0}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">📋 Recent Analyses</h2>
          <div className="space-y-4">
            {recentAnalyses.slice(0, 5).map((analysis, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="font-medium truncate">{analysis.url}</div>
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      analysis.overallScore >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                      analysis.overallScore >= 60 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    )}>
                      {analysis.overallScore >= 80 ? 'Excellent' :
                       analysis.overallScore >= 60 ? 'Good' : 'Needs Work'}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {new Date(analysis.date).toLocaleDateString()} • 
                    {analysis.improvements && analysis.improvements.length > 0 && (
                      <span className="ml-1">{analysis.improvements.length} improvements made</span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold">{analysis.overallScore}</div>
                  {index < recentAnalyses.length - 1 && (
                    <div className={cn(
                      "text-sm font-medium flex items-center gap-1",
                      analysis.overallScore > recentAnalyses[index + 1].overallScore
                        ? "text-green-600" : "text-red-600"
                    )}>
                      {analysis.overallScore > recentAnalyses[index + 1].overallScore ? "↗️" : "↘️"}
                      {Math.abs(analysis.overallScore - recentAnalyses[index + 1].overallScore)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {recentAnalyses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
              <p className="mb-4">Start analyzing your websites to track your AI visibility progress</p>
              <Link href="/analyzer">
                <Button>Analyze Your First URL</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2">Analyze New URL</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Check the AI visibility of a new webpage
            </p>
            <Link href="/analyzer">
              <Button variant="outline" className="w-full">
                Start Analysis
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold mb-2">View Detailed Report</h3>
            <p className="text-sm text-muted-foreground mb-4">
              See your latest analysis with expert insights
            </p>
            <Link href="/results/enhanced">
              <Button variant="outline" className="w-full">
                View Report
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-semibold mb-2">Unlock Achievements</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete more analyses to earn rewards
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </div>
        </div>

        {/* Tips & Insights */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-200">
                Optimization Tips
              </h3>
              <div className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                <p>• <strong>Consistency is key:</strong> Regular analysis helps track improvements over time</p>
                <p>• <strong>Focus on quick wins:</strong> Small changes can lead to significant score improvements</p>
                <p>• <strong>Monitor trends:</strong> Look for patterns in your score changes to identify what works</p>
                <p>• <strong>Set goals:</strong> Aim for specific score targets to stay motivated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 