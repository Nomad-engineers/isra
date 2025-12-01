import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      // Better dark theme styling from WebinarSwitch
      "data-[state=unchecked]:bg-[#2a2a2a] data-[state=checked]:bg-[#7b2ff7]",
      "border data-[state=unchecked]:border-[#3a3a3a] data-[state=checked]:border-[#7b2ff7]",
      // Light theme fallbacks
      "data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:border-gray-300",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        // Better thumb styling from WebinarSwitch
        "bg-white border border-gray-300 data-[state=checked]:border-[#7b2ff7]",
        // Enhanced shadow for better visibility
        "shadow-md"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }