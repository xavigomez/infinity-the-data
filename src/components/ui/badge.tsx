import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 leading-none select-none whitespace-nowrap",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-primary text-primary-foreground ",
        secondary: "border-transparent bg-secondary text-secondary-foreground ",
        reverse: "bg-foreground text-background border-transparent",
        transparent: "bg-transparent text-foreground border-transparent",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
