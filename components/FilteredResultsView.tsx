'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PriorityBadge from '@/components/PriorityBadge'
import { Search, Filter, SortAsc, SortDesc, Eye, EyeOff } from 'lucide-react'

interface FilterOptions {
  searchQuery: string
  scoreRange: [number, number]
  priority: string[]
  categories: string[]
  dateRange: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface Recommendation {
  title: string
  description: string
  rationale: string
  example: string
  expected_impact: string
  priority?: 'high' | 'medium' | 'low'
  category?: string
  score?: number
  date?: string
}

interface FilteredResultsViewProps {
  recommendations: Recommendation[]
  quickWins: any[]
  filters: FilterOptions
}

export default function FilteredResultsView({ 
  recommendations, 
  quickWins, 
  filters 
}: FilteredResultsViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  // Filter and sort recommendations
  const filteredRecommendations = useMemo(() => {
    let filtered = [...recommendations]

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(rec => 
        rec.title.toLowerCase().includes(query) ||
        rec.description.toLowerCase().includes(query) ||
        rec.rationale.toLowerCase().includes(query) ||
        (rec.category && rec.category.toLowerCase().includes(query))
      )
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(rec => 
        rec.priority && filters.priority.includes(rec.priority)
      )
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(rec => 
        rec.category && filters.categories.includes(rec.category)
      )
    }

    // Apply score range filter
    filtered = filtered.filter(rec => {
      if (rec.score !== undefined) {
        return rec.score >= filters.scoreRange[0] && rec.score <= filters.scoreRange[1]
      }
      return true // Include items without scores
    })

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0)
          break
        case 'impact':
          comparison = a.expected_impact.localeCompare(b.expected_impact)
          break
        case 'date':
          comparison = (new Date(a.date || '').getTime()) - (new Date(b.date || '').getTime())
          break
        case 'relevance':
        default:
          comparison = a.title.localeCompare(b.title)
          break
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [recommendations, filters])

  // Filter quick wins
  const filteredQuickWins = useMemo(() => {
    let filtered = [...quickWins]

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(win => 
        win.action.toLowerCase().includes(query) ||
        win.impact.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [quickWins, filters])

  const RecommendationCard = ({ rec, index }: { rec: Recommendation, index: number }) => {
    const isExpanded = expandedItems.has(index)
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{rec.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {rec.description}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {rec.priority && (
                <PriorityBadge 
                  priority={rec.priority} 
                  size="sm"
                  animated={rec.priority === 'high'}
                />
              )}
              {rec.category && (
                <Badge variant="outline" className="text-xs">
                  {rec.category}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Expected Impact */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-1">📈 Expected Impact</h4>
              <p className="text-sm text-muted-foreground">{rec.expected_impact}</p>
            </div>

            {/* Expandable Content */}
            {isExpanded && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h4 className="text-sm font-medium mb-2">💡 Rationale</h4>
                  <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                </div>
                
                {rec.example && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">✨ Example</h4>
                    <div className="bg-background p-3 rounded border">
                      <code className="text-sm">{rec.example}</code>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(index)}
              className="w-full"
            >
              {isExpanded ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Details
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const QuickWinCard = ({ win, index }: { win: any, index: number }) => (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-green-900">{win.action}</h3>
          <PriorityBadge 
            priority={win.effort === 'low' ? 'high' : win.effort === 'medium' ? 'medium' : 'low'} 
            size="sm"
            animated={win.effort === 'low'}
          />
        </div>
        <p className="text-sm text-green-700 mb-3">{win.impact}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-green-600 font-medium">Effort: {win.effort}</span>
          <Badge variant="outline" className="text-green-700 border-green-300">
            Quick Win
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">
            Filtered Results ({filteredRecommendations.length + filteredQuickWins.length} items)
          </h3>
          <p className="text-sm text-muted-foreground">
            {filters.searchQuery && `Search: "${filters.searchQuery}" • `}
            {filters.priority.length > 0 && `Priority: ${filters.priority.join(', ')} • `}
            {filters.categories.length > 0 && `Categories: ${filters.categories.length} selected • `}
            Sorted by {filters.sortBy} ({filters.sortOrder})
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
        </div>
      </div>

      {/* Quick Wins Section */}
      {filteredQuickWins.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            ⚡ Quick Wins
            <Badge variant="secondary">{filteredQuickWins.length}</Badge>
          </h4>
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredQuickWins.map((win, index) => (
              <QuickWinCard key={index} win={win} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {filteredRecommendations.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🤖 AI Recommendations
            <Badge variant="secondary">{filteredRecommendations.length}</Badge>
          </h4>
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2' 
              : 'grid-cols-1'
          }`}>
            {filteredRecommendations.map((rec, index) => (
              <RecommendationCard key={index} rec={rec} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredRecommendations.length === 0 && filteredQuickWins.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query to see more results.
            </p>
            <Button variant="outline">
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 