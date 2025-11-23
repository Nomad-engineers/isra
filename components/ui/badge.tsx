import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-isra-primary focus:ring-offset-2 hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "border-transparent gradient-primary text-white shadow-sm hover:shadow-md hover:shadow-isra-primary/20",
        secondary:
          "border-transparent bg-isra-medium/80 text-white backdrop-blur-sm hover:bg-isra-medium/90 hover:shadow-sm",
        destructive:
          "border-transparent bg-red-600/90 text-white hover:bg-red-700 hover:shadow-sm hover:shadow-red-600/20",
        outline: "text-white border-isra/50 bg-transparent hover:border-isra-primary hover:bg-isra-medium/30 hover:shadow-sm",
        success:
          "border-transparent bg-green-600/90 text-white hover:bg-green-700 hover:shadow-sm hover:shadow-green-600/20",
        warning:
          "border-transparent bg-orange-600/90 text-white hover:bg-orange-700 hover:shadow-sm hover:shadow-orange-600/20",
        info:
          "border-transparent bg-blue-600/90 text-white hover:bg-blue-700 hover:shadow-sm hover:shadow-blue-600/20",
        glass:
          "border-isra/30 bg-isra-dark/60 backdrop-blur-md text-white hover:bg-isra-medium/40 hover:border-isra-primary/50 hover:shadow-sm"
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