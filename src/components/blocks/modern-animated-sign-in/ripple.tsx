"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
}

/** Círculos concêntricos pulsando atrás da ilustração — puro CSS, sem dependência externa. */
export function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className,
}: RippleProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 select-none [mask-image:radial-gradient(circle_at_center,white,transparent_75%)]",
        className
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = Math.max(mainCircleOpacity - i * 0.03, 0.02);
        const borderOpacity = 10 + i * 6;

        const style: CSSProperties = {
          width: `${size}px`,
          height: `${size}px`,
          opacity,
          animationDelay: `${i * 0.15}s`,
          borderColor: `color-mix(in oklch, var(--sidebar-primary) ${borderOpacity}%, transparent)`,
        };

        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ripple rounded-full border bg-[var(--sidebar-primary)]/10"
            style={style}
          />
        );
      })}
    </div>
  );
}
