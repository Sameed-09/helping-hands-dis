import type { ReactNode } from 'react'
import {
  CircleCheck,
  CircleX,
  Clock,
  Eye,
  Info,
  OctagonAlert,
  PackageCheck,
  Truck,
  TriangleAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  DeliveryStatus,
  PledgeStatus,
  RequestStatus,
  Severity,
  Urgency,
} from '@/lib/types'
import { SEVERITY, URGENCY } from '@/lib/supply'

export const inputClass =
  'h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:opacity-60'

export const textareaClass =
  'min-h-20 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring'

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function Pill({
  className,
  children,
}: {
  className: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3.5',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const map = {
    severe: { cls: 'bg-severe-soft text-severe', icon: <OctagonAlert aria-hidden /> },
    affected: { cls: 'bg-affected-soft text-[#7a5a00]', icon: <TriangleAlert aria-hidden /> },
    monitoring: { cls: 'bg-monitor-soft text-monitor', icon: <Eye aria-hidden /> },
  }[severity]
  return (
    <Pill className={map.cls}>
      {map.icon}
      {SEVERITY[severity].label}
    </Pill>
  )
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const cls = {
    critical: 'bg-severe text-white',
    high: 'bg-warm-soft text-warm',
    medium: 'bg-muted text-muted-foreground',
  }[urgency]
  return <Pill className={cls}>{URGENCY[urgency].label} urgency</Pill>
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  if (status === 'pending')
    return (
      <Pill className="bg-affected-soft text-[#7a5a00]">
        <Clock aria-hidden />
        Pending verification
      </Pill>
    )
  if (status === 'verified')
    return (
      <Pill className="bg-monitor-soft text-monitor">
        <CircleCheck aria-hidden />
        Verified by coordinator
      </Pill>
    )
  return (
    <Pill className="bg-severe-soft text-severe">
      <CircleX aria-hidden />
      Rejected
    </Pill>
  )
}

export function PledgeStatusBadge({ status }: { status: PledgeStatus }) {
  const map: Record<PledgeStatus, { cls: string; icon: ReactNode; label: string }> = {
    pending: {
      cls: 'bg-affected-soft text-[#7a5a00]',
      icon: <Clock aria-hidden />,
      label: 'Pending review',
    },
    verified: {
      cls: 'bg-brand-soft text-brand',
      icon: <CircleCheck aria-hidden />,
      label: 'Verified, awaiting receipt',
    },
    received: {
      cls: 'bg-monitor-soft text-monitor',
      icon: <PackageCheck aria-hidden />,
      label: 'Received into stock',
    },
    rejected: {
      cls: 'bg-severe-soft text-severe',
      icon: <CircleX aria-hidden />,
      label: 'Rejected',
    },
  }
  const m = map[status]
  return (
    <Pill className={m.cls}>
      {m.icon}
      {m.label}
    </Pill>
  )
}

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const map: Record<DeliveryStatus, { cls: string; icon: ReactNode; label: string }> = {
    assigned: {
      cls: 'bg-muted text-muted-foreground',
      icon: <Clock aria-hidden />,
      label: 'Assigned, not dispatched',
    },
    dispatched: {
      cls: 'bg-brand-soft text-brand',
      icon: <Truck aria-hidden />,
      label: 'Dispatched',
    },
    delivered: {
      cls: 'bg-monitor-soft text-monitor',
      icon: <PackageCheck aria-hidden />,
      label: 'Delivered',
    },
  }
  const m = map[status]
  return (
    <Pill className={m.cls}>
      {m.icon}
      {m.label}
    </Pill>
  )
}

export function Notice({
  children,
  tone = 'info',
}: {
  children: ReactNode
  tone?: 'info' | 'warn'
}) {
  return (
    <p
      className={cn(
        'flex items-start gap-2 rounded-lg px-3 py-2 text-sm [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0',
        tone === 'info'
          ? 'bg-brand-soft text-brand'
          : 'bg-affected-soft text-[#6b4d00]',
      )}
    >
      <Info aria-hidden />
      <span>{children}</span>
    </p>
  )
}

export function EmptyState({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <div className="rounded-xl border border-dashed bg-card px-4 py-8 text-center">
      <p className="font-semibold">{title}</p>
      {children ? (
        <div className="mt-1 text-sm text-muted-foreground">{children}</div>
      ) : null}
    </div>
  )
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="text-sm font-medium text-destructive">
      {message}
    </p>
  )
}
