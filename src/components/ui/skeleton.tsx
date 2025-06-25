"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

// Card skeleton for sensor cards
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 border rounded-lg", className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// Table skeleton
function TableSkeleton({ rows = 5, cols = 4, className }: { 
  rows?: number; 
  cols?: number; 
  className?: string; 
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Chart skeleton
function ChartSkeleton({ className }: { className?: string }) {
  // Use deterministic heights to avoid hydration mismatches
  const heights = [65, 45, 80, 35, 70, 55, 90, 40, 75, 60, 85, 50];
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="h-64 flex items-end space-x-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1" 
            style={{ height: `${heights[i]}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Map skeleton
function MapSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative bg-gray-100 rounded-lg overflow-hidden", className)}>
      <Skeleton className="w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading map...</div>
      </div>
    </div>
  );
}

// Grid skeleton for sensor cards
function SensorGridSkeleton({ count = 5, className }: { 
  count?: number; 
  className?: string; 
}) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-5 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export { 
  Skeleton, 
  CardSkeleton, 
  TableSkeleton, 
  ChartSkeleton, 
  MapSkeleton, 
  SensorGridSkeleton 
}
