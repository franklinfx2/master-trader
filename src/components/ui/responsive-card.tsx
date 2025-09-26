import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: "mobile-stack" | "desktop-grid" | "auto-fit";
  spacing?: "compact" | "normal" | "spacious";
}

export const ResponsiveCard = React.forwardRef<HTMLDivElement, ResponsiveCardProps>(
  ({ className, layout = "auto-fit", spacing = "normal", ...props }, ref) => {
    const spacingClasses = {
      compact: "p-3 sm:p-4",
      normal: "p-4 sm:p-6",
      spacious: "p-6 sm:p-8"
    };

    return (
      <Card
        ref={ref}
        className={cn(
          spacingClasses[spacing],
          "transition-all duration-300 hover:shadow-lg",
          className
        )}
        {...props}
      />
    );
  }
);

ResponsiveCard.displayName = "ResponsiveCard";

// Responsive Card Grid Container
interface ResponsiveCardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  minWidth?: string;
}

export const ResponsiveCardGrid = React.forwardRef<HTMLDivElement, ResponsiveCardGridProps>(
  ({ className, columns = 3, minWidth = "280px", children, ...props }, ref) => {
    const gridClasses = {
      1: "grid-cols-1",
      2: "grid grid-cols-1 lg:grid-cols-2",
      3: "cards-responsive",
      4: "cards-responsive"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-4 lg:gap-6",
          gridClasses[columns],
          className
        )}
        style={{ gridTemplateColumns: columns > 2 ? `repeat(auto-fit, minmax(${minWidth}, 1fr))` : undefined }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveCardGrid.displayName = "ResponsiveCardGrid";