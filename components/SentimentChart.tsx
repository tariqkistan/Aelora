"use client"

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface SentimentDataPoint {
  date: string
  sentimentScore: number
  mentions: number
  timestamp: string
}

interface SentimentChartProps {
  data: SentimentDataPoint[]
}

export default function SentimentChart({ data }: SentimentChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null)

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Prepare chart data
  const chartData = {
    labels: data.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Sentiment Score',
        data: data.map(item => item.sentimentScore),
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'hsl(var(--primary))',
        pointBorderColor: 'hsl(var(--background))',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'hsl(var(--popover))',
        titleColor: 'hsl(var(--popover-foreground))',
        bodyColor: 'hsl(var(--popover-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const dataPoint = data[context[0].dataIndex]
            return new Date(dataPoint.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          },
          label: (context: any) => {
            const dataPoint = data[context.dataIndex]
            const sentimentPercent = (context.parsed.y * 100).toFixed(1)
            return [
              `Sentiment: ${sentimentPercent}%`,
              `Mentions: ${dataPoint.mentions}`,
            ]
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 12,
          },
          maxTicksLimit: 8,
        },
      },
      y: {
        min: -1,
        max: 1,
        grid: {
          color: 'hsl(var(--border) / 0.5)',
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return `${(value * 100).toFixed(0)}%`
          },
          stepSize: 0.2,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    elements: {
      point: {
        hoverBackgroundColor: 'hsl(var(--primary))',
        hoverBorderColor: 'hsl(var(--background))',
      },
    },
  }

  // Add reference lines for sentiment thresholds
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    const ctx = chart.ctx
    const chartArea = chart.chartArea

    if (!chartArea) return

    // Add custom drawing for reference lines
    const originalDraw = chart.draw
    chart.draw = function() {
      originalDraw.call(this)
      
      ctx.save()
      
      // Positive threshold line (60%)
      const positiveY = chart.scales.y.getPixelForValue(0.6)
      ctx.strokeStyle = 'hsl(var(--green-500) / 0.3)'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(chartArea.left, positiveY)
      ctx.lineTo(chartArea.right, positiveY)
      ctx.stroke()
      
      // Negative threshold line (-20%)
      const negativeY = chart.scales.y.getPixelForValue(-0.2)
      ctx.strokeStyle = 'hsl(var(--red-500) / 0.3)'
      ctx.beginPath()
      ctx.moveTo(chartArea.left, negativeY)
      ctx.lineTo(chartArea.right, negativeY)
      ctx.stroke()
      
      // Neutral line (0%)
      const neutralY = chart.scales.y.getPixelForValue(0)
      ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.2)'
      ctx.setLineDash([2, 2])
      ctx.beginPath()
      ctx.moveTo(chartArea.left, neutralY)
      ctx.lineTo(chartArea.right, neutralY)
      ctx.stroke()
      
      ctx.restore()
    }

    return () => {
      if (chart) {
        chart.draw = originalDraw
      }
    }
  }, [data])

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground">
        <p>No sentiment data available</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="h-80">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-green-500 opacity-30"></div>
          <span>Positive (60%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-gray-400 opacity-30"></div>
          <span>Neutral (0%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-red-500 opacity-30"></div>
          <span>Negative (-20%)</span>
        </div>
      </div>
    </div>
  )
} 