import Image from "next/image";
import { cn } from "@/lib/utils";

/** Logo redonda pra órbita do login — um componente só, reusado com src/alt diferentes. */
export function OrbitLogo({
  src,
  alt,
  className,
  padding = "p-0.5",
}: {
  src: string;
  alt: string;
  className?: string;
  padding?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-full bg-white", className)} title={alt}>
      <Image src={src} alt={alt} fill sizes="48px" className={cn("object-contain", padding)} />
    </div>
  );
}
