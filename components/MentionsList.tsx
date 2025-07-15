"use client"

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Mention {
  keyword: string
  tone: 'positive' | 'neutral' | 'negative'
  frequency: number
}

interface MentionsListProps {
  mentions: Mention[]
}

export default function MentionsList({ mentions }: MentionsListProps) {
  // Sort mentions by frequency (highest first)
  const sortedMentions = [...mentions].sort((a, b) => b.frequency - a.frequency)
  
  // Calculate max frequency for progress bar scaling
  const maxFrequency = Math.max(...mentions.map(m => m.frequency))
  
  // Get badge variant based on tone
  const getBadgeVariant = (tone: string) => {
    switch (tone) {
      case 'positive':
        return 'default' // Green-ish primary color
      case 'negative':
        return 'destructive' // Red
      case 'neutral':
      default:
        return 'secondary' // Gray
    }
  }
  
  // Get tone color for progress bar
  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'positive':
        return 'bg-green-500'
      case 'negative':
        return 'bg-red-500'
      case 'neutral':
      default:
        return 'bg-gray-400'
    }
  }
  
  // Get tone icon
  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'positive':
        return '↗️'
      case 'negative':
        return '↘️'
      case 'neutral':
      default:
        return '➡️'
    }
  }

  if (!mentions || mentions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No mentions data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedMentions.map((mention, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{getToneIcon(mention.tone)}</span>
              <span className="font-medium text-sm">{mention.keyword}</span>
              <Badge 
                variant={getBadgeVariant(mention.tone)}
                className="text-xs px-2 py-0.5"
              >
                {mention.tone}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {mention.frequency} mentions
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getToneColor(mention.tone)}`}
                style={{ 
                  width: `${(mention.frequency / maxFrequency) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      ))}
      
      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm font-medium text-green-600">
              {mentions.filter(m => m.tone === 'positive').length}
            </div>
            <div className="text-xs text-muted-foreground">Positive</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">
              {mentions.filter(m => m.tone === 'neutral').length}
            </div>
            <div className="text-xs text-muted-foreground">Neutral</div>
          </div>
          <div>
            <div className="text-sm font-medium text-red-600">
              {mentions.filter(m => m.tone === 'negative').length}
            </div>
            <div className="text-xs text-muted-foreground">Negative</div>
          </div>
        </div>
      </div>
    </div>
  )
} 