import Image from "next/image"

type BrandLogoProps = {
  variant?: "default" | "onDark"
  priority?: boolean
  className?: string
  alt?: string
}

export function BrandLogo({
  variant = "default",
  priority = false,
  className = "dz-logo",
  alt = "DzairBox",
}: BrandLogoProps) {
  return (
    <Image
      src={variant === "onDark" ? "/dzairbox-logo-on-dark.png" : "/dzairbox-logo.png"}
      alt={alt}
      width={2172}
      height={724}
      priority={priority}
      className={className}
    />
  )
}
