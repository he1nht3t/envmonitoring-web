"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
    />
  );
}

// Loading overlay component
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerSize?: "sm" | "md" | "lg" | "xl";
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  className,
  spinnerSize = "lg" 
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <Spinner size={spinnerSize} />
        </div>
      )}
    </div>
  );
}

// Inline loading component
interface InlineLoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function InlineLoading({ 
  text = "Loading...", 
  size = "md", 
  className 
}: InlineLoadingProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Spinner size={size} />
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}

// Pulsing dot animation
export function PulsingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
    </div>
  );
}