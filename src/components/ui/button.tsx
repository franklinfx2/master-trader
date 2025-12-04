import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "rounded-[20px] bg-primary text-primary-foreground shadow-[0_4px_15px_rgba(77,139,255,0.25)] hover:bg-primary/90 hover:shadow-[0_6px_20px_rgba(77,139,255,0.35)] hover:-translate-y-0.5 active:translate-y-0",
        destructive: "rounded-[20px] bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90 hover:shadow-medium",
        outline: "rounded-[20px] border border-primary/30 bg-transparent text-primary hover:bg-primary/8 hover:border-primary/50 backdrop-blur-sm",
        secondary: "rounded-[20px] bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft",
        ghost: "rounded-[20px] hover:bg-primary/8 hover:text-primary backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline",
        // Premium variants
        premium: "rounded-[20px] bg-primary text-primary-foreground shadow-[0_4px_15px_rgba(77,139,255,0.25)] hover:bg-primary/90 hover:shadow-[0_6px_20px_rgba(77,139,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 font-semibold",
        neural: "rounded-[20px] bg-gradient-to-r from-primary to-[hsl(230,65%,55%)] text-white shadow-[0_4px_20px_rgba(77,139,255,0.3)] hover:shadow-[0_6px_25px_rgba(77,139,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 font-semibold",
        holographic: "rounded-[20px] bg-gradient-to-r from-primary via-profit to-[hsl(262,83%,58%)] text-white shadow-[0_4px_20px_rgba(77,139,255,0.25)] hover:shadow-[0_6px_25px_rgba(77,139,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 font-semibold",
        cyber: "rounded-[20px] bg-primary text-primary-foreground shadow-[0_4px_15px_rgba(77,139,255,0.25)] hover:bg-primary/90 hover:shadow-[0_6px_20px_rgba(77,139,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 font-semibold",
        ghost_cyber: "rounded-[20px] border border-primary/30 bg-transparent text-primary hover:bg-primary/8 hover:border-primary/50 backdrop-blur-sm font-medium",
        orb: "rounded-[20px] relative overflow-hidden bg-gradient-to-r from-primary to-[hsl(262,83%,58%)] text-white shadow-[0_4px_20px_rgba(77,139,255,0.3)] hover:from-[hsl(262,83%,58%)] hover:to-primary hover:shadow-[0_6px_25px_rgba(77,139,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 font-semibold",
        violet: "rounded-[20px] bg-gradient-to-r from-primary to-[hsl(262,83%,58%)] text-white shadow-[0_4px_20px_rgba(77,139,255,0.3)] hover:shadow-[0_6px_25px_rgba(77,139,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 font-semibold",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-[16px] px-4 py-2",
        lg: "h-12 rounded-[22px] px-8 py-3 text-base",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
