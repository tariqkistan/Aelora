'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Filter, X, SlidersHorizontal, Calendar } from 'lucide-react'

interface FilterOptions {
  searchQuery: string
  scoreRange: [number, number]
  priority: string[]
  categories: string[]
  dateRange: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void
  data: {
    recommendations?: any[]
    quickWins?: any[]
    categories?: string[]
  }
}

export default function AdvancedFilters({ onFiltersChange, data }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    scoreRange: [0, 100],
    priority: [],
    categories: [],
    dateRange: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc'
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  useEffect(() => {
    // Count active filters
    let count = 0
    if (filters.searchQuery) count++
    if (filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100) count++
    if (filters.priority.length > 0) count++
    if (filters.categories.length > 0) count++
    if (filters.dateRange !== 'all') count++
    
    setActiveFiltersCount(count)
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      searchQuery: '',
      scoreRange: [0, 100],
      priority: [],
      categories: [],
      dateRange: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc'
    })
  }

  const togglePriority = (priority: string) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }))
  }

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const availableCategories = [
    'Content Quality',
    'Technical SEO',
    'User Experience',
    'Performance',
    'Accessibility',
    'Mobile Optimization',
    'Schema Markup',
    'Meta Tags'
  ]

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-1" />
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Bar - Always Visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search recommendations, categories, or keywords..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap gap-2">
          {['high', 'medium', 'low'].map(priority => (
            <Badge
              key={priority}
              variant={filters.priority.includes(priority) ? 'default' : 'outline'}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => togglePriority(priority)}
            >
              {priority} priority
            </Badge>
          ))}
          <Badge
            variant={filters.dateRange === 'recent' ? 'default' : 'outline'}
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={() => updateFilter('dateRange', filters.dateRange === 'recent' ? 'all' : 'recent')}
          >
            Recent only
          </Badge>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Score Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Score Range</label>
              <div className="px-3">
                <Slider
                  value={filters.scoreRange}
                  onValueChange={(value) => updateFilter('scoreRange', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{filters.scoreRange[0]}</span>
                  <span>{filters.scoreRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Categories</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableCategories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <label
                      htmlFor={category}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="quarter">This quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="impact">Impact</SelectItem>
                    <SelectItem value="effort">Effort</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Order</label>
                <Select 
                  value={filters.sortOrder} 
                  onValueChange={(value: 'asc' | 'desc') => updateFilter('sortOrder', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Active Filters Summary</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                {filters.searchQuery && (
                  <p>Search: "{filters.searchQuery}"</p>
                )}
                {(filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100) && (
                  <p>Score: {filters.scoreRange[0]} - {filters.scoreRange[1]}</p>
                )}
                {filters.priority.length > 0 && (
                  <p>Priority: {filters.priority.join(', ')}</p>
                )}
                {filters.categories.length > 0 && (
                  <p>Categories: {filters.categories.join(', ')}</p>
                )}
                {filters.dateRange !== 'all' && (
                  <p>Date: {filters.dateRange}</p>
                )}
                <p>Sort: {filters.sortBy} ({filters.sortOrder})</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 