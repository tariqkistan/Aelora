"use client"

interface LoaderProps {
  message?: string
}

export default function Loader({ message = "Loading..." }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
      <p className="text-lg font-medium">{message}</p>
      <p className="text-sm text-muted-foreground">This may take a few moments</p>
    </div>
  )
} 