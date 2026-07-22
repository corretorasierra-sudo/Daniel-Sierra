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
      <div
        className="w-fit"
        style={{ transform: `translateX(${radius}px) translateY(-50%) translateX(-50%)` }}
      >
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

/**
 * Ícones orbitando em círculos concêntricos ao redor do monograma central.
 * O anel inteiro (linhas + ícones) fica inclinado num plano 3D (perspective +
 * rotateX) — a perspectiva do navegador já cuida de encolher/aumentar cada
 * ícone conforme ele passa por trás ou pela frente do centro. O monograma
 * central fica fora da inclinação, sempre de frente pra câmera.
 */
export function TechOrbitDisplay({ iconsArray }: { iconsArray: OrbitIcon[] }) {
  const raios = Array.from(new Set(iconsArray.map((icon) => icon.radius ?? 100))).sort(
    (a, b) => a - b
  );

  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      style={{ perspective: "1200px" }}
    >
      <div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", transform: "rotateX(62deg)" }}
      >
        {raios.map((raio) => (
          <div
            key={raio}
            className="absolute top-1/2 left-1/2 rounded-full border border-[var(--sidebar-primary)]/15"
            style={{ width: raio * 2, height: raio * 2, transform: "translate(-50%, -50%)" }}
          />
        ))}

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

      <div className="relative z-10 size-16 overflow-hidden rounded-2xl shadow-lg">
        <Image src="/logo-guarabira-icone.png" alt="Cartão de Todos Guarabira" fill sizes="64px" className="object-cover" />
      </div>
    </div>
  );
}
