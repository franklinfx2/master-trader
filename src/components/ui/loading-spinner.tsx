import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner = ({ className }: LoadingSpinnerProps) => {
  return (
    <div 
      className={cn(
        "relative h-8 w-8 rounded-full",
        "bg-gradient-to-r from-primary via-primary/60 to-primary",
        "animate-pulse",
        "before:content-[''] before:absolute before:inset-1 before:rounded-full before:bg-background",
        className
      )}
    />
  );
};