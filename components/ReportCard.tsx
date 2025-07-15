"use client"

interface ReportCardProps {
  title: string
  items: string[] | Array<{
    title: string
    description: string
    rationale: string
    example: string
    expected_impact: string
    priority?: 'high' | 'medium' | 'low'
  }> | Array<{
    action: string
    impact: string
    effort: 'low' | 'medium' | 'high'
  }>
  type: 'recommendations' | 'ai-recommendations' | 'quick-wins'
}

export default function ReportCard({ title, items, type }: ReportCardProps) {
  const renderItem = (item: any, index: number) => {
    switch (type) {
      case 'recommendations':
        return (
          <li key={index} className="flex items-start gap-2">
            <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <span>{item}</span>
          </li>
        )
      
      case 'ai-recommendations':
        return (
          <li key={index} className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{item.title}</h4>
              {item.priority && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.priority === 'high' ? 'bg-red-100 text-red-800' :
                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.priority} priority
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
            <p className="text-xs text-muted-foreground">{item.expected_impact}</p>
          </li>
        )
      
      case 'quick-wins':
        return (
          <li key={index} className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 mb-1">{item.action}</h4>
                <p className="text-green-700 text-sm">{item.impact}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ml-4 ${
                item.effort === 'low' ? 'bg-green-100 text-green-800' :
                item.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.effort} effort
              </span>
            </div>
          </li>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="rounded-lg border p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      
      <ul className="space-y-3">
        {items.map((item, index) => renderItem(item, index))}
      </ul>
    </div>
  )
} 