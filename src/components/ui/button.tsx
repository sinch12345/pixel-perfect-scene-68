import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] text-sm font-medium cursor-pointer transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-raised active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:transform-none motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        "hero-outline": "border border-hero-outline bg-hero-outline text-hero-foreground shadow-none hover:bg-hero-outline-hover hover:text-hero-foreground",
        heart: "rounded-full border border-border bg-surface/95 text-foreground shadow-card hover:bg-surface hover:text-primary",
        "card-link": "h-auto justify-between rounded-none border-t border-border bg-transparent px-0 py-3 text-primary shadow-none hover:bg-transparent hover:text-hero-hover",
        chip: "h-auto rounded-full border border-primary/15 bg-primary-soft text-primary shadow-none hover:bg-primary hover:text-primary-foreground",
        "gallery-thumb": "h-auto rounded-md border-2 border-transparent p-0 shadow-none hover:border-primary data-[pressed=true]:border-primary",
        newsletter: "rounded-l-none border border-newsletter-border bg-newsletter text-newsletter-foreground shadow-none hover:bg-newsletter-hover",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
