import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProfileImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
}

export function ProfileImage({ src, alt, className, fill = false }: ProfileImageProps) {
  if (!src) {
    return <div className={cn("bg-card", className)} aria-hidden="true" />;
  }

  if (fill) {
    return <Image src={src} alt={alt} fill className={cn("object-cover", className)} />;
  }

  return <Image src={src} alt={alt} width={1200} height={800} className={cn("h-full w-full object-cover", className)} />;
}
