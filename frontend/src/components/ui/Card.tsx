import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md border border-line bg-paper-raised/60",
        className
      )}
      {...rest}
    />
  );
}
