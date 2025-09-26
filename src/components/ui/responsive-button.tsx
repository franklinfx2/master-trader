import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResponsiveButtonProps extends ButtonProps {
  responsiveSize?: "sm" | "md" | "lg";
}

export const ResponsiveButton = React.forwardRef<HTMLButtonElement, ResponsiveButtonProps>(
  ({ className, responsiveSize = "md", ...props }, ref) => {
    const responsiveClasses = {
      sm: "btn-responsive text-xs px-2 py-1.5 sm:px-3 sm:py-2 min-h-[36px]",
      md: "btn-responsive text-sm px-3 py-2 sm:px-4 sm:py-2.5 min-h-[44px]",
      lg: "btn-responsive text-base px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8 lg:py-4 min-h-[48px]"
    };

    return (
      <Button
        ref={ref}
        className={cn(responsiveClasses[responsiveSize], className)}
        {...props}
      />
    );
  }
);

ResponsiveButton.displayName = "ResponsiveButton";