import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-isra-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-white hover:shadow-lg hover:shadow-isra-primary/25 hover:scale-105 active:scale-95 shadow-md before:absolute before:inset-0 before:bg-white/10 before:translate-x-full before:translate-y-full hover:before:translate-x-0 hover:before:translate-y-0 before:transition-transform before:duration-300",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/25 hover:scale-105 active:scale-95 shadow-md",
        outline:
          "border border-isra/50 bg-transparent text-white hover:bg-isra-medium/50 hover:border-isra-primary hover:shadow-md hover:scale-105 active:scale-95 backdrop-blur-sm",
        secondary:
          "bg-isra-medium/80 text-white hover:bg-isra-medium hover:shadow-lg hover:shadow-isra-primary/10 hover:scale-105 active:scale-95 shadow-md backdrop-blur-sm",
        ghost: "text-gray-300 hover:text-white hover:bg-isra-medium/30 hover:scale-105 active:scale-95 rounded-md",
        link: "text-isra-cyan hover:text-isra-primary underline-offset-4 hover:underline decoration-2 hover:decoration-isra-primary transition-all duration-200",
        glass: "bg-isra-dark/60 backdrop-blur-md border border-isra/30 text-white hover:bg-isra-medium/40 hover:border-isra-primary/50 hover:shadow-lg hover:shadow-isra-primary/10 hover:scale-105 active:scale-95"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }