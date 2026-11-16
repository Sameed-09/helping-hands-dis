import Image from 'next/image'
import { cn } from '@/lib/utils'

export const TAGLINE = 'No Need Too Big, No Help Too Far'

export function LogoMark({
  size = 40,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <Image
      src="/logo-icon.png"
      alt=""
      width={size}
      height={size}
      className={cn('shrink-0 rounded-full', className)}
      priority
    />
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoMark size={44} />
      <div className="leading-tight">
        <p className="text-lg font-bold tracking-tight text-foreground">
          Helping Hands
        </p>
        <p className="hidden text-xs text-muted-foreground sm:block">
          {TAGLINE}
        </p>
      </div>
    </div>
  )
}

export function FullLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-full.jpg"
      alt="Helping Hands logo: two hands exchanging a box marked with a heart. No Need Too Big, No Help Too Far."
      width={502}
      height={685}
      className={cn('h-auto w-full', className)}
      priority
    />
  )
}
