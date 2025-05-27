"use client"

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: string
}

interface UserStats {
  totalAnalyses: number
  averageScore: number
  bestScore: number
  improvementStreak: number
  lastAnalysisDate: string
  totalImprovements: number
  quickWinsCompleted: number
}

interface GamificationPanelProps {
  currentScore: number
  previousScore?: number
  userStats?: UserStats
  className?: string
}

export default function GamificationPanel({ 
  currentScore, 
  previousScore, 
  userStats,
  className 
}: GamificationPanelProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showAchievementModal, setShowAchievementModal] = useState<Achievement | null>(null)

  // Initialize achievements based on user progress
  useEffect(() => {
    const defaultStats: UserStats = {
      totalAnalyses: 1,
      averageScore: currentScore,
      bestScore: currentScore,
      improvementStreak: previousScore && currentScore > previousScore ? 1 : 0,
      lastAnalysisDate: new Date().toISOString(),
      totalImprovements: 0,
      quickWinsCompleted: 0,
      ...userStats
    }

    const allAchievements: Achievement[] = [
      {
        id: 'first_analysis',
        title: 'First Steps',
        description: 'Complete your first AI visibility analysis',
        icon: '🎯',
        unlocked: defaultStats.totalAnalyses >= 1,
        rarity: 'common',
        unlockedAt: defaultStats.totalAnalyses >= 1 ? defaultStats.lastAnalysisDate : undefined
      },
      {
        id: 'score_50',
        title: 'Getting Started',
        description: 'Achieve a score of 50 or higher',
        icon: '📈',
        unlocked: currentScore >= 50,
        rarity: 'common',
        unlockedAt: currentScore >= 50 ? new Date().toISOString() : undefined
      },
      {
        id: 'score_70',
        title: 'Good Progress',
        description: 'Achieve a score of 70 or higher',
        icon: '⭐',
        unlocked: currentScore >= 70,
        rarity: 'rare',
        unlockedAt: currentScore >= 70 ? new Date().toISOString() : undefined
      },
      {
        id: 'score_90',
        title: 'Excellence',
        description: 'Achieve a score of 90 or higher',
        icon: '🏆',
        unlocked: currentScore >= 90,
        rarity: 'epic',
        unlockedAt: currentScore >= 90 ? new Date().toISOString() : undefined
      },
      {
        id: 'perfect_score',
        title: 'Perfection',
        description: 'Achieve a perfect score of 100',
        icon: '💎',
        unlocked: currentScore >= 100,
        rarity: 'legendary',
        unlockedAt: currentScore >= 100 ? new Date().toISOString() : undefined
      },
      {
        id: 'improvement_streak',
        title: 'On Fire!',
        description: 'Improve your score 3 times in a row',
        icon: '🔥',
        unlocked: defaultStats.improvementStreak >= 3,
        progress: Math.min(defaultStats.improvementStreak, 3),
        maxProgress: 3,
        rarity: 'rare',
        unlockedAt: defaultStats.improvementStreak >= 3 ? new Date().toISOString() : undefined
      },
      {
        id: 'analyzer_veteran',
        title: 'Analyzer Veteran',
        description: 'Complete 10 analyses',
        icon: '🎖️',
        unlocked: defaultStats.totalAnalyses >= 10,
        progress: Math.min(defaultStats.totalAnalyses, 10),
        maxProgress: 10,
        rarity: 'epic',
        unlockedAt: defaultStats.totalAnalyses >= 10 ? defaultStats.lastAnalysisDate : undefined
      },
      {
        id: 'quick_wins_master',
        title: 'Quick Wins Master',
        description: 'Complete 25 quick win recommendations',
        icon: '⚡',
        unlocked: defaultStats.quickWinsCompleted >= 25,
        progress: Math.min(defaultStats.quickWinsCompleted, 25),
        maxProgress: 25,
        rarity: 'epic',
        unlockedAt: defaultStats.quickWinsCompleted >= 25 ? new Date().toISOString() : undefined
      }
    ]

    setAchievements(allAchievements)

    // Check for newly unlocked achievements
    const newlyUnlocked = allAchievements.find(
      achievement => achievement.unlocked && !localStorage.getItem(`achievement_${achievement.id}_shown`)
    )

    if (newlyUnlocked) {
      setShowAchievementModal(newlyUnlocked)
      localStorage.setItem(`achievement_${newlyUnlocked.id}_shown`, 'true')
    }
  }, [currentScore, previousScore, userStats])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50 text-gray-700'
      case 'rare': return 'border-blue-300 bg-blue-50 text-blue-700'
      case 'epic': return 'border-purple-300 bg-purple-50 text-purple-700'
      case 'legendary': return 'border-yellow-300 bg-yellow-50 text-yellow-700'
      default: return 'border-gray-300 bg-gray-50 text-gray-700'
    }
  }

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'rare': return 'shadow-blue-200'
      case 'epic': return 'shadow-purple-200'
      case 'legendary': return 'shadow-yellow-200'
      default: return ''
    }
  }

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: 'Expert', color: 'text-purple-600', icon: '👑' }
    if (score >= 70) return { level: 'Advanced', color: 'text-blue-600', icon: '🎯' }
    if (score >= 50) return { level: 'Intermediate', color: 'text-green-600', icon: '📈' }
    return { level: 'Beginner', color: 'text-orange-600', icon: '🌱' }
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const totalAchievements = achievements.length
  const completionPercentage = (unlockedAchievements.length / totalAchievements) * 100

  const scoreLevel = getScoreLevel(currentScore)
  const improvement = previousScore ? currentScore - previousScore : 0

  return (
    <div className={cn("space-y-6", className)}>
      {/* Achievement Modal */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-xl p-6 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
            <div className="text-6xl mb-4">{showAchievementModal.icon}</div>
            <h3 className="text-2xl font-bold mb-2">Achievement Unlocked!</h3>
            <h4 className="text-lg font-semibold text-primary mb-2">{showAchievementModal.title}</h4>
            <p className="text-muted-foreground mb-4">{showAchievementModal.description}</p>
            <div className={cn(
              "inline-block px-3 py-1 rounded-full text-xs font-medium mb-4",
              getRarityColor(showAchievementModal.rarity)
            )}>
              {showAchievementModal.rarity.toUpperCase()}
            </div>
            <button
              onClick={() => setShowAchievementModal(null)}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Score Level & Progress */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{scoreLevel.icon}</div>
            <div>
              <h3 className="text-xl font-bold">AI Visibility Level</h3>
              <p className={cn("font-semibold", scoreLevel.color)}>{scoreLevel.level}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{currentScore}</div>
            {improvement !== 0 && (
              <div className={cn(
                "text-sm font-medium flex items-center gap-1",
                improvement > 0 ? "text-green-600" : "text-red-600"
              )}>
                {improvement > 0 ? "↗️" : "↘️"} {Math.abs(improvement)} pts
              </div>
            )}
          </div>
        </div>

        {/* Progress to next level */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to next level</span>
            <span>{Math.min(currentScore, 100)}/100</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-500"
              style={{ width: `${Math.min(currentScore, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Achievement Progress */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Achievements</h3>
          <div className="text-sm text-muted-foreground">
            {unlockedAchievements.length}/{totalAchievements}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Completion</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                "relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105",
                achievement.unlocked 
                  ? cn(getRarityColor(achievement.rarity), getRarityGlow(achievement.rarity))
                  : "border-muted bg-muted/30 text-muted-foreground opacity-60"
              )}
              title={achievement.description}
            >
              <div className="text-center">
                <div className={cn(
                  "text-2xl mb-1",
                  !achievement.unlocked && "grayscale"
                )}>
                  {achievement.icon}
                </div>
                <div className="text-xs font-medium truncate">
                  {achievement.title}
                </div>
                
                {/* Progress bar for progressive achievements */}
                {achievement.maxProgress && (
                  <div className="mt-2">
                    <div className="w-full bg-muted rounded-full h-1">
                      <div 
                        className="bg-primary rounded-full h-1 transition-all duration-300"
                        style={{ 
                          width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%` 
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {achievement.progress || 0}/{achievement.maxProgress}
                    </div>
                  </div>
                )}
              </div>

              {/* Rarity indicator */}
              {achievement.unlocked && achievement.rarity !== 'common' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{userStats?.totalAnalyses || 1}</div>
          <div className="text-sm text-muted-foreground">Analyses</div>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{userStats?.bestScore || currentScore}</div>
          <div className="text-sm text-muted-foreground">Best Score</div>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{userStats?.improvementStreak || 0}</div>
          <div className="text-sm text-muted-foreground">Streak</div>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{unlockedAchievements.length}</div>
          <div className="text-sm text-muted-foreground">Achievements</div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">💪</div>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">
              {currentScore >= 90 ? "Outstanding work!" :
               currentScore >= 70 ? "You're doing great!" :
               currentScore >= 50 ? "Keep improving!" :
               "Every expert was once a beginner!"}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {currentScore >= 90 ? "Your AI visibility is excellent. Share your success!" :
               currentScore >= 70 ? "You're on the right track. A few more improvements and you'll be an expert!" :
               currentScore >= 50 ? "Focus on the quick wins to boost your score rapidly." :
               "Start with the recommended quick wins to see immediate improvements."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 