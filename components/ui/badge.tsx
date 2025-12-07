import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground backdrop-blur-sm hover:bg-secondary/80 hover:shadow-sm",
        destructive:
          "border-transparent bg-red-600 text-white hover:bg-red-700 hover:shadow-sm hover:shadow-red-600/20",
        outline: "text-foreground border-border bg-transparent hover:border-primary hover:bg-muted hover:shadow-sm",
        success:
          "border-transparent bg-green-600 text-white hover:bg-green-700 hover:shadow-sm hover:shadow-green-600/20",
        warning:
          "border-transparent bg-orange-600 text-white hover:bg-orange-700 hover:shadow-sm hover:shadow-orange-600/20",
        info:
          "border-transparent bg-blue-600 text-white hover:bg-blue-700 hover:shadow-sm hover:shadow-blue-600/20",
        glass:
          "border-border bg-card/60 backdrop-blur-md text-card-foreground hover:bg-muted hover:border-primary/50 hover:shadow-sm",
        blue:
          "border-transparent bg-blue-600 text-white hover:bg-blue-700 hover:shadow-sm hover:shadow-blue-600/20",
        green:
          "border-transparent bg-green-600 text-white hover:bg-green-700 hover:shadow-sm hover:shadow-green-600/20"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }