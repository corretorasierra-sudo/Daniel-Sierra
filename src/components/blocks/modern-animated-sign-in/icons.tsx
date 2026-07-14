import Image from "next/image";
import { cn } from "@/lib/utils";

/** Logo redonda pra órbita do login — um componente só, reusado com src/alt diferentes. Imagens já vêm recortadas quadradas, então preenche 100% da bolinha (object-cover, sem padding). */
export function OrbitLogo({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-full bg-white", className)} title={alt}>
      <Image src={src} alt={alt} fill sizes="48px" className="object-cover" />
    </div>
  );
}
