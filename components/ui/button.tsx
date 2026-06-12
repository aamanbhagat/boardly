import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[background,color,border-color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-fg shadow-card hover:bg-primary-hover hover:shadow-card-hover active:translate-y-px",
        accent:
          "bg-accent text-accent-fg shadow-card hover:bg-accent-hover hover:shadow-card-hover active:translate-y-px",
        secondary:
          "border border-border-strong bg-surface text-fg hover:bg-bg-alt",
        soft:
          "bg-primary-soft text-primary hover:bg-primary-soft/70",
        ghost: "text-fg hover:bg-bg-alt",
        link: "text-primary underline-offset-4 hover:underline rounded-md",
        outline:
          "border border-border-strong bg-transparent hover:bg-bg-alt",
      },
      size: {
        sm: "h-8 px-3.5",
        md: "h-10 px-5",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
