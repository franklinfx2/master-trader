import * as React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  minWidth?: string;
  stackOnMobile?: boolean;
}

export const ResponsiveTable = React.forwardRef<HTMLTableElement, ResponsiveTableProps>(
  ({ className, minWidth = "600px", stackOnMobile = false, children, ...props }, ref) => {
    return (
      <div className="table-responsive">
        <table
          ref={ref}
          className={cn(
            "w-full caption-bottom text-sm",
            stackOnMobile && "sm:table hidden",
            className
          )}
          style={{ minWidth }}
          {...props}
        >
          {children}
        </table>
        
        {stackOnMobile && (
          <div className="sm:hidden space-y-4">
            {/* Mobile stacked view will be handled by parent component */}
            {children}
          </div>
        )}
      </div>
    );
  }
);

ResponsiveTable.displayName = "ResponsiveTable";

// Mobile Card View for Tables
interface MobileTableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, any>;
  fields: Array<{ key: string; label: string; render?: (value: any) => React.ReactNode }>;
}

export const MobileTableCard = React.forwardRef<HTMLDivElement, MobileTableCardProps>(
  ({ className, data, fields, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border rounded-lg p-4 space-y-2 bg-card",
          className
        )}
        {...props}
      >
        {fields.map((field) => (
          <div key={field.key} className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">
              {field.label}:
            </span>
            <span className="text-sm">
              {field.render ? field.render(data[field.key]) : data[field.key]}
            </span>
          </div>
        ))}
      </div>
    );
  }
);

MobileTableCard.displayName = "MobileTableCard";