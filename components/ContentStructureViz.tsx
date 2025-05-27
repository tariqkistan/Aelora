"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ContentNode {
  id: string
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'content' | 'image' | 'list' | 'table'
  text: string
  level?: number
  children?: ContentNode[]
  hasKeywords?: boolean
  wordCount?: number
  issues?: string[]
}

interface ContentStructureVizProps {
  structure: ContentNode[]
  className?: string
}

export default function ContentStructureViz({ structure, className }: ContentStructureVizProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']))
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'h1':
        return <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">1</div>
      case 'h2':
        return <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">2</div>
      case 'h3':
        return <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">3</div>
      case 'h4':
        return <div className="w-4 h-4 bg-yellow-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">4</div>
      case 'h5':
        return <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">5</div>
      case 'h6':
        return <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">6</div>
      case 'content':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'image':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'list':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        )
      case 'table':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
          </svg>
        )
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
    }
  }

  const getNodeColor = (node: ContentNode) => {
    if (node.issues && node.issues.length > 0) return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
    if (node.hasKeywords) return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
    return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20'
  }

  const renderNode = (node: ContentNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const isSelected = selectedNode === node.id

    return (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
            getNodeColor(node),
            isSelected && "ring-2 ring-primary ring-offset-2",
            `ml-${depth * 4}`
          )}
          onClick={() => setSelectedNode(node.id)}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(node.id)
              }}
              className="p-1 hover:bg-white/50 rounded"
              aria-label={isExpanded ? "Collapse section" : "Expand section"}
            >
              <svg
                className={cn(
                  "w-3 h-3 transition-transform",
                  isExpanded ? "rotate-90" : ""
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          {!hasChildren && <div className="w-5" />}

          {/* Node Icon */}
          {getNodeIcon(node.type)}

          {/* Node Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{node.text}</span>
              
              {/* Badges */}
              <div className="flex gap-1">
                {node.hasKeywords && (
                  <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                    Keywords
                  </span>
                )}
                {node.wordCount && (
                  <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                    {node.wordCount}w
                  </span>
                )}
                {node.issues && node.issues.length > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
                    {node.issues.length} issues
                  </span>
                )}
              </div>
            </div>
            
            {/* Issues */}
            {node.issues && node.issues.length > 0 && isSelected && (
              <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                {node.issues.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  // Calculate structure stats
  const stats = {
    totalHeadings: structure.filter(node => node.type.startsWith('h')).length,
    totalContent: structure.filter(node => node.type === 'content').length,
    totalImages: structure.filter(node => node.type === 'image').length,
    totalIssues: structure.reduce((sum, node) => sum + (node.issues?.length || 0), 0),
    keywordOptimized: structure.filter(node => node.hasKeywords).length
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Stats */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold">{stats.totalHeadings}</div>
          <div className="text-xs text-muted-foreground">Headings</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{stats.totalContent}</div>
          <div className="text-xs text-muted-foreground">Content Blocks</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{stats.totalImages}</div>
          <div className="text-xs text-muted-foreground">Images</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{stats.keywordOptimized}</div>
          <div className="text-xs text-muted-foreground">Keyword Optimized</div>
        </div>
        {stats.totalIssues > 0 && (
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{stats.totalIssues}</div>
            <div className="text-xs text-muted-foreground">Issues Found</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
          <span>H1</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <span>H2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span>H3</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6" />
          </svg>
          <span>Content</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
          </svg>
          <span>Images</span>
        </div>
      </div>

      {/* Structure Tree */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {structure.map(node => renderNode(node))}
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="p-4 bg-card border rounded-lg">
          <h4 className="font-semibold mb-2">Selected Element Details</h4>
          {(() => {
            const findNode = (nodes: ContentNode[]): ContentNode | null => {
              for (const node of nodes) {
                if (node.id === selectedNode) return node
                if (node.children) {
                  const found = findNode(node.children)
                  if (found) return found
                }
              }
              return null
            }
            
            const node = findNode(structure)
            if (!node) return null
            
            return (
              <div className="space-y-2 text-sm">
                <div><strong>Type:</strong> {node.type.toUpperCase()}</div>
                <div><strong>Text:</strong> {node.text}</div>
                {node.wordCount && <div><strong>Word Count:</strong> {node.wordCount}</div>}
                {node.hasKeywords && <div><strong>Keywords:</strong> ✅ Contains target keywords</div>}
                {node.issues && node.issues.length > 0 && (
                  <div>
                    <strong>Issues:</strong>
                    <ul className="list-disc list-inside mt-1 text-red-600 dark:text-red-400">
                      {node.issues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
} 