"use client"

interface ReportCardProps {
  title: string
  items: string[]
}

export default function ReportCard({ title, items }: ReportCardProps) {
  return (
    <div className="rounded-lg border p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      
      <ul className="space-y-3">
        {items.map((item, index) => (
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
        ))}
      </ul>
    </div>
  )
} 