'use client'

import { useRelief } from '@/lib/store'
import { formatTime } from '@/lib/format'
import type { ActivityKind } from '@/lib/types'

const KIND_LABEL: Record<ActivityKind, string> = {
  report: 'Report',
  review: 'Review',
  pledge: 'Pledge',
  stock: 'Stock',
  delivery: 'Delivery',
}

export function ActivityLog() {
  const { data } = useRelief()
  const items = [...data.activity].sort((a, b) => b.at.localeCompare(a.at))
  return (
    <section aria-label="Activity history">
      <ol className="flex flex-col divide-y rounded-xl border bg-card">
        {items.map((a) => (
          <li key={a.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
            <div className="flex shrink-0 items-center gap-2 sm:w-56 sm:flex-col sm:items-start sm:gap-0.5">
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
                {KIND_LABEL[a.kind]}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(a.at)} &middot; {a.actor}
              </span>
            </div>
            <p className="text-sm">{a.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
