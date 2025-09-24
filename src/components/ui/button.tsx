import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon hover:shadow-orb transition-neural hover:scale-105 active:scale-95",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft hover:shadow-neural hover:scale-105 active:scale-95",
        outline: "border border-primary/20 bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/40 backdrop-blur-sm transition-smooth",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft hover:shadow-neural transition-smooth",
        ghost: "hover:bg-primary/10 hover:text-primary backdrop-blur-sm transition-smooth",
        link: "text-primary underline-offset-4 hover:underline text-cyber-blue hover:text-cyber-purple transition-smooth",
        // Cyberpunk Button Variants
        neural: "gradient-neural text-background hover:shadow-orb transition-neural hover:scale-105 active:scale-95 font-semibold",
        holographic: "gradient-holographic text-background hover:shadow-holographic transition-warp hover:scale-110 active:scale-95 font-semibold",
        cyber: "bg-cyber-blue text-background hover:bg-cyber-blue/90 shadow-neon hover:shadow-orb transition-smooth hover:scale-105 active:scale-95 font-semibold",
        ghost_cyber: "bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20 hover:bg-cyber-blue/20 hover:border-cyber-blue/40 transition-smooth font-medium backdrop-blur-sm",
        orb: "relative overflow-hidden bg-gradient-to-r from-cyber-blue to-cyber-purple text-background hover:from-cyber-purple hover:to-cyber-blue shadow-orb hover:shadow-neural transition-neural hover:scale-105 active:scale-95 font-semibold",
        premium: "gradient-primary text-primary-foreground hover:scale-105 transition-spring shadow-soft hover:shadow-neon active:scale-95 font-semibold",
        // Legacy Compatibility
        violet: "gradient-primary text-primary-foreground hover:scale-105 transition-spring shadow-soft hover:shadow-neon active:scale-95 font-semibold",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-lg px-4 py-2",
        lg: "h-14 rounded-xl px-8 py-4 text-lg",
        icon: "h-12 w-12",
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
