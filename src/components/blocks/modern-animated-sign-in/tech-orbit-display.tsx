"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface OrbitIcon {
  component: () => ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  reverse?: boolean;
}

function OrbitingIcon({
  children,
  className,
  duration = 20,
  delay = 0,
  radius = 160,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  radius?: number;
  reverse?: boolean;
}) {
  const animStyle: CSSProperties = {
    animationDuration: `${duration}s`,
    animationDelay: `${-delay}s`,
    animationDirection: reverse ? "reverse" : "normal",
  };

  return (
    <div className="absolute top-1/2 left-1/2 size-0 animate-orbit-spin" style={animStyle}>
      <div className="w-fit" style={{ transform: `translateX(${radius}px)` }}>
        <div className="w-fit animate-orbit-counter" style={animStyle}>
          <div
            className={cn(
              "flex items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-1.5 shadow-md",
              className
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Ícones orbitando em círculos concêntricos ao redor do monograma central. */
export function TechOrbitDisplay({ iconsArray }: { iconsArray: OrbitIcon[] }) {
  const raios = Array.from(new Set(iconsArray.map((icon) => icon.radius ?? 100))).sort(
    (a, b) => a - b
  );

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {raios.map((raio) => (
        <div
          key={raio}
          className="absolute rounded-full border border-[var(--sidebar-primary)]/15"
          style={{ width: raio * 2, height: raio * 2 }}
        />
      ))}

      <div className="relative z-10 size-16 overflow-hidden rounded-2xl shadow-lg">
        <Image src="/logo-guarabira-icone.png" alt="Cartão de Todos Guarabira" fill sizes="64px" className="object-cover" />
      </div>

      {iconsArray.map((icon, index) => (
        <OrbitingIcon
          key={index}
          className={icon.className}
          duration={icon.duration}
          delay={icon.delay}
          radius={icon.radius}
          reverse={icon.reverse}
        >
          {icon.component()}
        </OrbitingIcon>
      ))}
    </div>
  );
}
