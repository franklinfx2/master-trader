import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner = ({ className }: LoadingSpinnerProps) => {
  return (
    <div 
      className={cn(
        "h-8 w-8 rounded-full bg-gradient-to-r from-primary to-primary/60 animate-pulse",
        className
      )}
      style={{
        background: 'radial-gradient(circle, transparent 60%, hsl(var(--primary)) 60%)'
      }}
    />
  );
};

export default LoadingSpinner;
export { LoadingSpinner };