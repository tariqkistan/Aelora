interface MiniChartProps {
  type: 'bar' | 'line' | 'donut'
  data: number[]
  labels?: string[]
  color?: string
  height?: number
  showValues?: boolean
}

export default function MiniChart({ 
  type, 
  data, 
  labels, 
  color = '#3b82f6',
  height = 60,
  showValues = false 
}: MiniChartProps) {
  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  
  const renderBarChart = () => {
    return (
      <div className="flex items-end justify-between h-full gap-1">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full rounded-t transition-all duration-500 ease-out"
              style={{
                height: `${(value / maxValue) * 100}%`,
                backgroundColor: color,
                opacity: 0.8
              }}
            />
            {showValues && (
              <span className="text-xs text-muted-foreground mt-1">
                {value}
              </span>
            )}
            {labels && labels[index] && (
              <span className="text-xs text-muted-foreground mt-1">
                {labels[index]}
              </span>
            )}
          </div>
        ))}
      </div>
    )
  }
  
  const renderLineChart = () => {
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - minValue) / (maxValue - minValue)) * 100
      return `${x},${y}`
    }).join(' ')
    
    return (
      <svg width="100%" height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          className="transition-all duration-500"
        />
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - ((value - minValue) / (maxValue - minValue)) * 100
          return (
            <circle
              key={index}
              cx={`${x}%`}
              cy={`${y}%`}
              r="3"
              fill={color}
              className="transition-all duration-500"
            />
          )
        })}
      </svg>
    )
  }
  
  const renderDonutChart = () => {
    const total = data.reduce((sum, value) => sum + value, 0)
    let cumulativePercentage = 0
    
    const radius = 20
    const circumference = 2 * Math.PI * radius
    
    return (
      <div className="flex items-center justify-center">
        <svg width={height} height={height} className="transform -rotate-90">
          <circle
            cx={height / 2}
            cy={height / 2}
            r={radius}
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          {data.map((value, index) => {
            const percentage = (value / total) * 100
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
            const strokeDashoffset = -((cumulativePercentage / 100) * circumference)
            
            cumulativePercentage += percentage
            
            return (
              <circle
                key={index}
                cx={height / 2}
                cy={height / 2}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth="4"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
                style={{
                  filter: `hue-rotate(${index * 60}deg)`
                }}
              />
            )
          })}
        </svg>
        {showValues && (
          <div className="absolute text-center">
            <div className="text-lg font-bold">{total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="w-full" style={{ height }}>
      {type === 'bar' && renderBarChart()}
      {type === 'line' && renderLineChart()}
      {type === 'donut' && renderDonutChart()}
    </div>
  )
} 